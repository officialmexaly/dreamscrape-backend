'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollReveal } from '../ScrollReveal';
export function AboutPage() {
  return (
    <div className="w-full pt-32 pb-24 bg-brand-light">
      {/* FOUNDER SECTION (Asymmetric) */}
      <section className="container mx-auto px-6 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <ScrollReveal direction="right" className="w-full lg:w-5/12">
            <div className="relative aspect-[3/4] w-full">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
                alt="Oseremen Emmanuella Ohiku - Founder"
                className="w-full h-full object-cover rounded-sm shadow-xl" />
              
              <div className="absolute -bottom-8 -left-8 w-full h-full border border-brand-purple/20 -z-10" />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" className="w-full lg:w-7/12 lg:pl-12">
            <h2 className="text-xs tracking-[0.2em] uppercase text-brand-gray mb-4">
              Meet The Executive Planner
            </h2>
            <h1 className="text-4xl md:text-5xl font-serif text-brand-dark mb-2">
              Oseremen Ohiku
            </h1>
            <p className="text-sm tracking-widest uppercase text-brand-pink mb-10">
              Founder & Executive Planner
            </p>

            <div className="space-y-6 text-brand-gray font-light leading-relaxed">
              <p>
                Oseremen Ohiku is the Founder and Executive Planner of
                Dreamscape Curated Events Inc. Known for her structured planning
                approach and refined aesthetic direction, she specializes in
                curating elevated celebrations that are both beautifully
                designed and seamlessly executed.
              </p>
              <p>
                With a strong foundation in organization, leadership, and
                precision, Oseremen brings clarity and calm to every event she
                manages. She believes meaningful celebrations deserve thoughtful
                coordination and intentional design.
              </p>
              <p className="text-xl font-serif text-brand-purple italic pt-4">
                Her philosophy is simple: every event should feel effortless
                for the client and unforgettable for the guests.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="py-24 bg-white mt-12">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-4xl font-serif text-brand-dark mb-10">
              Our Story
            </h2>
            <div className="space-y-6 text-brand-gray font-light leading-relaxed text-left md:text-center">
              <p>
                Dreamscape was born from a desire to create experiences that
                feel meaningful, organized, and unforgettable. What began as
                planning celebrations for friends and family quickly revealed
                itself as something deeper, a calling rooted in creativity,
                faith, and a passion for beautifully executed events.
              </p>
              <p>
                Today, Dreamscape stands on a foundation of structure,
                intentional design, and excellence, delivering elevated
                experiences that leave lasting impressions.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>);

}
