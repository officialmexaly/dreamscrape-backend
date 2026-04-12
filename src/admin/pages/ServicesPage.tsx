'use client'

import * as React from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/src/admin/toast/ToastProvider'
import { useServices } from '../providers/ServicesProvider'
import { formatAdminDate } from '@/src/admin/utils/formatDate'
import { ActionButtons, DataTable, PageHeader, StatusBadge } from '@/src/admin/components/shared'

export function ServicesPage() {
  const router = useRouter()
  const { services, deleteService, isLoading, refresh } = useServices()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service?')) return
    try {
      await deleteService(id)
      toast({ title: 'Service deleted', variant: 'info', duration: 2000 })
    } catch (error: any) {
      toast({
        title: error?.message || 'Failed to delete',
        variant: 'error',
        duration: 2000,
      })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refresh()
      toast({ title: 'Refreshed', variant: 'success', duration: 1500 })
    } catch (error) {
      toast({
        title: 'Failed to refresh',
        description: error instanceof Error ? error.message : undefined,
        variant: 'error',
        duration: 3000,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const columns = [
    {
      key: 'title',
      header: 'Title',
      cell: (service: any) => (
        <div>
          <div className="font-medium text-foreground">{service.title}</div>
          <div className="mt-1 line-clamp-1 max-w-[520px] text-xs text-muted-foreground">
            {service.description}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (service: any) => service.category || '—',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (service: any) => (
        <StatusBadge status={(service.status || 'draft') as any} />
      ),
    },
    {
      key: 'updated',
      header: 'Updated',
      cell: (service: any) => formatAdminDate(service.updated_at),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (service: any) => (
        <div className="flex justify-end">
          <ActionButtons
            onEdit={() => router.push(`/admin/services/${service.id}/edit`)}
            onDelete={() => handleDelete(service.id)}
            deleteConfirmMessage="Delete this service?"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
            Service Offerings
          </div>
          <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your service packages
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" onClick={() => router.push('/admin/services/new')}>
            <Plus size={14} />
            <span className="hidden sm:inline">Add Service</span>
          </Button>
        </div>
      </div>

      <DataTable
        data={services}
        columns={columns}
        keyExtractor={(service: any) => service.id}
        isLoading={isLoading}
        emptyMessage="No services yet."
      />
    </div>
  )
}
