import { NextRequest, NextResponse } from 'next/server';
import { supabase, type Booking } from '@/src/lib/supabase';
import { Resend } from 'resend';
import { createCalendarEvent } from '@/src/lib/google-calendar';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const booking: Booking = await request.json();

    // Validate required fields
    if (!booking.first_name || !booking.last_name || !booking.email || !booking.phone ||
        !booking.consultation_date || !booking.consultation_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the slot is still available
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('consultation_date', booking.consultation_date)
      .eq('consultation_time', booking.consultation_time);

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please choose another time.' },
        { status: 409 }
      );
    }

    // Create booking in Supabase
    const { data: newBooking, error } = await supabase
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
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Send confirmation email to customer
    try {
      await resend.emails.send({
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
    } catch (emailError) {
      console.error('Failed to send customer email:', emailError);
      // Don't fail the booking if email fails
    }

    // Send notification email to business
    try {
      await resend.emails.send({
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
    } catch (emailError) {
      console.error('Failed to send business email:', emailError);
      // Don't fail the booking if email fails
    }

    // Add to Google Calendar
    try {
      await createCalendarEvent(newBooking);
      console.log('Google Calendar event created successfully');
    } catch (calendarError) {
      console.error('Failed to create Google Calendar event:', calendarError);
      // Don't fail the booking if calendar sync fails
    }

    return NextResponse.json(
      { message: 'Booking created successfully', booking: newBooking },
      { status: 201 }
    );

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all bookings (admin only - you'd want to add auth)
export async function GET() {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings });

  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
