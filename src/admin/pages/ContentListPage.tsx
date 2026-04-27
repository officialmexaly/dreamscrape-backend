'use client'

import * as React from 'react'
import { Layers3, Plus, RefreshCw, Search, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/src/admin/toast/ToastProvider'
import { ActionButtons, DataTable, StatusBadge } from '@/src/admin/components/shared'
import { cn } from '@/src/lib/utils'

type ContentItem = {
  id: string
  page: string
  section: string
  content_key: string
  content_type: string
  content: string | null
  content_json: any
  display_order: number
  is_active: boolean
  updated_at: string
}

function pagePill(page: string) {
  switch (page) {
    case 'home':
      return 'bg-primary/10 text-primary ring-primary/20'
    case 'about':
      return 'bg-amber-50 text-amber-900 ring-amber-200'
    case 'services':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    case 'contact':
      return 'bg-primary/10 text-primary ring-primary/20'
    default:
      return 'bg-muted text-foreground/80 ring-border'
  }
}

function typePill(type: string) {
  switch (type) {
    case 'image':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    case 'richtext':
      return 'bg-primary/10 text-primary ring-primary/20'
    case 'json':
      return 'bg-amber-50 text-amber-900 ring-amber-200'
    case 'number':
      return 'bg-primary/10 text-primary ring-primary/20'
    case 'text':
    default:
      return 'bg-muted text-foreground/80 ring-border'
  }
}

function formatContentValue(item: ContentItem) {
  if (item.content_type === 'json') {
    const json = item.content_json
    if (Array.isArray(json)) return `Array (${json.length} items)`
    if (json && typeof json === 'object') {
      const keys = Object.keys(json)
      if (keys.length <= 3) {
        return keys
          .map((k) => `${k}: ${JSON.stringify(json[k]).slice(0, 30)}…`)
          .join(', ')
      }
      return `Object (${keys.length} keys)`
    }
    return `${JSON.stringify(json).slice(0, 50)}…`
  }

  const value = item.content || ''
  return value.slice(0, 60) + (value.length > 60 ? '…' : '')
}

export function ContentListPage({ page }: { page: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = React.useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeSection, setActiveSection] = React.useState<string>('')

  const fetchContent = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const url = page ? `/api/admin/content?page=${page}` : '/api/admin/content'
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Failed to load content')
      setItems(json.items || [])
    } catch (error: any) {
      toast({
        title: 'Failed to load content',
        description: error?.message,
        variant: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [page, toast])

  React.useEffect(() => {
    void fetchContent()
  }, [fetchContent])

  const sections = React.useMemo(() => {
    const grouped: Record<string, ContentItem[]> = {}
    for (const item of items) {
      const key = page ? item.section : `${item.page}_${item.section}`
      grouped[key] ||= []
      grouped[key].push(item)
    }
    Object.keys(grouped).forEach((k) =>
      grouped[k].sort((a, b) => a.display_order - b.display_order)
    )
    return grouped
  }, [items, page])

  const sectionKeys = React.useMemo(() => Object.keys(sections).sort(), [sections])

  React.useEffect(() => {
    if (!sectionKeys.length) return
    setActiveSection((prev) => (prev && sectionKeys.includes(prev) ? prev : sectionKeys[0]))
  }, [sectionKeys])

  const getSectionLabel = (key: string) => {
    if (!page) {
      const [pageName, sectionName] = key.split('_')
      return `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - ${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`
    }
    return key
  }

  const pageTitle = page
    ? page.charAt(0).toUpperCase() + page.slice(1)
    : 'Advanced Content View'
  const activeItems = activeSection ? sections[activeSection] || [] : []
  const visibleItems = activeItems.filter((item) =>
    item.content_key.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const activeSectionLabel = activeSection ? getSectionLabel(activeSection) : 'All sections'
  const activeCount = items.filter((item) => item.is_active).length

  const renderTable = (sectionKey: string, sectionItems: ContentItem[]) => {
    const filteredItems = sectionItems.filter((item) =>
      item.content_key.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const columns: any[] = []

    if (!page) {
      columns.push({
        key: 'page',
        header: 'Page',
        cell: (item: ContentItem) => (
          <span
            className={cn(
              'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
              pagePill(item.page)
            )}
          >
            {item.page}
          </span>
        ),
      })
    }

    columns.push(
      {
        key: 'section',
        header: 'Section',
        cell: (item: ContentItem) => (
          <span className="text-sm capitalize text-muted-foreground">
            {item.section}
          </span>
        ),
      },
      {
        key: 'content_key',
        header: 'Content Key',
        cell: (item: ContentItem) => (
          <span className="font-mono text-sm font-semibold">
            {item.content_key}
          </span>
        ),
      },
      {
        key: 'content_type',
        header: 'Type',
        cell: (item: ContentItem) => (
          <span
            className={cn(
              'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
              typePill(item.content_type)
            )}
          >
            {item.content_type}
          </span>
        ),
      },
      {
        key: 'value',
        header: 'Value',
        cell: (item: ContentItem) => (
          <span className="block max-w-[360px] truncate text-sm text-muted-foreground">
            {formatContentValue(item)}
          </span>
        ),
      },
      {
        key: 'order',
        header: 'Order',
        cell: (item: ContentItem) => item.display_order,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (item: ContentItem) => (
          <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        cell: (item: ContentItem) => (
          <div className="flex justify-end">
            <ActionButtons
              onEdit={() =>
                router.push(`/admin/content/${page || item.page}/${item.id}/edit`)
              }
              onView={() => router.push(`/admin/content/${page || item.page}/${item.id}`)}
              editLabel="Edit"
              viewLabel="View"
            />
          </div>
        ),
      }
    )

    return (
      <DataTable
        className="rounded-none border-0 shadow-none"
        data={filteredItems}
        columns={columns}
        keyExtractor={(item: ContentItem) => item.id}
        emptyMessage={searchQuery ? 'No matching content found.' : 'No items in this section.'}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(64,21,63,0.04)_0%,rgba(201,168,76,0.05)_100%)] p-0 shadow-[0_18px_54px_rgba(64,21,63,0.06)]">
        <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles size={12} />
              Site Content
            </div>
            <div className="mt-3 font-serif text-3xl font-semibold text-foreground">
              {page ? `${pageTitle} Content` : pageTitle}
            </div>
            <div className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Manage structured content sections, inspect each group, and edit items without leaving the grid.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="grid min-w-[110px] rounded-2xl border border-border/70 bg-background px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Items
              </span>
              <span className="mt-1 text-lg font-semibold text-foreground">
                {items.length}
              </span>
            </div>
            <div className="grid min-w-[110px] rounded-2xl border border-border/70 bg-background px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Active
              </span>
              <span className="mt-1 text-lg font-semibold text-foreground">
                {activeCount}
              </span>
            </div>
            <div className="grid min-w-[120px] rounded-2xl border border-border/70 bg-background px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Sections
              </span>
              <span className="mt-1 text-lg font-semibold text-foreground">
                {sectionKeys.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5">
              <Layers3 size={14} />
              Section: <span className="font-semibold text-foreground">{activeSectionLabel}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5">
              {visibleItems.length} matching items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchContent}
              disabled={isLoading}
              className="h-10 rounded-xl"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
              onClick={() => router.push(`/admin/content/${page || 'home'}/new`)}
              className="h-10 rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus size={16} />
              Add Content
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-background p-0 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
        {sectionKeys.length > 0 ? (
          <Tabs value={activeSection} onValueChange={setActiveSection} className="gap-0">
            <div className="border-b border-border/70 bg-muted/20 px-4 pt-4 sm:px-6">
              <TabsList
                variant="line"
                className="h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0"
              >
                {sectionKeys.map((key) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="h-9 rounded-full border border-transparent px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground data-[state=active]:border-primary/15 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    {getSectionLabel(key)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {sectionKeys.map((key) => (
              <TabsContent key={key} value={key} className="p-0">
                <div className="flex flex-col gap-3 border-b border-border/70 bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="text-sm text-muted-foreground">
                    Viewing section{' '}
                    <span className="font-semibold text-foreground">
                      {getSectionLabel(key)}
                    </span>
                    {' '}with{' '}
                    <span className="font-semibold text-foreground">
                      {sections[key]?.length || 0}
                    </span>{' '}
                    entries
                  </div>
                  <div className="relative w-full sm:w-[300px]">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search keys…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 rounded-full pl-9"
                    />
                  </div>
                </div>
                {isLoading ? (
                  <div className="p-12 text-center text-sm text-muted-foreground">
                    Loading…
                  </div>
                ) : (
                  renderTable(key, sections[key])
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center p-12 text-center">
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-muted text-primary">
                <Layers3 size={24} />
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                No content sections found for this page.
              </div>
              {page ? (
                <div className="mt-4">
                  <Button
                    onClick={() => router.push(`/admin/content/${page}/new`)}
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus size={16} />
                    Add First Content Item
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
