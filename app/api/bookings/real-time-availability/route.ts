import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// Cache availability for 5 minutes to reduce database queries
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const availabilityCache = new Map<string, { data: any; timestamp: number }>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${startDate}-${endDate}`;
    const cached = availabilityCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Fetch all bookings within the date range
    const { data: bookings, error } = await supabase()
      .from('bookings')
      .select('consultation_date, consultation_time')
      .gte('consultation_date', startDate)
      .lte('consultation_date', endDate);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch availability' },
        { status: 500 }
      );
    }

    // Group bookings by date
    const bookedSlots = new Map<string, string[]>();
    bookings?.forEach((booking: any) => {
      const date = booking.consultation_date;
      if (!bookedSlots.has(date)) {
        bookedSlots.set(date, []);
      }
      bookedSlots.get(date)?.push(booking.consultation_time);
    });

    // Format response
    const availability = {
      startDate,
      endDate,
      bookedDates: Array.from(bookedSlots.entries()).map(([date, times]) => ({
        date,
        bookedTimes: times
      })),
      generatedAt: new Date().toISOString()
    };

    // Cache the result
    availabilityCache.set(cacheKey, {
      data: availability,
      timestamp: Date.now()
    });

    return NextResponse.json(availability);

  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to check if a specific date/time is available
export async function checkSlotAvailability(date: string, time: string): Promise<boolean> {
  const { data: existingBookings } = await supabase()
    .from('bookings')
    .select('id')
    .eq('consultation_date', date)
    .eq('consultation_time', time)
    .limit(1);

  return !existingBookings || existingBookings.length === 0;
}
