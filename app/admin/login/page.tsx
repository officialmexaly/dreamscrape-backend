'use client'

import { useSearchParams } from 'next/navigation'
import { LoginPage } from '@/src/admin/pages/LoginPage'

export default function LoginRoute() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'

  return <LoginPage callbackUrl={callbackUrl} />
}
