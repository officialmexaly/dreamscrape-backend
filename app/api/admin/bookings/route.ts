import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';
import { ErrorHandler, ErrorType, createErrorResponse } from '@/src/lib/error-handler';

function isDatabaseUnavailableError(error: any) {
  const message = String(error?.message || '');
  const details = String(error?.details || '');
  return (
    message.includes('fetch failed') ||
    message.includes('ETIMEDOUT') ||
    details.includes('ETIMEDOUT') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND')
  );
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isDatabaseUnavailableError(error)) {
        return NextResponse.json(
          { items: [], error: 'Database temporarily unavailable' },
          { status: 503 }
        );
      }
      const dbError = ErrorHandler.handleDatabaseError(error, {
        operation: 'fetch_bookings',
        table: 'bookings',
      });
      return createErrorResponse(dbError);
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { items: [], error: 'Database temporarily unavailable' },
        { status: 503 }
      );
    }
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
