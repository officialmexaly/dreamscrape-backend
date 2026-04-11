'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Bell, LogOut, Search } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/src/admin/toast/ToastProvider'

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

export function TopBar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { toast } = useToast()

  const userName = session?.user?.name || 'Admin'
  const userEmail = session?.user?.email || 'admin@dreamscape.com'

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/admin/login' })
      toast({ title: 'Logged out', variant: 'success', duration: 2000 })
    } catch {
      toast({ title: 'Error logging out', variant: 'error', duration: 3000 })
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/70 backdrop-blur">
      <div className="flex h-[72px] items-center justify-between px-5 md:px-8">
        <div className="min-w-0">
          <div className="truncate font-serif text-xl font-semibold text-foreground">
            {getPageTitle(pathname)}
          </div>
          <div className="mt-1 hidden truncate text-xs text-muted-foreground md:block">
            {userName} • {userEmail}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative hidden w-[320px] md:block">
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
            className="rounded-full"
          >
            <Bell size={18} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Log out"
            className="rounded-full"
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  )
}

