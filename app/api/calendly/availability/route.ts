import { NextRequest, NextResponse } from 'next/server';

const CALENDLY_API = 'https://api.calendly.com';

// Returns { available: { "2026-04-17": ["09:00", "10:30", ...], ... } }
export async function GET(request: NextRequest) {
  const token = process.env.CALENDLY_API_TOKEN;
  const eventTypeUri = process.env.CALENDLY_EVENT_TYPE_URI;

  if (!token || !eventTypeUri) {
    return NextResponse.json({ error: 'Calendly not configured' }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const startTime = searchParams.get('start_time');
  const endTime = searchParams.get('end_time');

  if (!startTime || !endTime) {
    return NextResponse.json({ error: 'start_time and end_time required' }, { status: 400 });
  }

  // Calendly requires start_time strictly in the future — clamp to now + 15 min
  const clampedStart = new Date(Math.max(new Date(startTime).getTime(), Date.now() + 15 * 60 * 1000));
  const endDate = new Date(endTime);
  if (clampedStart >= endDate) {
    return NextResponse.json({ slots: [] });
  }

  const url = new URL(`${CALENDLY_API}/event_type_available_times`);
  url.searchParams.set('event_type', eventTypeUri);
  url.searchParams.set('start_time', clampedStart.toISOString());
  url.searchParams.set('end_time', endTime);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: 'Calendly API error', detail: err }, { status: res.status });
  }

  const data = await res.json();

  // Return raw ISO start_times — client groups by local timezone
  const slots: string[] = (data.collection ?? [])
    .filter((s: { status: string }) => s.status === 'available')
    .map((s: { start_time: string }) => s.start_time);

  return NextResponse.json({ slots });
}
