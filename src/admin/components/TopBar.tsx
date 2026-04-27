'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Bell, LogOut, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/src/admin/toast/ToastProvider'
import { useAuth } from '@/src/admin/providers/GolangAuthProvider'

function getPageTitle(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const section = segments[1] || 'dashboard'
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    events: 'Events',
    services: 'Services',
    blog: 'Blog',
    inquiries: 'Inquiries',
    media: 'Media',
    content: 'Site Content',
    settings: 'Settings',
    users: 'Users',
  }
  return labels[section] || section.charAt(0).toUpperCase() + section.slice(1)
}

interface TopBarProps {
  onMobileMenuToggle?: () => void
}

export function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const userName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email?.split('@')[0] || 'Admin'
  const userEmail = user?.email || 'admin@dreamscape.com'

  const handleLogout = async () => {
    try {
      await logout()
      toast({ title: 'Logged out', variant: 'success', duration: 2000 })
    } catch {
      toast({ title: 'Error logging out', variant: 'error', duration: 3000 })
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/70 backdrop-blur">
      <div className="flex h-16 md:h-[72px] items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            className="md:hidden rounded-full flex-shrink-0"
            onClick={onMobileMenuToggle}
          >
            <Menu size={20} />
          </Button>
          <div className="min-w-0">
            <div className="truncate font-serif text-lg md:text-xl font-semibold text-foreground">
              {getPageTitle(pathname)}
            </div>
            <div className="mt-0.5 hidden truncate text-xs text-muted-foreground md:block">
              {userName} • {userEmail}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden w-[240px] lg:w-[320px] lg:block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search…"
              className="h-9 rounded-full pl-9"
              aria-label="Search"
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="rounded-full h-10 w-10 md:h-auto md:w-auto"
          >
            <Bell size={18} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Log out"
            className="rounded-full h-10 w-10 md:h-auto md:w-auto"
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  )
}

