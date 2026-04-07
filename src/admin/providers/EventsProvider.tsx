'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type EventItem = any;

type EventsContextValue = {
  events: EventItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createEvent: (draft: {
    title: string;
    event_date?: string | null;
    event_type: string;
    status?: 'draft' | 'published';
    featured_image?: string | null;
  }) => Promise<EventItem>;
  deleteEvent: (id: string) => Promise<void>;
};

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/events', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load events');
      setEvents(json.items || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const createEvent: EventsContextValue['createEvent'] = async (draft) => {
    // Minimal fields for blog posts
    const slugBase =
      (draft.title || 'event')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'event';
    const slug = `${slugBase}-${Date.now()}`;

    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        slug,
        title: draft.title,
        event_date: draft.event_date ?? null,
        event_type: draft.event_type,
        status: draft.status ?? 'draft',
        featured_image: draft.featured_image ?? '',
        description: '',
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'Failed to create event');
    setEvents((prev) => [json.item, ...prev]);
    return json.item;
  };

  const deleteEvent: EventsContextValue['deleteEvent'] = async (id) => {
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'Failed to delete event');
    setEvents((prev) => prev.filter((e: any) => e.id !== id));
  };

  const value = useMemo<EventsContextValue>(
    () => ({ events, isLoading, refresh, createEvent, deleteEvent }),
    [events, isLoading]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
}
