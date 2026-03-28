import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/src/components/Navigation';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: 'Dreamscape Curated Events',
  description:
    'Luxury weddings, private celebrations, and elevated brand experiences thoughtfully designed and beautifully executed.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-brand-light" suppressHydrationWarning>
        <Navigation />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
