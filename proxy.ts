import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function proxy(request: any) {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // Public paths that don't require authentication
  const publicPaths = ['/admin/setup', '/admin/login', '/admin/forgot-password']
  const isPublicPath = publicPaths.includes(pathname)

  // API routes that don't need auth check
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/debug')) {
    return NextResponse.next()
  }

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  try {
    // Add timeout to auth check
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    )

    const session = (await Promise.race([auth(), timeoutPromise])) as any

    // If no session, redirect to login
    if (!session?.user) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin role
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next({ request: { headers: requestHeaders } })
  } catch (error) {
    console.error('Proxy auth error:', error)
    // On auth errors, redirect to login
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
