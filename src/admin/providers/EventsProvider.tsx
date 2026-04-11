'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthProvider';

type EventItem = any;

type EventsContextValue = {
  events: EventItem[];
  isLoading: boolean;
  error: string | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch('/api/admin/events', {
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load events');
      setEvents(json.items || []);
    } catch (err) {
      const message = err instanceof Error
        ? (err.name === 'AbortError' ? 'Request timeout - please try again' : err.message)
        : 'Unknown error';
      console.error('Error loading events:', message);
      setError(message);
      // Set empty events on error to prevent crashes
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      void refresh();
    }
  }, [isAuthenticated, refresh]);

  const createEvent = async (draft: {
    title: string;
    event_date?: string | null;
    event_type: string;
    status?: 'draft' | 'published';
    featured_image?: string | null;
  }) => {
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'Failed to create event');
    const newEvent = json.item;
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const deleteEvent = async (id: string) => {
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete event');
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      isLoading,
      error,
      refresh,
      createEvent,
      deleteEvent,
    }),
    [events, isLoading, error, refresh]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    return {
      events: [],
      isLoading: false,
      error: null,
      refresh: async () => {},
      createEvent: async () => { throw new Error('EventsProvider not found'); },
      deleteEvent: async () => { throw new Error('EventsProvider not found'); },
    };
  }
  return context;
}
