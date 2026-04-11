'use client'

/* eslint-disable @next/next/no-img-element */

import * as React from 'react'
import { ArrowLeft, ArrowDown, ArrowUp, ImagePlus, Plus, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/src/admin/toast/ToastProvider'
import { formatAdminDateTime } from '@/src/admin/utils/formatDate'
import { MediaPickerModal } from '@/src/admin/components/MediaPickerModal'
import { useDisclosure } from '@/src/admin/hooks/useDisclosure'

export function ContentEditPage({ page, id }: { page: string; id: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [item, setItem] = React.useState<any>(null)
  const [showRawJson, setShowRawJson] = React.useState(false)
  const mediaModal = useDisclosure(false)
  const [mediaTarget, setMediaTarget] = React.useState<
    { kind: 'image' } | { kind: 'slide'; index: number } | null
  >(null)

  React.useEffect(() => {
    const loadItem = async () => {
      if (id === 'new') {
        setItem({
          page,
          section: '',
          content_key: '',
          content_type: 'text',
          content: '',
          content_json: null,
          display_order: 0,
          is_active: true,
        })
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const res = await fetch(`/api/admin/content/${id}`, { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load content')
        setItem(json.item)
      } catch (error: any) {
        toast({
          title: 'Failed to load content',
          description: error?.message,
          variant: 'error',
          duration: 3000,
        })
        router.push(`/admin/content/${page}`)
      } finally {
        setIsLoading(false)
      }
    }

    void loadItem()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page])

  React.useEffect(() => {
    // Default to hiding raw JSON to avoid confusing non-technical users.
    setShowRawJson(false)
  }, [id])

  const handleSave = async () => {
    if (!item?.content_key || !item?.section || !item?.content_type) {
      toast({
        title: 'Section, Key, and Type are required',
        variant: 'error',
        duration: 2000,
      })
      return
    }

    setIsSaving(true)
    try {
      const payload: any = {
        page,
        section: item.section,
        content_key: item.content_key,
        content_type: item.content_type,
        display_order: parseInt(String(item.display_order), 10) || 0,
        is_active: item.is_active !== false,
      }

      if (item.content_type === 'json') {
        payload.content_json = item.content_json
        payload.content = null
      } else if (item.content_type === 'number') {
        payload.content_number = item.content
        payload.content = null
      } else {
        payload.content = item.content
        payload.content_json = null
        payload.content_number = null
      }

      const method = id === 'new' ? 'POST' : 'PUT'
      const url = id === 'new' ? '/api/admin/content' : `/api/admin/content/${id}`

      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save content')

      toast({ title: 'Saved', variant: 'success', duration: 1800 })
      router.push(`/admin/content/${page}`)
    } catch (error: any) {
      toast({
        title: error?.message || 'Failed to save content',
        variant: 'error',
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const pageTitle = page.charAt(0).toUpperCase() + page.slice(1)

  const isHeroSlidesKey =
    page === 'home' && item?.section === 'hero' && item?.content_key === 'slides'

  const isHeroSlidesEditor = isHeroSlidesKey && item?.content_type === 'json'

  const isFeaturedEventsKey =
    page === 'home' &&
    item?.section === 'featuredEvents' &&
    item?.content_key === 'events'

  const isFeaturedEventsEditor = isFeaturedEventsKey && item?.content_type === 'json'

  const hasStructuredJsonEditor = isHeroSlidesEditor || isFeaturedEventsEditor

  React.useEffect(() => {
    if (!isHeroSlidesKey) return
    if (!item) return

    // If slides were stored in `content` (text) previously, auto-convert to json editor.
    if (item.content_type !== 'json') {
      const raw = item.content
      let parsed: any = []
      if (typeof raw === 'string' && raw.trim()) {
        try {
          parsed = JSON.parse(raw)
        } catch {
          parsed = []
        }
      }
      const arrayValue = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && Array.isArray((parsed as any).slides)
          ? (parsed as any).slides
          : null
      if (arrayValue) {
        setItem((prev: any) => ({
          ...prev,
          content_type: 'json',
          content_json: arrayValue,
          content: null,
          content_number: null,
        }))
      }
      return
    }

    // Parse stringified json -> object/array for editing UI.
    if (typeof item.content_json === 'string') {
      try {
        const parsed = JSON.parse(item.content_json)
        if (parsed && typeof parsed === 'object') {
          setItem((prev: any) => ({ ...prev, content_json: parsed }))
        }
      } catch {
        // ignore parse errors (user may be editing raw JSON)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHeroSlidesKey, item?.content_type, item?.content, item?.content_json])

  const slides: Array<{ id?: string; image: string }> = React.useMemo(() => {
    if (!isHeroSlidesKey) return []
    const value = item?.content_json
    const arrayValue = Array.isArray(value)
      ? value
      : value && typeof value === 'object' && Array.isArray((value as any).slides)
        ? (value as any).slides
        : null
    if (arrayValue) {
      return arrayValue
        .map((s: any, idx: number) => ({
          id: typeof s?.id === 'string' ? s.id : `slide_${idx + 1}`,
          image:
            typeof s === 'string'
              ? s
              : typeof s?.image === 'string'
                ? s.image
                : '',
        }))
        .filter((s) => s.image || s.id)
    }
    return []
  }, [isHeroSlidesKey, item?.content_json])

  const setSlides = (next: Array<{ id?: string; image: string }>) => {
    // Persist as array of objects { id, image } for consistency.
    setItem((prev: any) => ({ ...prev, content_json: next.map((s, idx) => ({
      id: s.id || `slide_${idx + 1}`,
      image: s.image,
    })) }))
  }

  const addSlide = () => {
    const next = slides.slice()
    next.push({ id: `slide_${next.length + 1}`, image: '' })
    setSlides(next)
  }

  const updateSlide = (index: number, patch: Partial<{ id: string; image: string }>) => {
    const next = slides.slice()
    const current = next[index]
    if (!current) return
    next[index] = { ...current, ...(patch as any) }
    setSlides(next)
  }

  const deleteSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index))
  }

  const moveSlide = (from: number, to: number) => {
    if (from < 0 || from >= slides.length) return
    if (to < 0 || to >= slides.length) return
    const next = slides.slice()
    const [picked] = next.splice(from, 1)
    next.splice(to, 0, picked)
    setSlides(next)
  }

  const featuredEvents: Array<{ id?: string; title: string; location: string; image: string }> = React.useMemo(() => {
    if (!isFeaturedEventsKey) return []
    const value = item?.content_json
    const arrayValue = Array.isArray(value)
      ? value
      : value && typeof value === 'object' && Array.isArray((value as any).events)
        ? (value as any).events
        : null
    if (!arrayValue) return []
    return arrayValue.map((e: any, idx: number) => ({
      id: typeof e?.id === 'string' ? e.id : `event_${idx + 1}`,
      title: typeof e?.title === 'string' ? e.title : '',
      location: typeof e?.location === 'string' ? e.location : '',
      image: typeof e?.image === 'string' ? e.image : '',
    }))
  }, [isFeaturedEventsKey, item?.content_json])

  const setFeaturedEvents = (next: Array<{ id?: string; title: string; location: string; image: string }>) => {
    setItem((prev: any) => ({ ...prev, content_json: next.map((e, idx) => ({
      id: e.id || `event_${idx + 1}`,
      title: e.title,
      location: e.location,
      image: e.image,
    })) }))
  }

  const addFeaturedEvent = () => {
    const next = featuredEvents.slice()
    next.push({ id: `event_${next.length + 1}`, title: '', location: '', image: '' })
    setFeaturedEvents(next)
  }

  const updateFeaturedEvent = (index: number, patch: Partial<{ title: string; location: string; image: string }>) => {
    const next = featuredEvents.slice()
    const current = next[index]
    if (!current) return
    next[index] = { ...current, ...(patch as any) }
    setFeaturedEvents(next)
  }

  const deleteFeaturedEvent = (index: number) => {
    setFeaturedEvents(featuredEvents.filter((_, i) => i !== index))
  }

  const moveFeaturedEvent = (from: number, to: number) => {
    if (from < 0 || from >= featuredEvents.length) return
    if (to < 0 || to >= featuredEvents.length) return
    const next = featuredEvents.slice()
    const [picked] = next.splice(from, 1)
    next.splice(to, 0, picked)
    setFeaturedEvents(next)
  }

  if (isLoading) {
    return (
      <div className="grid min-h-[320px] place-items-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
          <div className="mt-4 text-sm text-muted-foreground">
            Loading content…
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Content not found.</div>
        <Button variant="outline" onClick={() => router.push(`/admin/content/${page}`)}>
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push(`/admin/content/${page}`)}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div className="font-serif text-2xl font-semibold text-foreground">
            {id === 'new' ? `Add ${pageTitle} Content` : 'Edit Content'}
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          <Save size={16} />
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="space-y-2">
            <Label>Section</Label>
            <Input
              value={item.section}
              onChange={(e) => setItem({ ...item, section: e.target.value })}
              placeholder="e.g., hero, brandIntro, statistics"
              className="h-10"
            />
            <div className="text-xs text-muted-foreground">
              The section this content belongs to (e.g., hero, brandIntro).
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content Key</Label>
            <Input
              value={item.content_key}
              onChange={(e) => setItem({ ...item, content_key: e.target.value })}
              placeholder="e.g., headline, paragraph1, image"
              className="h-10 font-mono"
            />
            <div className="text-xs text-muted-foreground">
              Unique identifier for this content within the section.
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content Type</Label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={item.content_type}
              onChange={(e) => setItem({ ...item, content_type: e.target.value })}
            >
              <option value="text">Text</option>
              <option value="richtext">Rich Text</option>
              <option value="image">Image URL</option>
              <option value="number">Number</option>
              <option value="json">JSON</option>
            </select>
          </div>

          {item.content_type === 'json' ? (
            <div className="space-y-2">
              <Label>JSON Value</Label>
              {isHeroSlidesEditor ? (
                <div className="space-y-3 rounded-xl border border-border/70 bg-muted/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-foreground">Hero Slides</div>
                    <Button type="button" variant="outline" size="sm" onClick={addSlide}>
                      <Plus size={16} />
                      Add slide
                    </Button>
                  </div>

                  {slides.length ? (
                    <div className="space-y-3">
                      {slides.map((slide, index) => (
                        <div
                          key={slide.id || `${index}`}
                          className="rounded-xl border border-border/70 bg-background p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Slide {index + 1}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveSlide(index, index - 1)}
                                disabled={index === 0}
                                aria-label="Move up"
                              >
                                <ArrowUp size={16} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveSlide(index, index + 1)}
                                disabled={index === slides.length - 1}
                                aria-label="Move down"
                              >
                                <ArrowDown size={16} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteSlide(index)}
                                aria-label="Delete slide"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                            <div className="overflow-hidden rounded-lg bg-muted">
                              {slide.image ? (
                                <img
                                  src={slide.image}
                                  alt={`Slide ${index + 1}`}
                                  className="h-28 w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-28 place-items-center text-xs text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input
                                  value={slide.image}
                                  onChange={(e) => updateSlide(index, { image: e.target.value })}
                                  placeholder="https://..."
                                  className="h-10"
                                />
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setMediaTarget({ kind: 'slide', index })
                                  mediaModal.onOpen()
                                }}
                              >
                                <ImagePlus size={16} />
                                Select from Media Library
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/70 bg-background p-6 text-sm text-muted-foreground">
                      No hero slides yet. Add a slide to start.
                    </div>
                  )}
                </div>
              ) : null}
              {isFeaturedEventsEditor ? (
                <div className="space-y-3 rounded-xl border border-border/70 bg-muted/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-foreground">Featured Events</div>
                    <Button type="button" variant="outline" size="sm" onClick={addFeaturedEvent}>
                      <Plus size={16} />
                      Add event
                    </Button>
                  </div>

                  {featuredEvents.length ? (
                    <div className="space-y-3">
                      {featuredEvents.map((ev, index) => (
                        <div
                          key={ev.id || `${index}`}
                          className="rounded-xl border border-border/70 bg-background p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Event {index + 1}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveFeaturedEvent(index, index - 1)}
                                disabled={index === 0}
                                aria-label="Move up"
                              >
                                <ArrowUp size={16} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveFeaturedEvent(index, index + 1)}
                                disabled={index === featuredEvents.length - 1}
                                aria-label="Move down"
                              >
                                <ArrowDown size={16} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteFeaturedEvent(index)}
                                aria-label="Delete event"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                            <div className="overflow-hidden rounded-lg bg-muted">
                              {ev.image ? (
                                <img
                                  src={ev.image}
                                  alt={ev.title || `Event ${index + 1}`}
                                  className="h-28 w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-28 place-items-center text-xs text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Title</Label>
                                  <Input
                                    value={ev.title}
                                    onChange={(e) => updateFeaturedEvent(index, { title: e.target.value })}
                                    placeholder="Event title"
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Location</Label>
                                  <Input
                                    value={ev.location}
                                    onChange={(e) => updateFeaturedEvent(index, { location: e.target.value })}
                                    placeholder="Event location"
                                    className="h-10"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input
                                  value={ev.image}
                                  onChange={(e) => updateFeaturedEvent(index, { image: e.target.value })}
                                  placeholder="https://..."
                                  className="h-10"
                                />
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setMediaTarget({ kind: 'slide', index })
                                  mediaModal.onOpen()
                                }}
                              >
                                <ImagePlus size={16} />
                                Select from Media Library
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/70 bg-background p-6 text-sm text-muted-foreground">
                      No featured events yet. Add one to start.
                    </div>
                  )}
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  {hasStructuredJsonEditor
                    ? 'This field has a visual editor. Raw JSON is optional.'
                    : 'Valid JSON array or object.'}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRawJson((v) => !v)}
                >
                  {showRawJson ? 'Hide raw JSON' : 'Show raw JSON'}
                </Button>
              </div>

              {showRawJson ? (
                <Textarea
                  value={
                    typeof item.content_json === 'string'
                      ? item.content_json
                      : JSON.stringify(item.content_json || '', null, 2)
                  }
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setItem({ ...item, content_json: parsed })
                    } catch {
                      setItem({ ...item, content_json: e.target.value })
                    }
                  }}
                  placeholder='{"key":"value"} or ["item1","item2"]'
                  rows={10}
                  className="font-mono text-sm"
                />
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Content Value</Label>
              {item.content_type === 'richtext' ? (
                <Textarea
                  value={item.content || ''}
                  onChange={(e) => setItem({ ...item, content: e.target.value })}
                  placeholder="Enter content…"
                  rows={8}
                />
              ) : (
                <div className="space-y-3">
                  <Input
                    value={item.content || ''}
                    onChange={(e) => setItem({ ...item, content: e.target.value })}
                    placeholder={
                      item.content_type === 'image'
                        ? 'https://example.com/image.jpg'
                        : item.content_type === 'number'
                          ? '123'
                          : 'Enter content…'
                    }
                    type={item.content_type === 'number' ? 'number' : 'text'}
                    className="h-10"
                  />

                  {item.content_type === 'image' || String(item.content_key || '').toLowerCase().includes('image') ? (
                    <div className="space-y-3">
                      {item.content ? (
                        <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                          <img
                            src={item.content}
                            alt="Selected"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMediaTarget({ kind: 'image' })
                          mediaModal.onOpen()
                        }}
                      >
                        <ImagePlus size={16} />
                        Select from Media Library
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={item.display_order}
                onChange={(e) =>
                  setItem({
                    ...item,
                    display_order: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={item.is_active ? 'true' : 'false'}
                onChange={(e) =>
                  setItem({ ...item, is_active: e.target.value === 'true' })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {item.updated_at ? (
            <div className="text-xs text-muted-foreground">
              Last updated: {formatAdminDateTime(item.updated_at)}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <MediaPickerModal
        isOpen={mediaModal.isOpen}
        onClose={() => {
          mediaModal.onClose()
          setMediaTarget(null)
        }}
        onSelect={(url) => {
          if (!mediaTarget) return
          if (mediaTarget.kind === 'image') {
            setItem((prev: any) => ({ ...prev, content: url }))
            return
          }
          if (mediaTarget.kind === 'slide') {
            if (isFeaturedEventsKey) {
              updateFeaturedEvent(mediaTarget.index, { image: url })
            } else {
              updateSlide(mediaTarget.index, { image: url })
            }
          }
        }}
      />
    </div>
  )
}
