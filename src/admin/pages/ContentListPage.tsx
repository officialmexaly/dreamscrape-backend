'use client'

import * as React from 'react'
import { Plus, RefreshCw } from 'lucide-react'
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
      return 'bg-violet-50 text-violet-800 ring-violet-200'
    case 'about':
      return 'bg-sky-50 text-sky-800 ring-sky-200'
    case 'services':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    case 'contact':
      return 'bg-amber-50 text-amber-900 ring-amber-200'
    default:
      return 'bg-slate-50 text-slate-700 ring-slate-200'
  }
}

function typePill(type: string) {
  switch (type) {
    case 'image':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    case 'richtext':
      return 'bg-sky-50 text-sky-800 ring-sky-200'
    case 'json':
      return 'bg-violet-50 text-violet-800 ring-violet-200'
    case 'number':
      return 'bg-amber-50 text-amber-900 ring-amber-200'
    case 'text':
    default:
      return 'bg-slate-50 text-slate-700 ring-slate-200'
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-serif text-2xl font-semibold text-foreground">
            {page ? `${pageTitle} Content` : pageTitle}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Manage structured site content items.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchContent} disabled={isLoading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button onClick={() => router.push(`/admin/content/${page || 'home'}/new`)}>
            <Plus size={16} />
            Add Content
          </Button>
        </div>
      </div>

      <Card className="border-border/70 p-0">
        {sectionKeys.length > 0 ? (
          <Tabs value={activeSection} onValueChange={setActiveSection} className="gap-0">
            <div className="border-b border-border/70 px-4 pt-3">
              <TabsList variant="line" className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                {sectionKeys.map((key) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="h-9 rounded-lg px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground data-[state=active]:text-foreground"
                  >
                    {getSectionLabel(key)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {sectionKeys.map((key) => (
              <TabsContent key={key} value={key} className="p-0">
                <div className="flex items-center justify-between gap-4 border-b border-border/70 bg-muted/20 p-4">
                  <div className="text-sm text-muted-foreground">
                    Section:{' '}
                    <span className="font-semibold text-foreground">
                      {getSectionLabel(key)}
                    </span>
                  </div>
                  <div className="w-[260px]">
                    <Input
                      placeholder="Search keys…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                {isLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </div>
                ) : (
                  renderTable(key, sections[key])
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="p-12 text-center">
            <div className="text-sm text-muted-foreground">
              No content sections found for this page.
            </div>
            {page ? (
              <div className="mt-4">
                <Button onClick={() => router.push(`/admin/content/${page}/new`)}>
                  <Plus size={16} />
                  Add First Content Item
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  )
}
