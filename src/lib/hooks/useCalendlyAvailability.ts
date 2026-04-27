'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type AvailabilityMap = Record<string, string[]>;

function localDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function groupSlots(slots: string[]): AvailabilityMap {
  const map: AvailabilityMap = {};
  for (const iso of slots) {
    const d = new Date(iso);
    const key = localDateKey(d);
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (!map[key]) map[key] = [];
    map[key].push(time);
  }
  return map;
}

// Returns the Monday of the week containing `date`
function weekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon ...
  d.setDate(d.getDate() - day); // go back to Sunday
  d.setHours(0, 0, 0, 0);
  return d;
}

export function useCalendlyAvailability() {
  const [available, setAvailable] = useState<AvailabilityMap>({});
  const [loading, setLoading] = useState(false);
  // Track which week-start keys have already been fetched
  const fetchedWeeks = useRef<Set<string>>(new Set());
  // Track which individual dates we have data for (fetched + parsed)
  const fetchedDates = useRef<Set<string>>(new Set());

  const fetchWeek = useCallback(async (weekStartDate: Date) => {
    const weekKey = localDateKey(weekStartDate);
    if (fetchedWeeks.current.has(weekKey)) return;
    fetchedWeeks.current.add(weekKey);

    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Mark all 7 days as fetched so isDateBooked works correctly even if no slots
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      fetchedDates.current.add(localDateKey(d));
    }

    const startDateStr = localDateKey(weekStartDate);
    const endDateStr = localDateKey(endDate);

    setLoading(true);
    try {
      // Fetch Calendly availability and Supabase taken slots in parallel
      const [calendlyRes, takenRes] = await Promise.all([
        fetch(
          `/api/calendly/availability?start_time=${encodeURIComponent(weekStartDate.toISOString())}&end_time=${encodeURIComponent(endDate.toISOString())}`
        ),
        fetch(
          `/api/bookings/taken-slots?start_date=${startDateStr}&end_date=${endDateStr}`
        ),
      ]);

      if (!calendlyRes.ok) {
        fetchedWeeks.current.delete(weekKey);
        for (let i = 0; i < 7; i++) {
          const d = new Date(weekStartDate);
          d.setDate(d.getDate() + i);
          fetchedDates.current.delete(localDateKey(d));
        }
        return;
      }

      const calendlyData: { slots: string[] } = await calendlyRes.json();
      const grouped = groupSlots(calendlyData.slots ?? []);

      // Subtract Supabase-booked times (stored as local HH:MM, same as what we display)
      if (takenRes.ok) {
        const takenData: { taken: Record<string, string[]> } = await takenRes.json();
        for (const [date, times] of Object.entries(takenData.taken)) {
          if (grouped[date]) {
            grouped[date] = grouped[date].filter((t) => !times.includes(t));
          }
        }
      }

      setAvailable((prev) => ({ ...prev, ...grouped }));
    } catch {
      fetchedWeeks.current.delete(weekKey);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all weeks that overlap with a given month
  const fetchMonth = useCallback((year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const current = weekStart(firstDay);
    while (current <= lastDay) {
      fetchWeek(new Date(current));
      current.setDate(current.getDate() + 7);
    }
  }, [fetchWeek]);

  // Pre-fetch current and next month on mount
  useEffect(() => {
    const now = new Date();
    fetchMonth(now.getFullYear(), now.getMonth());
    fetchMonth(now.getFullYear(), now.getMonth() + 1);
  }, [fetchMonth]);

  const onMonthChange = useCallback((date: Date) => {
    fetchMonth(date.getFullYear(), date.getMonth());
  }, [fetchMonth]);

  const isDateBooked = useCallback((date: Date): boolean => {
    const key = localDateKey(date);
    if (!fetchedDates.current.has(key)) return false; // not yet fetched → show as available
    return !(key in available) || available[key].length === 0;
  }, [available]);

  const isSlotBooked = useCallback((date: Date, time: string): boolean => {
    const key = localDateKey(date);
    if (!(key in available)) return true;
    return !available[key].includes(time);
  }, [available]);

  const getAvailableTimes = useCallback((date: Date): string[] => {
    return available[localDateKey(date)] ?? [];
  }, [available]);

  // Remove a specific slot from local state after a 409 conflict
  const removeSlot = useCallback((date: Date, time: string) => {
    const key = localDateKey(date);
    setAvailable((prev) => {
      if (!prev[key]) return prev;
      const updated = prev[key].filter((t) => t !== time);
      return { ...prev, [key]: updated };
    });
  }, []);

  return { isDateBooked, isSlotBooked, getAvailableTimes, onMonthChange, removeSlot, loading };
}
