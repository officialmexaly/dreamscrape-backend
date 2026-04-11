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
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div>
        <div className="font-serif text-2xl font-semibold text-foreground">
          {title}
        </div>
        {description ? (
          <div className="mt-1 text-sm text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>

      {action && (
        <Button onClick={action.onClick} variant={action.variant || 'default'}>
          <Icon size={16} />
          {action.label}
        </Button>
      )}
    </div>
  )
}
