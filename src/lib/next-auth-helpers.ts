'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import type { Session } from 'next-auth'

/**
 * Admin authentication utilities for NextAuth v5
 */

/**
 * Sign in with admin credentials
 */
export async function adminSignIn(
  email: string,
  password: string,
  callbackUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      return { success: false, error: result.error }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' }
  }
}

/**
 * Sign out the current admin user
 */
export async function adminSignOut(callbackUrl?: string): Promise<void> {
  await signOut({ redirect: false, callbackUrl })
  if (callbackUrl) {
    window.location.href = callbackUrl
  }
}

/**
 * Hook to get admin session with role checking
 */
export function useAdminSession() {
  const { data: session, status } = useSession()

  const isAdmin = session?.user?.role === 'admin'
  const isLoading = status === 'loading'
  const isAuthenticated = !!session

  return {
    session,
    isAdmin,
    isAuthenticated,
    isLoading,
  }
}

/**
 * Hook to require admin authentication - throws error if not admin
 */
export function useRequireAdmin(): Session & { user: { role: string } } {
  const { session, isAdmin, isLoading } = useAdminSession()

  if (isLoading) {
    throw new Error('Loading session...')
  }

  if (!isAdmin) {
    throw new Error('Admin authentication required')
  }

  return session as Session & { user: { role: string } }
}

/**
 * Server-side helper to get current session
 */
export async function getCurrentSession() {
  const { auth } = await import('@/auth')
  return await auth()
}

/**
 * Server-side helper to require admin session
 */
export async function requireAdminSession() {
  const { auth } = await import('@/auth')
  const session = await auth()

  if (!session || !session.user || session.user.role !== 'admin') {
    throw new Error('Admin authentication required')
  }

  return session
}
