'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type InquiryItem = any;

type InquiriesContextValue = {
  inquiries: InquiryItem[];
  setInquiries: React.Dispatch<React.SetStateAction<InquiryItem[]>>;
  isLoading: boolean;
  refresh: () => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
};

const InquiriesContext = createContext<InquiriesContextValue | null>(null);

export function InquiriesProvider({ children }: { children: React.ReactNode }) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/bookings', { cache: 'no-store' });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        console.error('Failed to load bookings:', json?.error || res.statusText);
        setInquiries([]);
        return;
      }

      const mapped = (json.items || []).map((b: any) => ({
        id: b.id,
        name: `${b.first_name ?? ''} ${b.last_name ?? ''}`.trim(),
        email: b.email,
        eventType: Array.isArray(b.event_types) && b.event_types.length ? b.event_types.join(', ') : '—',
        date: b.created_at ?? new Date().toISOString(),
        status: 'Submitted',
        raw: b,
      }));
      setInquiries(mapped);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setInquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const deleteInquiry: InquiriesContextValue['deleteInquiry'] = async (id) => {
    const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'Failed to delete booking');
    setInquiries((prev) => prev.filter((i: any) => i.id !== id));
  };

  const value = useMemo<InquiriesContextValue>(
    () => ({ inquiries, setInquiries, isLoading, refresh, deleteInquiry }),
    [inquiries, setInquiries, isLoading]
  );

  return <InquiriesContext.Provider value={value}>{children}</InquiriesContext.Provider>;
}

export function useInquiries() {
  const ctx = useContext(InquiriesContext);
  if (!ctx) throw new Error('useInquiries must be used within InquiriesProvider');
  return ctx;
}
