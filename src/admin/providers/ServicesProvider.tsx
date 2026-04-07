'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ServiceItem = {
  id: string;
  slug: string;
  category?: string | null;
  title: string;
  subtitle?: string | null;
  description: string;
  image?: string | null;
  list_items?: string[];
  cta_text?: string | null;
  cta_link?: string | null;
  status?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
};

type ServicesContextValue = {
  services: ServiceItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createService: (payload: Partial<ServiceItem>) => Promise<ServiceItem>;
  updateService: (id: string, payload: Partial<ServiceItem>) => Promise<ServiceItem>;
  deleteService: (id: string) => Promise<void>;
};

const ServicesContext = createContext<ServicesContextValue | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/services', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok) {
        setServices(json.items || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const createService = async (payload: Partial<ServiceItem>) => {
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create service');
    setServices((prev) => [json.item, ...prev]);
    return json.item;
  };

  const updateService = async (id: string, payload: Partial<ServiceItem>) => {
    let res = await fetch(`/api/admin/services/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    let json = await res.json();
    if (!res.ok && payload.slug) {
      res = await fetch(`/api/admin/services/${payload.slug}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      json = await res.json();
    }
    if (!res.ok) throw new Error(json.error || 'Failed to update service');
    setServices((prev) => prev.map((s) => (s.id === json.item.id ? json.item : s)));
    return json.item;
  };

  const deleteService = async (id: string) => {
    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete service');
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const value = useMemo<ServicesContextValue>(
    () => ({ services, isLoading, refresh, createService, updateService, deleteService }),
    [services, isLoading]
  );

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices() {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useServices must be used within ServicesProvider');
  return ctx;
}
