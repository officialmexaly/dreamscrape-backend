/**
 * Production-ready NextAuth v5 configuration
 * Enhanced with security features, audit logging, and account lockout
 */

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import {
  getUserWithPasswordByEmail,
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
  isUserLocked,
} from './src/lib/user-service'
import { verifyPassword } from './src/lib/password'
import {
  createAuditLog,
  AuditEventType,
  AuditEventCategory,
} from './src/lib/audit-log'
import { checkRateLimitByEmail } from './src/lib/rate-limit-auth'

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Credentials({
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (rawCredentials, req) => {
        const ipAddress = req?.headers?.get('x-forwarded-for')?.split(',')[0] ||
                         req?.headers?.get('x-real-ip') ||
                         'unknown'
        const userAgent = req?.headers?.get('user-agent') || 'unknown'

        try {
          // Validate input format
          const parsed = credentialsSchema.safeParse(rawCredentials)
          if (!parsed.success) {
            await createAuditLog({
              eventType: AuditEventType.LOGIN_FAILED,
              category: AuditEventCategory.AUTH,
              eventData: {
                reason: 'Invalid input format',
              },
              ipAddress,
              userAgent,
            })
            return null
          }

          const { email, password } = parsed.data

          // Check rate limit
          const rateLimit = await checkRateLimitByEmail(email, 'login')
          if (!rateLimit.allowed) {
            await createAuditLog({
              eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
              category: AuditEventCategory.SECURITY,
              userEmail: email,
              eventData: {
                reason: rateLimit.error,
              },
              ipAddress,
              userAgent,
            })
            throw new Error(rateLimit.error || 'Too many login attempts. Please try again later.')
          }

          // Get user from database
          const user = await getUserWithPasswordByEmail(email)

          if (!user) {
            // Record failed attempt (for security monitoring)
            await createAuditLog({
              eventType: AuditEventType.LOGIN_FAILED,
              category: AuditEventCategory.AUTH,
              userEmail: email,
              eventData: {
                reason: 'User not found',
              },
              ipAddress,
              userAgent,
            })
            return null
          }

          // Check if account is locked
          const locked = await isUserLocked(user.id)
          if (locked) {
            await createAuditLog({
              eventType: AuditEventType.LOGIN_FAILED,
              category: AuditEventCategory.SECURITY,
              userId: user.id,
              userEmail: email,
              eventData: {
                reason: 'Account locked',
              },
              ipAddress,
              userAgent,
            })
            throw new Error('Account is temporarily locked due to multiple failed login attempts. Please try again later or contact an administrator.')
          }

          // Check if account is active
          if (!user.is_active) {
            await createAuditLog({
              eventType: AuditEventType.LOGIN_FAILED,
              category: AuditEventCategory.AUTH,
              userId: user.id,
              userEmail: email,
              eventData: {
                reason: 'Account inactive',
              },
              ipAddress,
              userAgent,
            })
            throw new Error('Account is not active. Please contact an administrator.')
          }

          // Verify password
          const isValidPassword = await verifyPassword(password, user.password_hash)

          if (!isValidPassword) {
            // Record failed login attempt
            const { isLocked: nowLocked } = await recordFailedLoginAttempt(user.id, ipAddress)

            await createAuditLog({
              eventType: AuditEventType.LOGIN_FAILED,
              category: AuditEventCategory.AUTH,
              userId: user.id,
              userEmail: email,
              eventData: {
                reason: 'Invalid password',
                failedAttempts: (user.failed_login_attempts || 0) + 1,
                isLocked: nowLocked,
              },
              ipAddress,
              userAgent,
            })

            if (nowLocked) {
              throw new Error('Account has been locked due to multiple failed login attempts. Please contact an administrator.')
            }

            return null
          }

          // Successful login - reset failed attempts
          await resetFailedLoginAttempts(user.id)

          // Log successful login
          await createAuditLog({
            eventType: AuditEventType.LOGIN_SUCCESS,
            category: AuditEventCategory.AUTH,
            userId: user.id,
            userEmail: email,
            eventData: {},
            success: true,
            ipAddress,
            userAgent,
          })

          // Return user object
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          if (error instanceof Error) {
            // Re-throw known errors (like rate limit or lock messages)
            if (error.message.includes('Too many login attempts') ||
                error.message.includes('locked') ||
                error.message.includes('not active')) {
              throw error
            }
          }
          console.error('Authorization error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.email = user.email
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
