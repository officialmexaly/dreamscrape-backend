'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import InquiryForm from '../InquiryForm';
import { ScrollReveal } from '../ScrollReveal';

const DEFAULT_CONTACT_CARDS = [
  {
    label: 'Email',
    value: 'dreamscapeventts@gmail.com',
    href: 'mailto:dreamscapeventts@gmail.com'
  },
  {
    label: 'Phone',
    value: '+1 (365) 987-9393',
    href: 'tel:+13659879393'
  },
  {
    label: 'WhatsApp',
    value: '+1 (365) 987-9393',
    href: 'https://wa.me/13659879393'
  },
  {
    label: 'Instagram',
    value: '@dreamscapeventts',
    href: 'https://instagram.com/dreamscapeventts'
  }
] as const;

type ContactCard = { label: string; value: string; href: string };

export function ContactPage({ initialCards }: { initialCards?: ContactCard[] }) {
  const [contactCards, setContactCards] = useState<ContactCard[]>(
    initialCards?.length ? initialCards : [...DEFAULT_CONTACT_CARDS]
  );

  // Fetch contact cards from database
  useEffect(() => {
    if (initialCards?.length) return;
    const fetchContactCards = async () => {
      try {
        const res = await fetch('/api/site-content?page=contact&section=contact_info', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const data = json.grouped?.contact_contact_info || {};
          const cards = data.cards?.value || [];
          if (cards.length > 0) {
            setContactCards(cards);
          }
        }
      } catch (error) {
        console.error('Failed to load contact cards:', error);
      }
    };

    fetchContactCards();
  }, [initialCards?.length]);
  return (
    <div className="w-full bg-brand-light min-h-screen pt-40 md:pt-44 pb-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal direction="up" className="mb-24 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-brand-pink">
            Contact
          </p>
          <h1 className="mx-auto mb-5 max-w-3xl text-4xl font-serif leading-tight text-brand-dark sm:text-5xl md:text-6xl">
            Let's Plan Your Experience
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-brand-gray sm:text-lg">
            Dreamscape Curated Events plans weddings, private celebrations, and
            elevated brand experiences with clarity, elegance, and structure.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" className="mb-24 pt-4 md:pt-6">
          <section>
            <div className="mb-8 max-w-2xl">
              <p className="mb-3 text-base uppercase tracking-[0.24em] text-brand-pink md:text-lg">
                Contact Details
              </p>
              <h2 className="mb-4 text-4xl font-serif leading-tight text-brand-dark sm:text-5xl">
                Reach Dreamscape directly
              </h2>
              <p className="text-base leading-relaxed text-brand-gray">
                Serving the Greater Toronto Area (GTA), Canada & Worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactCards.map((card) => (
                <a
                  key={card.label}
                  href={card.href}
                  className="border-t border-brand-purple/10 px-0 py-5 transition-colors hover:border-brand-pink/30 md:pr-6">
                  <p className="mb-2 text-[0.68rem] uppercase tracking-[0.18em] text-brand-pink">
                    {card.label}
                  </p>
                  <p className="text-sm leading-relaxed text-brand-dark sm:text-base">
                    {card.value}
                  </p>
                </a>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="up" className="mb-24">
          <section>
            <div className="mb-8 max-w-2xl">
              <p className="mb-3 text-base uppercase tracking-[0.24em] text-brand-pink md:text-lg">
                Inquiry Form
              </p>
              <h2 className="mb-4 text-4xl font-serif leading-tight text-brand-dark sm:text-5xl">
                Let's Begin Your Dreamscape Experience
              </h2>
              <p className="text-base leading-relaxed text-brand-gray">
                Please share a few details so we can thoughtfully design and curate your event.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12">
              <InquiryForm />
            </div>
          </section>
        </ScrollReveal>

        {/* CALENDLY BOOKING SECTION */}
        <ScrollReveal direction="up" className="mb-24">
          <section className="bg-brand-purple text-white rounded-2xl p-8 md:p-12 lg:p-16 text-center">
            <p className="mb-3 text-base uppercase tracking-[0.24em] text-brand-pink md:text-lg">
              Quick Booking
            </p>
            <h2 className="mb-4 text-3xl md:text-4xl font-serif leading-tight sm:text-5xl">
              Prefer to Book a Call Directly?
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-white/80 mb-8 max-w-2xl mx-auto">
              Schedule a consultation at your convenience using our Calendly booking system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="rounded-full px-8 py-4 bg-white text-brand-purple hover:bg-brand-light">
                <a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer">
                  Book via Calendly
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-8 py-4 border-white text-white hover:bg-white/10">
                <Link href="/consultation-editorial">
                  Consultation Form
                </Link>
              </Button>
            </div>
          </section>
        </ScrollReveal>

        {/* NEWSLETTER SECTION */}
        <ScrollReveal direction="up" className="mb-24">
          <section className="border-t border-b border-brand-purple/10 py-12 md:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <p className="mb-3 text-base uppercase tracking-[0.24em] text-brand-pink md:text-lg">
                Stay Connected
              </p>
              <h2 className="mb-4 text-3xl md:text-4xl font-serif leading-tight text-brand-dark">
                Join Our Newsletter
              </h2>
              <p className="text-base leading-relaxed text-brand-gray mb-8">
                Be the first to know about new services, planning tips, and exclusive offers.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 h-12 rounded-full border-brand-purple/12 bg-white px-5"
                />
                <Button
                  type="submit"
                  className="h-12 rounded-full bg-brand-purple px-8 text-sm uppercase tracking-[0.14em] text-white hover:bg-brand-pink whitespace-nowrap">
                  Subscribe
                </Button>
              </form>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}

export default ContactPage;
