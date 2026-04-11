'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Layout as LayoutIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/src/lib/utils'

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Events', path: '/admin/events', icon: Calendar },
  { name: 'Services', path: '/admin/services', icon: Briefcase },
  { name: 'Blog Posts', path: '/admin/blog', icon: FileText },
  { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
  { name: 'Media', path: '/admin/media', icon: ImageIcon },
  { name: 'Site Content', path: '/admin/content', icon: LayoutIcon },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
] as const

interface SidebarProps {
  onLogout: () => void
  isCollapsed?: boolean
  onToggleCollapsed?: () => void
}

export function Sidebar({
  onLogout,
  isCollapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-20 flex h-screen flex-col border-r border-border/70 bg-background/75 shadow-[0_10px_34px_rgba(15,23,42,0.08)] backdrop-blur',
        isCollapsed ? 'w-20' : 'w-[260px]'
      )}
    >
      <div className={cn('relative border-b border-border/70 p-6', isCollapsed && 'px-4')}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-serif text-xl font-bold text-primary">
              {isCollapsed ? 'D' : 'Dreamscape'}
            </div>
            {!isCollapsed ? (
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Admin Portal
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleCollapsed}
          disabled={!onToggleCollapsed}
          className="absolute right-[-14px] top-[88px] grid h-8 w-8 place-items-center rounded-full border border-border bg-background shadow-[0_10px_20px_rgba(15,23,42,0.12)] transition hover:bg-muted disabled:opacity-60"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path === '/admin/blog' && pathname.startsWith('/admin/blog/'))

          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.path}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'border-primary/15 bg-[linear-gradient(135deg,rgba(64,21,63,0.12)_0%,rgba(201,168,76,0.10)_100%)] text-primary'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'grid h-[34px] w-[34px] place-items-center rounded-lg bg-muted text-foreground/80 transition group-hover:text-primary',
                  isActive && 'bg-background/80 text-primary'
                )}
              >
                <Icon size={18} />
              </span>
              {!isCollapsed ? <span className="truncate">{item.name}</span> : null}
            </Link>
          )
        })}
      </nav>

      <div className="p-4">
        <div className="mb-4 h-px w-full bg-border/70" />
        <Button
          type="button"
          variant="secondary"
          className={cn(
            'w-full justify-start gap-3 rounded-xl bg-muted text-foreground/80 hover:bg-destructive/10 hover:text-destructive',
            isCollapsed && 'justify-center'
          )}
          onClick={onLogout}
          title={isCollapsed ? 'Log Out' : undefined}
        >
          <LogOut size={18} />
          {!isCollapsed ? 'Log Out' : null}
        </Button>
      </div>
    </aside>
  )
}
