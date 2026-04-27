'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { useInquiries } from '@/src/admin/providers/InquiriesProvider'
import { useToast } from '@/src/admin/toast/ToastProvider'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'

const STATUSES = ['New', 'Contacted', 'Booked', 'Closed', 'Cancelled'] as const

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function EditInquiryPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : String((params as any)?.id ?? '')
  const { toast } = useToast()
  const { inquiries, updateStatus } = useInquiries()

  const inquiry = React.useMemo(() => inquiries.find((i: any) => i.id === id), [inquiries, id])
  const [status, setStatus] = React.useState<string>(inquiry?.status ?? 'New')
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (inquiry) setStatus(inquiry.status ?? 'New')
  }, [inquiry])

  if (!inquiry) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Booking not found.</div>
        <Button variant="outline" onClick={() => router.push('/admin/inquiries')}>Back</Button>
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateStatus(id, status)
      toast({ title: 'Status updated', variant: 'success', duration: 2000 })
      router.push('/admin/inquiries')
    } catch (err) {
      toast({
        title: 'Failed to update',
        description: err instanceof Error ? err.message : undefined,
        variant: 'error',
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/admin/inquiries')}>
            <ArrowLeft size={16} />
            Back
          </Button>
          <div className="font-serif text-2xl font-semibold text-foreground">
            Booking Details
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save size={16} />
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Status */}
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="h-10 w-full max-w-xs rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Consultation slot */}
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Consultation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" value={formatDate(inquiry.consultationDate)} />
          <Field label="Time" value={inquiry.consultationTime} />
        </CardContent>
      </Card>

      {/* Client info */}
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Client</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={inquiry.name} />
          <Field label="Email" value={inquiry.email} />
          <Field label="Phone" value={inquiry.phone} />
          <Field label="How did you hear" value={inquiry.howDidYouHear} />
        </CardContent>
      </Card>

      {/* Event details */}
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Event Type" value={inquiry.eventType} />
          <Field label="Event Date" value={formatDate(inquiry.eventDate)} />
          <Field label="Location" value={inquiry.eventLocation} />
          <Field label="Budget" value={inquiry.budget} />
          <Field label="Guests" value={inquiry.guests} />
          {inquiry.additionalDetails && (
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Additional Details</Label>
              <p className="text-sm text-foreground whitespace-pre-wrap">{inquiry.additionalDetails}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files */}
      {inquiry.fileUrls?.length > 0 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Attached Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inquiry.fileUrls.map((url: string, i: number) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:underline"
              >
                {inquiry.fileNames?.[i] ?? url}
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
