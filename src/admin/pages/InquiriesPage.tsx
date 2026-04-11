'use client'

import * as React from 'react'
import { Mail, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/src/admin/toast/ToastProvider'
import { useInquiries } from '../providers/InquiriesProvider'
import { formatAdminDate } from '@/src/admin/utils/formatDate'
import { ActionButtons, DataTable, PageHeader, StatusBadge } from '@/src/admin/components/shared'

export function InquiriesPage() {
  const router = useRouter()
  const { inquiries, deleteInquiry, isLoading } = useInquiries()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry?')) return
    await deleteInquiry(id)
    toast({ title: 'Inquiry deleted', variant: 'info', duration: 2000 })
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
      <PageHeader
        title="Consultation Inquiries"
        action={{
          label: 'Add Inquiry',
          onClick: () => router.push('/admin/inquiries/new'),
          icon: Plus,
        }}
      />

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
