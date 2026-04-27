import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

// Returns { "2026-04-20": ["09:00", "09:30"], ... } for all Supabase bookings in a date range
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'start_date and end_date required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin()
    .from('bookings')
    .select('consultation_date, consultation_time')
    .gte('consultation_date', startDate)
    .lte('consultation_date', endDate);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const taken: Record<string, string[]> = {};
  for (const row of (data ?? []) as { consultation_date: string; consultation_time: string }[]) {
    if (!row.consultation_date || !row.consultation_time) continue;
    if (!taken[row.consultation_date]) taken[row.consultation_date] = [];
    taken[row.consultation_date].push(row.consultation_time);
  }

  return NextResponse.json({ taken }, { headers: { 'Cache-Control': 'no-store' } });
}
