'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/src/admin/components/Layout';
import { useAuth } from '@/src/admin/providers/AuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect if we're not loading and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Ensure SSR + first client render match to avoid hydration flicker/mismatch.
  if (!mounted || isLoading) {
    return (
      <div className="grid min-h-screen place-items-center" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/25 border-t-primary" suppressHydrationWarning />
          <div className="mt-4 text-sm text-muted-foreground" suppressHydrationWarning>Loading…</div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  return (
    <div suppressHydrationWarning>
      <Layout onLogout={logout}>{children}</Layout>
    </div>
  );
}
