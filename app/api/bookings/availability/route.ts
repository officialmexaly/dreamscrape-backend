import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Get all bookings for the specified date
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('consultation_time')
      .eq('consultation_date', date);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    // Extract booked time slots
    const bookedTimes = bookings?.map(booking => booking.consultation_time) || [];

    return NextResponse.json({
      date,
      bookedTimes,
      available: true
    });

  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
