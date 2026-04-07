/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScrollReveal } from '../ScrollReveal';

type ServiceItem = {
  id: string;
  slug: string;
  category?: string | null;
  title: string;
  subtitle?: string | null;
  description: string;
  image?: string | null;
  list_items?: string[];
  cta_text?: string | null;
  cta_link?: string | null;
  display_order?: number;
};

const fallbackServices: ServiceItem[] = [
  {
    id: 'weddings',
    slug: 'luxury-wedding-planning',
    category: 'Weddings',
    title: 'Luxury Wedding Planning & Production',
    subtitle: 'Luxury Wedding Planning',
    description:
      'From intimate ceremonies to full wedding weekends, every detail is thoughtfully curated to reflect your vision with elegance and intention.',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop',
    list_items: [
      'Month-of Coordination',
      'Partial Planning',
      'Full Planning & Design',
      'Dreamscape Exclusive',
      'Destination Weddings (including international experiences such as Dallas, USA)',
    ],
    cta_text: 'Start Planning',
    cta_link: '/consultation-editorial',
    display_order: 1,
  },
  {
    id: 'private',
    slug: 'private-social-events',
    category: 'Private & Social Events',
    title: 'Elevated Personal Celebrations',
    subtitle: 'Private and Social Events',
    description:
      'From milestone birthdays to bridal showers and intimate dinners, we curate experiences that feel refined, seamless, and unforgettable.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8892b07439?q=80&w=2070&auto=format&fit=crop',
    list_items: [
      'Concept & mood board',
      'Vendor sourcing & coordination',
      'Styling guidance',
      'Timeline & logistics',
      'Full day-of execution',
    ],
    cta_text: 'Start Planning',
    cta_link: '/consultation-editorial',
    display_order: 2,
  },
  {
    id: 'corporate',
    slug: 'corporate-brand-events',
    category: 'Corporate, Brand & Industry Events',
    title: 'Strategy Meets Sophistication',
    subtitle: 'Corporate and Brand Events',
    description:
      'We partner with brands, entrepreneurs, and organizations to create experiences that communicate vision, elevate presence, and engage audiences.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop',
    list_items: ['Brand activations & launches', 'Corporate events & retreats', 'Expos, showcases & industry events'],
    cta_text: 'Start Planning',
    cta_link: '/consultation-editorial',
    display_order: 3,
  },
  {
    id: 'special',
    slug: 'special-public-events',
    category: 'Special & Public Events',
    title: 'Large-Scale, Seamlessly Executed',
    subtitle: 'Special and Public Events',
    description:
      'From cultural celebrations to charity galas and public showcases, Dreamscape delivers structured planning and smooth execution at scale.',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop',
    list_items: [],
    cta_text: 'Start Planning',
    cta_link: '/consultation-editorial',
    display_order: 4,
  },
  {
    id: 'destination',
    slug: 'destination-experiences',
    category: 'Destination & Luxury Experiences',
    title: 'Luxury Without Borders',
    subtitle: 'Destination Experiences',
    description:
      'From yachts to villas to international celebrations, we curate destination experiences that are immersive, seamless, and unforgettable.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
    list_items: [],
    cta_text: 'Start Planning',
    cta_link: '/consultation-editorial',
    display_order: 5,
  },
];

export function ServicesPage({ initialServices }: { initialServices?: ServiceItem[] }) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices?.length ? initialServices : fallbackServices);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/services', { cache: 'no-store' });
        const json = await res.json();
        if (res.ok && Array.isArray(json?.items)) {
          setServices(json.items);
        }
      } catch {
        // keep fallback if fetch fails
      }
    };
    if (!initialServices?.length) load();
  }, []);

  return (
    <div className="w-full pt-32 pb-24 bg-white">
      {/* PAGE INTRO */}
      <section className="container mx-auto px-6 py-16 lg:py-24 text-center max-w-4xl">
        <ScrollReveal direction="up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-dark mb-8 leading-tight">
            Curated Experiences for Every Occasion
          </h1>
          <p className="text-brand-gray font-light leading-relaxed text-lg mb-12">
            Dreamscape delivers full-service planning, coordination, and production across weddings, private celebrations, corporate events, and large-scale experiences all executed with structure, creativity, and precision.
          </p>
          <div className="w-24 h-[1px] bg-brand-pink mx-auto" />
        </ScrollReveal>
      </section>

      {services.map((service, index) => {
        const isReverse = index % 2 === 1;
        const isDark = index === 2;
        const sectionBg = isDark ? 'bg-brand-purple text-white' : index % 2 === 0 ? 'bg-brand-light' : 'bg-white';
        const labelColor = isDark ? 'text-white/50' : 'text-brand-gray';
        const titleColor = isDark ? 'text-white' : 'text-brand-dark';
        const textColor = isDark ? 'text-white/80' : 'text-brand-gray';
        const buttonClass = isDark
          ? 'border-white text-white hover:bg-white hover:text-brand-purple'
          : 'border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white';

        return (
          <section key={service.id} className={`py-24 ${sectionBg}`}>
            <div className="container mx-auto px-6">
              <div className={`flex flex-col lg:flex-row ${isReverse ? 'lg:flex-row-reverse' : ''} gap-16 items-center`}>
                <ScrollReveal direction={isReverse ? 'left' : 'right'} className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/5] w-full">
                    <img
                      src={service.image || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc'}
                      alt={service.title}
                      className="w-full h-full object-cover rounded-sm shadow-xl"
                    />
                  </div>
                </ScrollReveal>

                <ScrollReveal direction={isReverse ? 'right' : 'left'} className="w-full lg:w-1/2">
                  <h2 className={`text-xs tracking-[0.2em] uppercase mb-4 ${labelColor}`}>
                    {service.category || 'Services'}
                  </h2>
                  <h3 className={`text-3xl md:text-4xl font-serif mb-6 ${titleColor}`}>
                    {service.title}
                  </h3>
                  <p className={`${textColor} font-light leading-relaxed mb-10`}>
                    {service.description}
                  </p>

                  {service.list_items && service.list_items.length > 0 && (
                    <div className={`space-y-4 mb-10 ${isDark ? '' : ''}`}>
                      <p className={`text-sm uppercase tracking-[0.16em] ${isDark ? 'text-white/60' : 'text-brand-pink'}`}>
                        Planning Options (Preview Only)
                      </p>
                      <ul className={`space-y-3 ${textColor} font-light`}>
                        {service.list_items.map((item: string, itemIndex: number) => (
                          <li key={`${service.id}-${itemIndex}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a
                    href={service.cta_link || '/consultation-editorial'}
                    className={`inline-block rounded-full border px-6 py-3 text-sm uppercase tracking-[0.14em] transition-colors ${buttonClass}`}>
                    {service.cta_text || 'Start Planning'}
                  </a>
                </ScrollReveal>
              </div>
            </div>
          </section>
        );
      })}

      {/* FINAL CTA */}
      <section className="py-32 bg-white text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <ScrollReveal direction="up">
            <h2 className="text-4xl md:text-5xl font-serif text-brand-dark mb-10">
              Not sure where to start? Let's create something unforgettable together.
            </h2>
            <Link
              href="/consultation-editorial"
              className="rounded-full px-10 py-7 text-sm tracking-wider uppercase bg-brand-purple hover:bg-brand-pink text-white transition-colors inline-block">

              Book a Consultation
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>);

}
