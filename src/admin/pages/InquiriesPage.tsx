'use client'

import * as React from 'react'
import { Mail, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/src/admin/toast/ToastProvider'
import { useInquiries } from '../providers/InquiriesProvider'
import { formatAdminDate } from '@/src/admin/utils/formatDate'
import { ActionButtons, DataTable, StatusBadge } from '@/src/admin/components/shared'
import { Button } from '@/components/ui/button'

export function InquiriesPage() {
  const router = useRouter()
  const { inquiries, deleteInquiry, isLoading, refresh } = useInquiries()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry?')) return
    await deleteInquiry(id)
    toast({ title: 'Inquiry deleted', variant: 'info', duration: 2000 })
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
      key: 'name',
      header: 'Client',
      cell: (inquiry: any) => (
        <div className="font-medium text-foreground">{inquiry.name}</div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (inquiry: any) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail size={14} />
          <span className="text-sm">{inquiry.email}</span>
        </div>
      ),
    },
    {
      key: 'eventType',
      header: 'Event Type',
      cell: (inquiry: any) => inquiry.eventType,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (inquiry: any) => formatAdminDate(inquiry.date),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (inquiry: any) => (
        <StatusBadge status={String(inquiry.status || 'new')} />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (inquiry: any) => (
        <div className="flex justify-end">
          <ActionButtons
            onEdit={() => router.push(`/admin/inquiries/${inquiry.id}/edit`)}
            onDelete={() => handleDelete(inquiry.id)}
            deleteConfirmMessage="Delete this inquiry?"
            editLabel="Open"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-serif text-2xl font-semibold text-foreground">
            Consultation Inquiries
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Manage client inquiries and bookings
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
          <Button onClick={() => router.push('/admin/inquiries/new')}>
            <Plus size={16} />
            Add Inquiry
          </Button>
        </div>
      </div>

      <DataTable
        data={inquiries}
        columns={columns}
        keyExtractor={(inquiry: any) => inquiry.id}
        isLoading={isLoading}
        emptyMessage="No inquiries yet."
      />
    </div>
  )
}
