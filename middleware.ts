import { NextResponse } from 'next/server';
import { createMiddlewareClient } from 'next-auth/react';

export async function middleware(request: any) {
  // For NextAuth v5 beta, use the new middleware pattern
  const response = NextResponse.next();

  // Skip middleware for non-admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return response;
  }

  // Skip middleware for login page
  if (request.nextUrl.pathname === '/admin/login') {
    return response;
  }

  // Check for session token
  const sessionToken = request.cookies.get('next-auth.session-token')?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
