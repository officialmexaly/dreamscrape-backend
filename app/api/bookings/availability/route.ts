import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { CACHE_DURATION } from '@/src/lib/cache';
import { ErrorHandler, ErrorType, createErrorResponse } from '@/src/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      throw ErrorHandler.createError(
        'Date parameter is required',
        ErrorType.VALIDATION,
        400,
        { providedParams: Array.from(searchParams.keys()) }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw ErrorHandler.createError(
        'Invalid date format. Use YYYY-MM-DD',
        ErrorType.VALIDATION,
        400,
        { providedDate: date }
      );
    }

    // Get all bookings for the specified date
    const { data: bookings, error } = await supabase()
      .from('bookings')
      .select('consultation_time')
      .eq('consultation_date', date);

    if (error) {
      throw ErrorHandler.handleDatabaseError(error, {
        operation: 'check_availability',
        date,
      });
    }

    // Extract booked time slots
    const bookedTimes = bookings?.map((booking: any) => booking.consultation_time) || [];

    const response = NextResponse.json({
      date,
      bookedTimes,
      available: bookedTimes.length < 10, // Assume max 10 slots per day
      totalSlots: 10,
      bookedSlots: bookedTimes.length,
    });

    // Add shorter cache headers for availability (real-time data)
    response.headers.set('Cache-Control', `public, max-age=${CACHE_DURATION.AVAILABILITY}, stale-while-revalidate=${CACHE_DURATION.AVAILABILITY}`);
    response.headers.set('CDN-Cache-Control', `public, max-age=${CACHE_DURATION.AVAILABILITY}, stale-while-revalidate=${CACHE_DURATION.AVAILABILITY}`);

    return response;

  } catch (error) {
    const appError = error instanceof Error ? error : ErrorHandler.createError(
      'Failed to check availability',
      ErrorType.INTERNAL,
      500
    );
    ErrorHandler.logError(appError, { operation: 'check_availability' });
    return createErrorResponse(appError);
  }
}
