'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from './ui/sheet';

export function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const hasImageHero =
    pathname === '/' ||
    pathname.startsWith('/portfolio') ||
    pathname === '/love-notes' ||
    pathname === '/consultation-editorial';
  const useLightNav = hasImageHero && !isScrolled;
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navItems = [
  {
    href: '/',
    label: 'Home'
  },
  {
    href: '/about',
    label: 'About'
  },
  {
    href: '/services',
    label: 'Services'
  },
  {
    href: '/portfolio',
    label: 'Blog'
  },
  {
    href: '/contact',
    label: 'Contact'
  }];

  const isActive = (href: string) => {
    if (href === '/portfolio') {
      return pathname.startsWith('/portfolio');
    }

    return pathname === href;
  };

  const isConsultationActive =
    pathname === '/consultation-editorial' || pathname === '/consultation';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-3 md:py-4' : 'bg-transparent py-4 md:py-6'}`}>
      
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center">
          <div
            className={`relative h-12 w-32 sm:h-14 sm:w-40 md:h-16 md:w-52 transition-all duration-500 ${
              useLightNav
                ? 'scale-[1.02] drop-shadow-[0_12px_30px_rgba(255,255,255,0.28)]'
                : 'drop-shadow-none'
            }`}>
            {useLightNav && (
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.18),transparent_44%)] blur-xl" />
            )}
            <Image
              src="/logo.png"
              alt="Dreamscape Curated Events"
              fill
              priority
              className="object-contain object-left relative z-10"
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) =>
          <Link
            key={item.href}
            href={item.href}
            className={`relative inline-flex items-center justify-center pb-3 text-xs font-semibold tracking-[0.15em] uppercase transition-colors ${
              isActive(item.href)
                ? useLightNav
                  ? 'text-white'
                  : 'text-brand-dark'
                : useLightNav
                  ? 'text-white/90 hover:text-white'
                  : 'text-brand-dark hover:text-brand-pink'
            }`}>
              {item.label}
              <span
                className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-brand-pink transition-all duration-300 ${
                  isActive(item.href) ? 'w-6 opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </Link>
          )}
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center space-x-4">
          <Link href="/consultation-editorial">
            <Button
              className={`hidden md:inline-flex rounded-full px-6 py-2 text-xs tracking-wider uppercase transition-all ${
                isConsultationActive
                  ? 'bg-brand-pink text-white shadow-[0_10px_30px_rgba(198,100,147,0.28)]'
                  : useLightNav
                    ? 'bg-white text-brand-purple hover:bg-white/90'
                    : 'bg-brand-purple hover:bg-brand-pink text-white'
              }`}>

              Book a Consultation
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger
              className={`md:hidden min-h-11 px-2 text-sm tracking-[0.18em] uppercase ${useLightNav ? 'text-white' : 'text-brand-dark'}`}>

              MENU
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-[400px] bg-white/95 backdrop-blur-xl border-l-0">

              <div className="flex flex-col h-full justify-center space-y-7 px-6">
                {navItems.map((item) =>
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-[1.75rem] leading-none font-serif text-left transition-colors ${isActive(item.href) ? 'text-brand-pink' : 'text-brand-dark hover:text-brand-purple'}`}>

                    {item.label}
                  </Link>
                )}
                <div className="pt-8 border-t border-brand-gray/20">
                  <Link href="/consultation-editorial" className="w-full">
                    <Button
                      className={`w-full min-h-12 rounded-full text-sm tracking-[0.14em] uppercase ${
                        isConsultationActive
                          ? 'bg-brand-pink text-white'
                          : 'bg-brand-purple hover:bg-brand-pink text-white'
                      }`}>

                      Book a Consultation
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>);

}
