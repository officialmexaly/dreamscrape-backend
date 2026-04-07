'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import type { Session } from 'next-auth'

type AdminSession = Session & {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  user: AdminSession['user'] | null
  login: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const isAuthenticated = !!session
  const isLoading = status === 'loading'
  const isAdmin = session?.user?.role === 'admin'
  const user = session?.user || null

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      isAdmin,
      user,
      login: () => {
        // Login is handled by the login page calling signIn()
        // This is just a placeholder for compatibility
      },
      logout: async () => {
        await signOut({ callbackUrl: '/admin/login' })
      },
    }),
    [isAuthenticated, isLoading, isAdmin, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
