'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollReveal } from '../ScrollReveal';
export function ServicesPage() {
  return (
    <div className="w-full pt-32 pb-24 bg-white">
      {/* PAGE INTRO */}
      <section className="container mx-auto px-6 py-16 lg:py-24 text-center max-w-4xl">
        <ScrollReveal direction="up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-dark mb-8 leading-tight">
            Curated Experiences for Every Occasion
          </h1>
          <p className="text-brand-gray font-light leading-relaxed text-lg mb-12">
            Dreamscape delivers full-service planning, coordination, and
            production across weddings, private celebrations, corporate events,
            and large-scale experiences all executed with structure, creativity,
            and precision.
          </p>
          <div className="w-24 h-[1px] bg-brand-pink mx-auto" />
        </ScrollReveal>
      </section>

      {/* 1. WEDDINGS */}
      <section className="py-24 bg-brand-light">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <ScrollReveal direction="right" className="w-full lg:w-1/2">
              <div className="relative aspect-[4/5] w-full">
                <img
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
                  alt="Luxury Wedding Planning"
                  className="w-full h-full object-cover rounded-sm shadow-xl" />
                
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" className="w-full lg:w-1/2">
              <h2 className="text-xs tracking-[0.2em] uppercase text-brand-gray mb-4">
                Weddings
              </h2>
              <h3 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">
                Luxury Wedding Planning & Production
              </h3>
              <p className="text-brand-gray font-light leading-relaxed mb-10">
                From intimate ceremonies to full wedding weekends, every detail
                is thoughtfully curated to reflect your vision with elegance and
                intention.
              </p>

              <div className="space-y-4 mb-10">
                <p className="text-sm uppercase tracking-[0.16em] text-brand-pink">
                  Planning Options (Preview Only)
                </p>
                <ul className="space-y-3 text-brand-gray font-light">
                  <li>Month-of Coordination</li>
                  <li>Partial Planning</li>
                  <li>Full Planning & Design</li>
                  <li>Dreamscape Exclusive</li>
                  <li>Destination Weddings (including international experiences such as Dallas, USA)</li>
                </ul>
              </div>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I\'m interested in learning more about your wedding planning services.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border border-brand-purple px-6 py-3 text-sm uppercase tracking-[0.14em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-white">
                See Details
              </a>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. PRIVATE & SOCIAL EVENTS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
            <ScrollReveal direction="left" className="w-full lg:w-1/2">
              <div className="relative aspect-[4/5] w-full">
                <img
                  src="https://images.unsplash.com/photo-1530103862676-de8892b07439?q=80&w=2070&auto=format&fit=crop"
                  alt="Private and Social Events"
                  className="w-full h-full object-cover rounded-sm shadow-xl" />

              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="w-full lg:w-1/2">
              <h2 className="text-xs tracking-[0.2em] uppercase text-brand-gray mb-4">
                Private & Social Events
              </h2>
              <h3 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">
                Elevated Personal Celebrations
              </h3>
              <p className="text-brand-gray font-light leading-relaxed mb-10">
                From milestone birthdays to bridal showers and intimate dinners,
                we curate experiences that feel refined, seamless, and
                unforgettable.
              </p>

              <div className="bg-brand-light p-8 rounded-sm mb-8">
                <h4 className="font-serif text-xl text-brand-dark mb-4">
                  All events include full-service planning:
                </h4>
                <ul className="space-y-3 text-brand-gray font-light">
                  {[
                  'Concept & mood board',
                  'Vendor sourcing & coordination',
                  'Styling guidance',
                  'Timeline & logistics',
                  'Full day-of execution'].
                  map((item, i) =>
                  <li key={i}>{item}</li>
                  )}
                </ul>
              </div>

              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I\'m interested in learning more about your private and social event services.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border border-brand-purple px-6 py-3 text-sm uppercase tracking-[0.14em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-white">
                See Details
              </a>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. CORPORATE & BRAND EVENTS */}
      <section className="py-24 bg-brand-purple text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <ScrollReveal direction="right" className="w-full lg:w-1/2">
              <div className="relative aspect-[4/5] w-full">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop"
                  alt="Corporate and Brand Events"
                  className="w-full h-full object-cover rounded-sm shadow-xl" />
                
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" className="w-full lg:w-1/2">
              <h2 className="text-xs tracking-[0.2em] uppercase text-white/50 mb-4">
                Corporate, Brand & Industry Events
              </h2>
              <h3 className="text-3xl md:text-4xl font-serif mb-6">
                Strategy Meets Sophistication
              </h3>
              <p className="text-white/80 font-light leading-relaxed mb-10">
                We partner with brands, entrepreneurs, and organizations to
                create experiences that communicate vision, elevate presence,
                and engage audiences.
              </p>

              <ul className="space-y-3 text-white/80 font-light mb-10">
                <li>Brand activations & launches</li>
                <li>Corporate events & retreats</li>
                <li>Expos, showcases & industry events</li>
              </ul>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I\'m interested in learning more about your corporate and brand event services.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border border-white px-6 py-3 text-sm uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-brand-purple">
                See Details
              </a>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. SPECIAL & PUBLIC EVENTS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
            <ScrollReveal direction="left" className="w-full lg:w-1/2">
              <div className="relative aspect-[4/5] w-full">
                <img
                  src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop"
                  alt="Special and Public Events"
                  className="w-full h-full object-cover rounded-sm shadow-xl" />

              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="w-full lg:w-1/2">
              <h2 className="text-xs tracking-[0.2em] uppercase text-brand-gray mb-4">
                Special & Public Events
              </h2>
              <h3 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">
                Large-Scale, Seamlessly Executed
              </h3>
              <p className="text-brand-gray font-light leading-relaxed mb-10">
                From cultural celebrations to charity galas and public
                showcases, Dreamscape delivers structured planning and smooth
                execution at scale.
              </p>

              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I\'m interested in learning more about your special and public event services.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border border-brand-purple px-6 py-3 text-sm uppercase tracking-[0.14em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-white">
                See Details
              </a>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. DESTINATION EXPERIENCES */}
      <section className="py-24 bg-brand-light">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <ScrollReveal direction="right" className="w-full lg:w-1/2">
              <div className="relative aspect-[4/5] w-full">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
                  alt="Destination Experiences"
                  className="w-full h-full object-cover rounded-sm shadow-xl" />
                
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" className="w-full lg:w-1/2">
              <h2 className="text-xs tracking-[0.2em] uppercase text-brand-gray mb-4">
                Destination & Luxury Experiences
              </h2>
              <h3 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">
                Luxury Without Borders
              </h3>
              <p className="text-brand-gray font-light leading-relaxed mb-10">
                From yachts to villas to international celebrations, we curate
                destination experiences that are immersive, seamless, and
                unforgettable.
              </p>

              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I\'m interested in learning more about your destination and luxury experience services.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border border-brand-purple px-6 py-3 text-sm uppercase tracking-[0.14em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-white">
                See Details
              </a>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-white text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <ScrollReveal direction="up">
            <h2 className="text-4xl md:text-5xl font-serif text-brand-dark mb-10">
              Not sure where to start? Let's create something unforgettable
              together.
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
