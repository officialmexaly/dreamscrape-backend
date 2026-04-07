# NextAuth v5 Implementation Guide

## Overview

This project uses NextAuth v5 (Auth.js) for authentication. The implementation provides secure admin authentication using credentials provider with JWT sessions.

## Files Modified/Created

### Core Files
- `auth.ts` - Main NextAuth configuration with credentials provider
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route handlers
- `middleware.ts` - Protected route middleware using NextAuth sessions
- `src/types/next-auth.d.ts` - TypeScript type definitions for NextAuth

### Client-Side
- `src/lib/next-auth-helpers.ts` - Client and server-side helper functions
- `src/admin/providers/AuthProvider.tsx` - Auth context using NextAuth sessions
- `src/admin/providers/Providers.tsx` - SessionProvider wrapper
- `src/admin/pages/LoginPage.tsx` - Login form using NextAuth signIn

## Environment Variables

Make sure these are set in your `.env.local`:

```env
# Admin credentials
ADMIN_EMAIL=admin@dreamscapeevents.com
ADMIN_PASSWORD=ChangeThisPassword123!

# NextAuth configuration
AUTH_SECRET=your-auth-secret-here
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

Generate `AUTH_SECRET` with: `openssl rand -base64 32`

## Usage

### Client-Side Authentication

```typescript
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>

  if (!session) {
    return <button onClick={() => signIn()}>Sign In</button>
  }

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### Server-Side Authentication (Server Components)

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    redirect('/admin/login')
  }

  return <div>Welcome, {session.user.name}</div>
}
```

### Server-Side Authentication (API Routes)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ data: 'Protected data' })
}
```

### Using Helper Functions

```typescript
// Client-side
import { useAdminSession, adminSignIn, adminSignOut } from '@/src/lib/next-auth-helpers'

export function MyComponent() {
  const { session, isAdmin, isLoading } = useAdminSession()

  const handleLogin = async () => {
    const result = await adminSignIn('email@example.com', 'password')
    if (result.success) {
      // Logged in successfully
    }
  }

  // ...
}

// Server-side
import { requireAdminSession } from '@/src/lib/next-auth-helpers'

export async function MyServerAction() {
  const session = await requireAdminSession()
  // session is guaranteed to be admin
}
```

## Protected Routes

The middleware automatically protects all routes under `/admin` except `/admin/login`. To add more protected routes, modify `middleware.ts`:

```typescript
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
```

## Session Data Structure

```typescript
{
  user: {
    id: string       // "admin"
    email: string    // admin email
    name: string     // "Admin"
    role: string     // "admin"
  }
  expires: string   // ISO date string
}
```

## Security Features

1. **JWT Sessions**: Secure tokens stored in HTTP-only cookies
2. **Password Comparison**: Credentials validated against environment variables
3. **Role-Based Access**: Middleware checks for admin role
4. **CSRF Protection**: Built into NextAuth
5. **Secure Cookies**: HTTP-only, SameSite=lax

## Migration from Custom Auth

If migrating from the old custom JWT system:

1. Remove `/api/admin/login` route (now handled by NextAuth)
2. Remove `/src/lib/jwt.ts` (no longer needed)
3. Update any components using `adminLogin()` to use NextAuth's `signIn()`
4. Update API routes using `getAdminUser()` to use `auth()`

## Troubleshooting

### Session not persisting
- Check `AUTH_SECRET` is set
- Verify cookies are being set in browser dev tools
- Check `NEXTAUTH_URL` matches your app URL

### Middleware not working
- Ensure middleware.ts is at project root
- Check matcher patterns are correct
- Verify session structure in callbacks

### TypeScript errors
- Ensure `src/types/next-auth.d.ts` exists
- Run `npm run typecheck` to verify

## Additional Resources

- [NextAuth v5 Docs](https://authjs.dev/)
- [NextAuth GitHub](https://github.com/nextauthjs/next-auth)
