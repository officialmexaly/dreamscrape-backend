import type { Metadata } from 'next';
import { Providers } from '@/src/admin/providers/Providers';

export const metadata: Metadata = {
  title: 'CMS Admin Portal',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>{children}</Providers>
  );
}

