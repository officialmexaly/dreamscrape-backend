'use client'

import * as React from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/src/admin/toast/ToastProvider'

interface LoginPageProps {
  callbackUrl?: string
}

export function LoginPage({ callbackUrl = '/admin/dashboard' }: LoginPageProps) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: 'Missing details',
        description: 'Please enter both email and password.',
        variant: 'error',
        duration: 3000,
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false, // We'll handle redirect manually
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Successful login - redirect immediately
      router.push(callbackUrl)
    } catch (err: any) {
      setIsLoading(false)
      toast({
        title: 'Authentication failed',
        description: err?.message || 'Invalid email or password',
        variant: 'error',
        duration: 4500,
      })
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_10%,rgba(64,21,63,0.16)_0%,rgba(64,21,63,0)_45%),radial-gradient(circle_at_85%_30%,rgba(201,168,76,0.14)_0%,rgba(201,168,76,0)_45%),linear-gradient(180deg,#F7FAFC_0%,#FFFFFF_100%)] p-4">
      <Card className="w-full max-w-md bg-background/85 shadow-[0_30px_90px_rgba(2,6,23,0.22)] backdrop-blur">
        <CardHeader className="text-center">
          <div className="relative mx-auto mb-2">
            <Image
              src="/logo.png"
              alt="Dreamscape"
              width={200}
              height={80}
              priority
              className="mx-auto object-contain"
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mt-4">
            Admin Portal
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dreamscape.com"
                className="h-10"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => router.push('/admin/forgot-password')}
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="h-10 w-full" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              Secure admin portal
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

