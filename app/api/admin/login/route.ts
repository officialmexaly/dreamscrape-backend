import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/src/lib/rate-limit';

const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@dreamscapeevents.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, 'general');
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const { email, password } = await request.json();

    // Validate credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Create simple JWT-like token (in production, use proper JWT)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

      return NextResponse.json({
        success: true,
        token,
        user: {
          email,
          name: 'Admin',
          role: 'admin',
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
