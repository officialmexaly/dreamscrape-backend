'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEvents } from '../providers/EventsProvider'
import { formatAdminDate } from '@/src/admin/utils/formatDate'
import { PageHeader } from '../components/shared'
import { DataTable } from '../components/shared/DataTable'
import { StatusBadge } from '../components/shared'
import { ActionButtons } from '../components/shared'
import { useToast } from '@/src/admin/toast/ToastProvider'

export function EventsPage() {
  const router = useRouter()
  const { events, deleteEvent, isLoading } = useEvents()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    await deleteEvent(id)
    toast({ title: 'Event deleted', variant: 'info', duration: 2000 })
  }

  const columns = [
    {
      key: 'event',
      header: 'Event',
      cell: (event: any) => {
        const imageUrl = event.featured_image || event.featuredImage || ''
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="font-medium text-foreground">
              {event.title}
            </div>
          </div>
        )
      },
    },
    {
      key: 'category',
      header: 'Category',
      cell: (event: any) => event.event_type,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (event: any) => formatAdminDate(event.event_date),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (event: any) => <StatusBadge status={event.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (event: any) => (
        <ActionButtons
          onEdit={() => router.push(`/admin/events/${event.id}/edit`)}
          onDelete={() => handleDelete(event.id)}
          deleteConfirmMessage="Delete this event?"
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        action={{
          label: 'Add Event',
          onClick: () => router.push('/admin/events/new'),
          icon: Plus,
        }}
      />

      <DataTable
        data={events}
        columns={columns}
        keyExtractor={(event) => event.id}
        isLoading={isLoading}
        emptyMessage="No events found"
        loadingMessage="Loading events…"
      />
    </div>
  )
}
