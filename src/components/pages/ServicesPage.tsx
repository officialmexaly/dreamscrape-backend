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

export default function ServicesPage({ initialServices }: { initialServices?: ServiceItem[] }) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices?.length ? initialServices : []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/services', { cache: 'no-store' });
        const json = await res.json();
        if (res.ok && Array.isArray(json?.items)) {
          setServices(json.items);
        }
      } catch {
        // keep current state if fetch fails
      }
    };
    if (!initialServices?.length) load();
  }, []);

  return (
    <div className="w-full pt-24 pb-16 md:pt-32 md:pb-24 bg-white">
      {/* PAGE INTRO */}
      <section className="container mx-auto px-4 sm:px-6 py-12 lg:py-24 text-center max-w-4xl">
        <ScrollReveal direction="up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-brand-dark mb-6 md:mb-8 leading-tight">
            Curated Experiences for Every Occasion
          </h1>
          <p className="text-brand-gray font-light leading-relaxed text-base md:text-lg mb-8 md:mb-12 px-2">
            Dreamscape delivers full-service planning, coordination, and production across weddings, private celebrations, corporate events, and large-scale experiences all executed with structure, creativity, and precision.
          </p>
          <div className="w-16 md:w-24 h-[1px] bg-brand-pink mx-auto" />
        </ScrollReveal>
      </section>

      {services.length ? services.map((service, index) => {
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
          <section key={service.id} className={`py-16 md:py-24 ${sectionBg}`}>
            <div className="container mx-auto px-4 sm:px-6">
              <div className={`flex flex-col lg:flex-row ${isReverse ? 'lg:flex-row-reverse' : ''} gap-8 md:gap-12 lg:gap-16 items-center`}>
                <ScrollReveal direction={isReverse ? 'left' : 'right'} className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover rounded-sm shadow-xl"
                      />
                    ) : (
                      <div className="h-full w-full rounded-sm bg-black/10" />
                    )}
                  </div>
                </ScrollReveal>

                <ScrollReveal direction={isReverse ? 'right' : 'left'} className="w-full lg:w-1/2">
                  <h2 className={`text-xs tracking-[0.2em] uppercase mb-3 md:mb-4 ${labelColor}`}>
                    {service.category || 'Services'}
                  </h2>
                  <h3 className={`text-2xl sm:text-3xl md:text-4xl font-serif mb-4 md:mb-6 ${titleColor} leading-tight`}>
                    {service.title}
                  </h3>
                  <p className={`${textColor} font-light leading-relaxed mb-6 md:mb-10 text-sm md:text-base`}>
                    {service.description}
                  </p>

                  {service.list_items && service.list_items.length > 0 && (
                    <div className={`space-y-3 md:space-y-4 mb-6 md:mb-10`}>
                      <p className={`text-xs sm:text-sm uppercase tracking-[0.16em] ${isDark ? 'text-white/60' : 'text-brand-pink'}`}>Planning Options</p>
                      <ul className={`space-y-2 md:space-y-3 ${textColor} font-light text-sm md:text-base`}>
                        {service.list_items.map((item: string, itemIndex: number) => (
                          <li key={`${service.id}-${itemIndex}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a
                    href={service.cta_link || '/consultation-editorial'}
                    className={`inline-block rounded-full border px-5 md:px-6 py-2.5 md:py-3 text-xs sm:text-sm uppercase tracking-[0.12em] md:tracking-[0.14em] transition-colors ${buttonClass}`}>
                    {service.cta_text || 'Start Planning'}
                  </a>
                </ScrollReveal>
              </div>
            </div>
          </section>
        );
      }) : (
        <section className="py-16 md:py-24 bg-brand-light">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="rounded-2xl md:rounded-3xl border border-brand-purple/10 bg-white px-6 md:px-8 py-8 md:py-10 text-center text-brand-gray">
              No services published yet.
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="py-20 md:py-32 bg-white text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <ScrollReveal direction="up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-brand-dark mb-6 md:mb-10 leading-tight px-2">
              Not sure where to start? Let's create something unforgettable together.
            </h2>
            <Link
              href="/consultation-editorial"
              className="rounded-full px-6 md:px-10 py-4 md:py-7 text-xs sm:text-sm tracking-wider uppercase bg-brand-purple hover:bg-brand-pink text-white transition-colors inline-block">

              Book a Consultation
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>);

}
