import * as React from 'react'
import { Plus, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/src/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  }
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  const Icon = action?.icon || Plus

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
      <div>
        <div className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
          {title}
        </div>
        {description ? (
          <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>

      {action && (
        <Button size="sm" onClick={action.onClick} variant={action.variant || 'default'}>
          <Icon size={14} />
          <span className="hidden sm:inline">{action.label}</span>
        </Button>
      )}
    </div>
  )
}
