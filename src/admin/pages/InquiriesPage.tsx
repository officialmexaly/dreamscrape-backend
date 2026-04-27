'use client'

import * as React from 'react'
import { Mail, Phone, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/src/admin/toast/ToastProvider'
import { useInquiries } from '../providers/InquiriesProvider'
import { ActionButtons, DataTable, StatusBadge } from '@/src/admin/components/shared'
import { Button } from '@/components/ui/button'

function formatConsultationDate(dateStr: string | null) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function InquiriesPage() {
  const router = useRouter()
  const { inquiries, deleteInquiry, isLoading, refresh } = useInquiries()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this booking?')) return
    await deleteInquiry(id)
    toast({ title: 'Booking deleted', variant: 'info', duration: 2000 })
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
      key: 'client',
      header: 'Client',
      cell: (inquiry: any) => (
        <div>
          <div className="font-medium text-foreground">{inquiry.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <Mail size={11} />
            {inquiry.email}
          </div>
          {inquiry.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone size={11} />
              {inquiry.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'consultation',
      header: 'Consultation',
      cell: (inquiry: any) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {formatConsultationDate(inquiry.consultationDate)}
          </div>
          <div className="text-xs text-muted-foreground">{inquiry.consultationTime ?? '—'}</div>
        </div>
      ),
    },
    {
      key: 'eventType',
      header: 'Event Type',
      cell: (inquiry: any) => (
        <div className="text-sm text-foreground">{inquiry.eventType}</div>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      cell: (inquiry: any) => (
        <div className="text-sm text-foreground">{inquiry.budget ?? '—'}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (inquiry: any) => (
        <StatusBadge status={String(inquiry.status || 'New')} />
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
            deleteConfirmMessage="Delete this booking?"
            editLabel="Open"
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
            Consultation Bookings
          </div>
          <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
            All submitted consultation requests
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
          <Button size="sm" onClick={() => router.push('/admin/inquiries/new')}>
            <Plus size={14} />
            <span className="hidden sm:inline">Add Booking</span>
          </Button>
        </div>
      </div>

      <DataTable
        data={inquiries}
        columns={columns}
        keyExtractor={(inquiry: any) => inquiry.id}
        isLoading={isLoading}
        emptyMessage="No bookings yet."
      />
    </div>
  )
}
