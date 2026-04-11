'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/src/admin/toast/ToastProvider'
import { useServices } from '../providers/ServicesProvider'
import { formatAdminDate } from '@/src/admin/utils/formatDate'
import { ActionButtons, DataTable, PageHeader, StatusBadge } from '@/src/admin/components/shared'

export function ServicesPage() {
  const router = useRouter()
  const { services, deleteService, isLoading } = useServices()
  const { toast } = useToast()

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
    <div className="space-y-6">
      <PageHeader
        title="Service Offerings"
        action={{
          label: 'Add Service',
          onClick: () => router.push('/admin/services/new'),
          icon: Plus,
        }}
      />

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
