import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  const session = await auth()

  return NextResponse.json({
    hasSession: !!session,
    session: session
      ? {
          user: {
            id: session.user?.id,
            email: session.user?.email,
            name: session.user?.name,
            role: session.user?.role,
          },
          expires: session.expires,
        }
      : null,
    cookies: request.headers.get('cookie')?.substring(0, 200),
  })
}
