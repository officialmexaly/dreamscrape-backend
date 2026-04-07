'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

export function MainLayoutWrapper({
  children,
  footerConfig,
}: {
  children: React.ReactNode;
  footerConfig?: {
    exploreLinks?: Array<{ label: string; href: string }>;
    companyLinks?: Array<{ label: string; href: string }>;
    connectLinks?: Array<{ label: string; href: string }>;
    copyright?: string;
  };
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Remove browser extension attributes that cause hydration mismatches
  useEffect(() => {
    const removeExtensionAttributes = () => {
      document.querySelectorAll('[bis_skin_checked]').forEach(el => {
        el.removeAttribute('bis_skin_checked');
      });
    };

    // Run immediately and periodically to catch dynamically added attributes
    removeExtensionAttributes();
    const interval = setInterval(removeExtensionAttributes, 500);

    // Also run on DOM mutations
    const observer = new MutationObserver(() => {
      removeExtensionAttributes();
    });

    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['bis_skin_checked']
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {!isAdmin && <Navigation />}
      {children}
      {!isAdmin && <Footer config={footerConfig} />}
    </>
  );
}
