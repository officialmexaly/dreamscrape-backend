'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Simple admin check (replace with proper auth in production)
  const ADMIN_CREDENTIALS = {
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@dreamscapeevents.com',
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid credentials');
      } else {
        // Store admin session
        localStorage.setItem('admin_session', data.token);
        router.push('/admin');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-brand-gray hover:text-brand-pink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-serif text-brand-dark mb-2 text-center">
            Admin Login
          </h1>
          <p className="text-center text-brand-gray mb-8">
            Sign in to access the admin dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dreamscapeevents.com"
                required
                disabled={isLoading}
                className="border-brand-purple/15 rounded-full h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••"
                required
                disabled={isLoading}
                className="border-brand-purple/15 rounded-full h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-purple hover:bg-brand-pink text-white rounded-full h-11 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-brand-gray">
            <p>Contact support if you forgot your credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
}
