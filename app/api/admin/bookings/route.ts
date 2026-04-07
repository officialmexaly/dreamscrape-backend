import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';
import { ErrorHandler, ErrorType, createErrorResponse } from '@/src/lib/error-handler';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      const dbError = ErrorHandler.handleDatabaseError(error, {
        operation: 'fetch_bookings',
        table: 'bookings',
      });
      return createErrorResponse(dbError);
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    const appError = error instanceof Error
      ? error
      : ErrorHandler.createError(
          'Failed to fetch bookings',
          ErrorType.DATABASE,
          500
        );
    ErrorHandler.logError(appError, { operation: 'fetch_bookings' });
    return createErrorResponse(appError);
  }
}

