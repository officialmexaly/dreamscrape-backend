'use client'

import * as React from 'react'
import { Plus, Trash2, Pencil, AlertCircle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useMedia } from '../providers/MediaProvider'
import { useToast } from '@/src/admin/toast/ToastProvider'
import { formatAdminDate } from '@/src/admin/utils/formatDate'

export function MediaPage() {
  const router = useRouter()
  const { media, deleteMedia, isLoading, error, refresh } = useMedia()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this media item?')) return
    try {
      await deleteMedia(id)
      toast({ title: 'Image deleted', variant: 'info', duration: 2000 })
    } catch (err) {
      toast({
        title: 'Failed to delete',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'error',
        duration: 3000
      })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refresh()
      toast({ title: 'Refreshed', variant: 'success', duration: 1500 })
    } catch (err) {
      toast({
        title: 'Failed to refresh',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'error',
        duration: 3000,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="font-serif text-2xl font-semibold text-foreground">
            Media Library
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => router.push('/admin/media/new')}>
              <Plus size={16} />
              Add Media
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div>
            <div className="font-semibold text-foreground">Failed to load media</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="font-serif text-2xl font-semibold text-foreground">
            Media Library
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={true}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4 animate-spin" />
            </Button>
            <Button onClick={() => router.push('/admin/media/new')}>
              <Plus size={16} />
              Add Media
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">Loading media library…</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-serif text-2xl font-semibold text-foreground">
            Media Library
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {media.length} {media.length === 1 ? 'item' : 'items'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => router.push('/admin/media/new')}>
            <Plus size={16} />
            Add Media
          </Button>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/50 p-12 text-center">
          <div className="text-6xl">📷</div>
          <div>
            <div className="font-semibold text-foreground">No media yet</div>
            <div className="text-sm text-muted-foreground">
              Add your first image to get started
            </div>
          </div>
          <Button onClick={() => router.push('/admin/media/new')}>
            <Plus size={16} />
            Add Media
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.name}
                className="h-[200px] w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/45" />

              <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 transition group-hover:opacity-100">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="bg-white/90 hover:bg-white"
                    onClick={() => router.push(`/admin/media/${item.id}/edit`)}
                    aria-label="Edit image"
                  >
                    <Pencil size={14} />
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete image"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="text-white">
                  <div className="truncate text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-white/80">
                    {item.size ? `${item.size}` : '—'} •{' '}
                    {formatAdminDate(item.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
