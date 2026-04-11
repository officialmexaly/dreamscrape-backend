'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { cn } from '@/src/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  onLogout: () => void
}

const SIDEBAR_STORAGE_KEY = 'dreamscape_admin_sidebarCollapsed'
const SIDEBAR_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 80

export function Layout({ children, onLogout }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
      setIsSidebarCollapsed(raw === 'true')
    } catch {
      // ignore
    }
  }, [])

  const toggleSidebar = React.useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  return (
    <div className="min-h-screen" suppressHydrationWarning>
      <Sidebar
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
      />

      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          isSidebarCollapsed ? "ml-20" : "ml-[260px]"
        )}
        suppressHydrationWarning
      >
        <TopBar />
        <main className="px-5 py-6 md:px-8 md:py-8" suppressHydrationWarning>
          <div className="mx-auto max-w-7xl" suppressHydrationWarning>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_20px_70px_rgba(16,24,40,0.08)] backdrop-blur md:p-8"
              suppressHydrationWarning
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
