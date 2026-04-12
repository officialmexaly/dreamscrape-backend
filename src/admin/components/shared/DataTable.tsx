import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/src/lib/utils'

interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  isLoading?: boolean
  emptyMessage?: string
  loadingMessage?: string
  className?: string
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (selectedIds: Set<string>) => void
  bulkActions?: (selectedItems: T[]) => React.ReactNode
  onRowClick?: (item: T) => void
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',
  className,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  bulkActions,
  onRowClick,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && data.every(item => selectedIds.has(keyExtractor(item)))
  const someSelected = selectedIds.size > 0 && !allSelected

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection = new Set(data.map(keyExtractor))
      onSelectionChange?.(newSelection)
    } else {
      onSelectionChange?.(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedIds)
    if (checked) {
      newSelection.add(id)
    } else {
      newSelection.delete(id)
    }
    onSelectionChange?.(newSelection)
  }

  const handleRowClick = (item: T, e: React.MouseEvent) => {
    // Don't trigger row click if clicking on checkbox, button, or link
    if ((e.target as HTMLElement).closest('input, button, a, label')) {
      return
    }
    onRowClick?.(item)
  }

  const getSelectedItems = (): T[] => {
    return data.filter(item => selectedIds.has(keyExtractor(item)))
  }

  const tableColumns = selectable
    ? [
        {
          key: 'select',
          header: '',
          className: 'w-12',
          cell: (item: T) => {
            const id = keyExtractor(item)
            const isSelected = selectedIds.has(id)
            return (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleSelectRow(id, checked === true)}
                aria-label="Select row"
              />
            )
          },
        },
        ...columns,
      ]
    : columns

  const selectedItems = getSelectedItems()

  return (
    <div className="space-y-4">
      {selectable && bulkActions && selectedItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/40 px-4 py-3">
          <div className="text-sm text-foreground">
            {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {bulkActions(selectedItems)}
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <Card
        className={cn(
          'gap-0 overflow-hidden border-border/70 bg-card p-0 py-0 shadow-[0_12px_40px_rgba(15,23,42,0.06)] hidden sm:block',
          className
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b border-border/60 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {selectable && (
                  <th className="w-12 px-4 py-3 align-middle">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3 align-middle',
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={tableColumns.length}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    {loadingMessage}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableColumns.length}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const id = keyExtractor(item)
                  const isSelected = selectedIds.has(id)
                  return (
                    <tr
                      key={id}
                      onClick={(e) => handleRowClick(item, e)}
                      className={cn(
                        'transition-colors odd:bg-background even:bg-muted/15 hover:bg-primary/5',
                        isSelected && 'bg-primary/10',
                        onRowClick && 'cursor-pointer'
                      )}
                    >
                      {selectable && (
                        <td className="w-12 px-4 py-4 align-middle" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectRow(id, checked === true)}
                            aria-label="Select row"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn('px-4 py-4 align-middle', column.className)}
                        >
                          {column.cell(item)}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            {loadingMessage}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          data.map((item) => {
            const id = keyExtractor(item)
            const isSelected = selectedIds.has(id)
            return (
              <Card
                key={id}
                onClick={(e) => handleRowClick(item, e)}
                className={cn(
                  'border-border/70 bg-card shadow-sm',
                  onRowClick && 'cursor-pointer',
                  isSelected && 'ring-2 ring-primary/20'
                )}
              >
                <div className="p-4 space-y-3">
                  {selectable && (
                    <div className="flex items-start justify-between" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(id, checked === true)}
                        aria-label="Select row"
                      />
                    </div>
                  )}
                  {columns.map((column) => (
                    <div key={column.key} className="flex flex-col gap-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {column.header}
                      </div>
                      <div className="text-sm">{column.cell(item)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
