import { NextRequest, NextResponse } from 'next/server';
import { supabase, type Booking } from '@/src/lib/supabase';
import { Resend } from 'resend';
import { createCalendarEvent } from '@/src/lib/google-calendar';
import { bookingSchema, sanitizeInput } from '@/src/lib/validation';
import { rateLimitMiddleware } from '@/src/lib/rate-limit';
import { ErrorHandler, ErrorType, createErrorResponse } from '@/src/lib/error-handler';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw ErrorHandler.createError(
      'Email service is not configured',
      ErrorType.EMAIL,
      500,
      { missingKey: 'RESEND_API_KEY' }
    );
  }
  return new Resend(apiKey);
}

/**
 * Send email with retry logic and error handling
 */
async function sendEmailWithRetry(
  sendFn: () => Promise<any>,
  maxRetries: number = 3,
  context: Record<string, any> = {}
): Promise<{ success: boolean; error?: any }> {
  try {
    await ErrorHandler.retry(sendFn, maxRetries, 1000, context);
    return { success: true };
  } catch (error) {
    const emailError = ErrorHandler.handleEmailError(error as { message?: string }, context.recipient);
    ErrorHandler.logError(emailError, context);
    return { success: false, error: emailError };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, 'booking');
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    // Parse and validate request body
    const rawBooking = await request.json().catch((error) => {
      throw ErrorHandler.createError(
        'Invalid JSON in request body',
        ErrorType.VALIDATION,
        400,
        { originalError: error.message }
      );
    });

    // Sanitize inputs
    const sanitizedBooking = {
      ...rawBooking,
      first_name: sanitizeInput(rawBooking.first_name),
      last_name: sanitizeInput(rawBooking.last_name),
      email: sanitizeInput(rawBooking.email.toLowerCase()),
      phone: sanitizeInput(rawBooking.phone),
      event_location: rawBooking.event_location ? sanitizeInput(rawBooking.event_location) : undefined,
      budget: rawBooking.budget ? sanitizeInput(rawBooking.budget) : undefined,
      guests: rawBooking.guests ? sanitizeInput(rawBooking.guests) : undefined,
      how_did_you_hear: rawBooking.how_did_you_hear ? sanitizeInput(rawBooking.how_did_you_hear) : undefined,
      additional_details: rawBooking.additional_details ? sanitizeInput(rawBooking.additional_details) : undefined,
    };

    // Validate using Zod schema
    const validationResult = bookingSchema.safeParse(sanitizedBooking);

    if (!validationResult.success) {
      const validationError = ErrorHandler.handleValidationError(
        validationResult.error.issues.map((issue) => ({
          path: issue.path.map(String),
          message: issue.message
        })),
        { bookingData: sanitizedBooking }
      );
      ErrorHandler.logError(validationError);
      return createErrorResponse(validationError);
    }

    const booking = validationResult.data as Booking;

    // Validate required fields
    if (!booking.first_name || !booking.last_name || !booking.email || !booking.phone ||
        !booking.consultation_date || !booking.consultation_time) {
      throw ErrorHandler.createError(
        'Missing required fields',
        ErrorType.VALIDATION,
        400,
        { providedFields: Object.keys(booking) }
      );
    }

    // Check if the slot is still available
    const { data: existingBookings, error: availabilityCheckError } = await supabase()
      .from('bookings')
      .select('*')
      .eq('consultation_date', booking.consultation_date)
      .eq('consultation_time', booking.consultation_time);

    if (availabilityCheckError) {
      throw ErrorHandler.handleDatabaseError(
        availabilityCheckError,
        { operation: 'check_availability', date: booking.consultation_date, time: booking.consultation_time }
      );
    }

    if (existingBookings && existingBookings.length > 0) {
      throw ErrorHandler.createError(
        'This time slot is no longer available. Please choose another time.',
        ErrorType.CONFLICT,
        409,
        { date: booking.consultation_date, time: booking.consultation_time }
      );
    }

    // Create booking in Supabase
    const { data: newBooking, error: insertError } = await supabase()
      .from('bookings')
      .insert([{
        first_name: booking.first_name,
        last_name: booking.last_name,
        email: booking.email,
        phone: booking.phone,
        event_date: booking.event_date || null,
        event_location: booking.event_location || null,
        event_types: booking.event_types,
        budget: booking.budget || null,
        guests: booking.guests || null,
        how_did_you_hear: booking.how_did_you_hear || null,
        additional_details: booking.additional_details || null,
        consultation_date: booking.consultation_date,
        consultation_time: booking.consultation_time,
        file_urls: booking.file_urls || [],
        file_names: booking.file_names || [],
      }] as any)
      .select()
      .single();

    if (insertError) {
      throw ErrorHandler.handleDatabaseError(
        insertError,
        { operation: 'create_booking', email: booking.email }
      );
    }

    // Send confirmation email to customer
    const customerEmailResult = await sendEmailWithRetry(
      async () => {
        const resend = getResendClient();
        return await resend.emails.send({
          from: 'Dreamscape Curated Events <bookings@dreamscapeevents.com>',
          to: [booking.email],
          subject: 'Consultation Booking Confirmed',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #40153F;">Consultation Booking Confirmed</h1>
              <p>Dear ${booking.first_name} ${booking.last_name},</p>
              <p>Your consultation has been successfully booked. Here are the details:</p>
              <div style="background-color: #FCFAF7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Date:</strong> ${new Date(booking.consultation_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${booking.consultation_time}</p>
                ${booking.event_date ? `<p><strong>Event Date:</strong> ${new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
                ${booking.event_location ? `<p><strong>Event Location:</strong> ${booking.event_location}</p>` : ''}
              </div>
              <p>We look forward to speaking with you and helping bring your vision to life!</p>
              <p>If you need to reschedule, please reply to this email.</p>
              <p style="margin-top: 30px;">Best regards,<br>Dreamscape Curated Events Team</p>
            </div>
          `,
        });
      },
      3,
      { recipient: booking.email, emailType: 'customer_confirmation', bookingId: newBooking.id }
    );

    if (!customerEmailResult.success) {
      console.error('Failed to send customer email after retries:', customerEmailResult.error);
      // Store email error for response but don't fail the booking
    }

    // Send notification email to business
    const businessEmailResult = await sendEmailWithRetry(
      async () => {
        const resend = getResendClient();
        return await resend.emails.send({
          from: 'Dreamscape Bookings <bookings@dreamscapeevents.com>',
          to: ['dreamscapeventts@gmail.com'],
          subject: `New Consultation Booking: ${booking.first_name} ${booking.last_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #40153F;">New Consultation Booking</h1>
              <p>You have a new consultation booking from:</p>
              <div style="background-color: #FCFAF7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${booking.first_name} ${booking.last_name}</p>
                <p><strong>Email:</strong> ${booking.email}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Consultation Date:</strong> ${new Date(booking.consultation_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Consultation Time:</strong> ${booking.consultation_time}</p>
                ${booking.event_date ? `<p><strong>Event Date:</strong> ${new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
                ${booking.event_location ? `<p><strong>Event Location:</strong> ${booking.event_location}</p>` : ''}
                ${booking.budget ? `<p><strong>Budget:</strong> ${booking.budget}</p>` : ''}
                ${booking.guests ? `<p><strong>Guests:</strong> ${booking.guests}</p>` : ''}
                ${booking.event_types?.length ? `<p><strong>Event Types:</strong> ${booking.event_types.join(', ')}</p>` : ''}
                ${booking.how_did_you_hear ? `<p><strong>How did they hear:</strong> ${booking.how_did_you_hear}</p>` : ''}
                ${booking.additional_details ? `<p><strong>Additional Details:</strong> ${booking.additional_details}</p>` : ''}
              </div>
              <p>Please contact the client to confirm the consultation.</p>
            </div>
          `,
        });
      },
      3,
      { recipient: 'dreamscapeventts@gmail.com', emailType: 'business_notification', bookingId: newBooking.id }
    );

    if (!businessEmailResult.success) {
      console.error('Failed to send business email after retries:', businessEmailResult.error);
    }

    // Add to Google Calendar (skipped if credentials not configured)
    try {
      await ErrorHandler.retry(
        () => createCalendarEvent(newBooking),
        2,
        1000,
        { bookingId: newBooking.id }
      );
    } catch (calendarError) {
      const calendarErr = ErrorHandler.createError(
        'Failed to sync with Google Calendar',
        ErrorType.INTERNAL,
        500,
        { bookingId: newBooking.id, originalError: calendarError }
      );
      ErrorHandler.logError(calendarErr);
      // Don't fail the booking if calendar sync fails
    }

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking: newBooking,
        warnings: [
          !customerEmailResult.success ? 'Customer confirmation email failed to send' : undefined,
          !businessEmailResult.success ? 'Business notification email failed to send' : undefined,
        ].filter(Boolean)
      },
      { status: 201 }
    );

  } catch (error) {
    const appError = error instanceof Error ? error : ErrorHandler.createError(
      'An unexpected error occurred',
      ErrorType.INTERNAL,
      500
    );
    ErrorHandler.logError(appError, { operation: 'create_booking' });
    return createErrorResponse(appError);
  }
}

// GET endpoint to retrieve all bookings (admin only - you'd want to add auth)
export async function GET() {
  try {
    const { data: bookings, error } = await supabase()
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw ErrorHandler.handleDatabaseError(error, { operation: 'fetch_bookings' });
    }

    return NextResponse.json({ bookings });

  } catch (error) {
    const appError = error instanceof Error ? error : ErrorHandler.createError(
      'Failed to fetch bookings',
      ErrorType.DATABASE,
      500
    );
    ErrorHandler.logError(appError, { operation: 'fetch_bookings' });
    return createErrorResponse(appError);
  }
}
