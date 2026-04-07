import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function middleware(request: any) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ['/admin/setup', '/admin/login', '/admin/forgot-password']
  const isPublicPath = publicPaths.includes(pathname)

  // API routes that don't need auth check
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/debug')) {
    return NextResponse.next()
  }

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  try {
    const session = await auth()

    // If no session, redirect to login
    if (!session?.user) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin role
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      loginUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(loginUrl)
    }

    // Session is valid, proceed
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
