'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/admin/providers/GolangAuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect after loading is complete
    if (!isLoading) {
      if (isAuthenticated) {
        // Use replace to avoid back button issues
        router.replace('/admin/dashboard');
      } else {
        router.replace('/admin/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
          <div className="mt-4 text-sm text-muted-foreground">Loading…</div>
        </div>
      </div>
    );
  }

  return null;
}
