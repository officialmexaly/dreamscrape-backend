'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ScrollReveal } from '../ScrollReveal';

export function HomePage() {
  // Custom simple crossfade hero carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
  'https://images.unsplash.com/photo-1769812343775-85a27e6a076c?auto=format&fit=crop&fm=jpg&q=80&w=2200',
  'https://images.unsplash.com/photo-1773005695300-14b62bc85ba0?auto=format&fit=crop&fm=jpg&q=80&w=2200',
  'https://images.unsplash.com/photo-1744389481598-9779b474f557?auto=format&fit=crop&fm=jpg&q=80&w=2200'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);
  return (
    <div className="w-full overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden">
        {slides.map((slide, index) =>
        <div
          key={index}
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: currentSlide === index ? 1 : 0
          }}>
          
            <div className="absolute inset-0 bg-black/40 z-10" />{' '}
            {/* Overlay */}
            <img
            src={slide}
            alt={
              index === 0
                ? 'Elegant wedding reception'
                : index === 1
                  ? 'Candlelit luxury reception setup'
                  : 'Elegant couple portrait'
            }
            className="w-full h-full object-cover" />
          
          </div>
        )}

        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto mt-24 md:mt-20">
          <ScrollReveal direction="up" delay={200}>
            <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-[0.95]">
              More Than Events.
              <br />
              We Curate Experiences.
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={400}>
            <p className="text-white/90 text-base md:text-base lg:text-lg font-light mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              Luxury weddings, private celebrations, and elevated brand
              experiences thoughtfully designed, seamlessly coordinated, and
              beautifully executed.
            </p>
          </ScrollReveal>

          <ScrollReveal
            direction="up"
            delay={600}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">

            <Link href="/consultation-editorial" className="w-full sm:w-auto">
              <Button
                className="min-h-12 rounded-full px-6 sm:px-8 text-sm tracking-[0.14em] uppercase bg-brand-purple hover:bg-brand-pink text-white w-full sm:w-auto transition-colors">

                Book a Consultation
              </Button>
            </Link>
            <Link href="/portfolio" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="min-h-12 rounded-full px-6 sm:px-8 text-sm tracking-[0.14em] uppercase border-white text-white hover:bg-white hover:text-brand-dark w-full sm:w-auto transition-colors bg-transparent">

                View Blog
              </Button>
            </Link>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={800}>
            <p className="text-white/70 text-xs tracking-[0.16em] uppercase mt-10 md:mt-12">
              Now booking 2026 & 2027 events
            </p>
          </ScrollReveal>
        </div>

        {/* Dot Navigation */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
          {slides.map((_, index) =>
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-6' : 'bg-white/50'}`}
            aria-label={`Go to slide ${index + 1}`} />

          )}
        </div>
      </section>

      {/* BRAND INTRO */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <ScrollReveal direction="right" className="w-full lg:w-1/2">
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0">
                <img
                  src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1974&auto=format&fit=crop"
                  alt="Elegant table setting"
                  className="w-full h-full object-cover rounded-sm" />
                
                <div className="absolute -bottom-6 -right-6 w-2/3 aspect-square bg-brand-light -z-10" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" className="w-full lg:w-1/2">
              <h2 className="text-sm tracking-[0.16em] uppercase text-brand-gray mb-4">
                Welcome to Dreamscape
              </h2>
              <h3 className="text-3xl md:text-4xl font-serif text-brand-dark mb-8 leading-tight">
                Intentional design meets structured coordination.
              </h3>
              <p className="text-brand-gray font-light leading-relaxed mb-6">
                Dreamscape Curated Events is a Toronto-based planning and
                production company specializing in weddings, milestone
                celebrations, corporate events, and bespoke experiences.
              </p>
              <p className="text-brand-gray font-light leading-relaxed mb-8">
                We blend intentional design with structured coordination
                systems to deliver seamless, elevated events from concept to
                execution.
              </p>
              <div className="pt-6 border-t border-brand-gray/20">
                <p className="text-sm tracking-widest uppercase text-brand-purple font-medium">
                  Toronto-based | Available Worldwide
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* STATISTICS BANNER */}
      <section className="py-14 md:py-16 bg-brand-purple text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <ScrollReveal delay={100}>
              <p className="text-4xl font-serif mb-2">30+</p>
              <p className="text-xs tracking-widest uppercase text-white/70">
                Events Completed
              </p>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="text-4xl font-serif mb-2">30+</p>
              <p className="text-xs tracking-widest uppercase text-white/70">
                Clients Served
              </p>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <p className="text-4xl font-serif mb-2">10+</p>
              <p className="text-xs tracking-widest uppercase text-white/70">
                Years Experience
              </p>
            </ScrollReveal>
            <ScrollReveal delay={400}>
              <p className="text-4xl font-serif mb-2">20+</p>
              <p className="text-xs tracking-widest uppercase text-white/70">
                Vendor Partners
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-20 lg:py-32 bg-brand-light">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollReveal
            direction="up"
            className="text-center max-w-2xl mx-auto mb-16">
            
            <h2 className="text-sm tracking-[0.16em] uppercase text-brand-gray mb-4">
              Our Expertise
            </h2>
            <h3 className="text-3xl md:text-4xl font-serif text-brand-dark">
              Curated Experiences
            </h3>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
            {
              title: 'Weddings',
              desc: 'Curated planning for timeless, detail-driven wedding experiences.'
            },
            {
              title: 'Private & Social Events',
              desc: 'Milestones and intimate celebrations designed with intention and elegance.'
            },
            {
              title: 'Corporate & Brand Events',
              desc: 'Strategic, polished experiences that elevate your brand presence.'
            },
            {
              title: 'Destination Experiences',
              desc: 'From international weddings to luxury travel-based celebrations.'
            }].
            map((service, index) =>
            <ScrollReveal key={index} delay={index * 100} direction="up">
                <div className="bg-white p-6 md:p-8 h-full flex flex-col justify-between group hover:shadow-xl transition-all duration-500 border border-transparent hover:border-brand-pink/20">
                  <div>
                    <h4 className="font-serif text-xl text-brand-dark mb-4 group-hover:text-brand-purple transition-colors">
                      {service.title}
                    </h4>
                    <p className="text-sm text-brand-gray font-light leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                  <div className="mt-8 w-8 h-[1px] bg-brand-purple group-hover:w-16 transition-all duration-300" />
                </div>
              </ScrollReveal>
            )}
          </div>

          <div className="text-center">
            <Link href="/services">
              <Button
                variant="outline"
                className="min-h-12 rounded-full px-6 sm:px-8 text-sm tracking-[0.14em] uppercase border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-colors">

                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <ScrollReveal direction="right" className="max-w-xl">
              <h2 className="text-sm tracking-[0.2em] uppercase text-brand-gray mb-4">
                Blog
              </h2>
              <h3 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">
                Featured Events
              </h3>
              <p className="text-brand-gray font-light leading-relaxed">
                A refined destination wedding experience blending culture,
                elegance, and intentional design. From planning to execution,
                every detail was curated to deliver a seamless and unforgettable
                celebration.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="left">
              <Link href="/portfolio">
                <Button
                  className="min-h-12 rounded-full px-6 sm:px-8 text-sm tracking-[0.14em] uppercase bg-brand-purple hover:bg-brand-pink text-white transition-colors">

                  View Experience
                </Button>
              </Link>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
            {
              title: "Nneoma's 25th Birthday",
              loc: 'Toronto',
              img: 'https://images.unsplash.com/photo-1530103862676-de8892b07439?q=80&w=2070&auto=format&fit=crop'
            },
            {
              title: "Dr. Chika's Graduation Celebration",
              loc: 'Toronto',
              img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop'
            },
            {
              title: "Troy's 1st Birthday",
              loc: 'Toronto',
              img: 'https://images.unsplash.com/photo-1513278974582-3e1b4a4fa21e?q=80&w=1974&auto=format&fit=crop'
            },
            {
              title: "Pearl & Donald's Wedding",
              loc: 'Dallas',
              img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop'
            }].
            map((event, index) =>
            <ScrollReveal key={index} delay={index * 100} direction="up">
                <Link href="/portfolio">
                  <div
                  className="group relative aspect-[4/3] overflow-hidden cursor-pointer">

                    <img
                    src={event.img}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute bottom-0 left-0 p-8">
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[0.65rem] tracking-widest uppercase mb-3">
                        {event.loc}
                      </span>
                      <h4 className="text-2xl font-serif text-white">
                        {event.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      {/* WHY DREAMSCAPE */}
      <section className="py-24 bg-brand-light">
        <div className="container mx-auto px-6">
          <ScrollReveal
            direction="up"
            className="text-center max-w-2xl mx-auto mb-16">
            
            <h2 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">
              Why Dreamscape
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
            'Intentional design from concept to execution',
            'Structured planning systems that eliminate stress',
            'Trusted and curated vendor network',
            'Seamless guest experience from start to finish'].
            map((point, index) =>
            <ScrollReveal key={index} delay={index * 100} direction="up">
                <div className="text-center px-4">
                  <div className="w-12 h-[1px] bg-brand-pink mx-auto mb-6" />
                  <p className="text-brand-dark font-serif text-lg leading-relaxed">
                    {point}
                  </p>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      {/* LOVE NOTES SNIPPET */}
      <section className="py-24 lg:py-32 bg-brand-dark text-white text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal direction="up">
            <h2 className="text-sm tracking-[0.2em] uppercase text-white/50 mb-16">
              Love Notes
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <ScrollReveal direction="right" delay={100}>
              <p className="font-serif text-xl md:text-2xl italic leading-relaxed mb-6 text-white/90">
                "Dreamscape truly made my dream birthday come true..."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-8 h-[1px] bg-brand-pink" />
                <p className="text-sm tracking-widest uppercase text-white/70">
                  Nneoma Achioso
                </p>
                <div className="w-8 h-[1px] bg-brand-pink" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={200}>
              <p className="font-serif text-xl md:text-2xl italic leading-relaxed mb-6 text-white/90">
                "My grad party turned out amazing..."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-8 h-[1px] bg-brand-pink" />
                <p className="text-sm tracking-widest uppercase text-white/70">
                  Dr. Chika Obetta
                </p>
                <div className="w-8 h-[1px] bg-brand-pink" />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="up" delay={300}>
            <Link
              href="/love-notes"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-pink px-6 text-sm tracking-[0.14em] uppercase text-brand-pink hover:bg-brand-pink hover:text-white transition-colors">
              Read More
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-white text-center">
        <div className="container mx-auto px-6">
          <ScrollReveal direction="up">
            <h2 className="text-4xl md:text-5xl font-serif text-brand-dark mb-10">
              Ready to bring your vision to life?
            </h2>
            <Link href="/consultation-editorial">
              <Button
                className="min-h-12 rounded-full px-8 sm:px-10 text-sm tracking-[0.14em] uppercase bg-brand-purple hover:bg-brand-pink text-white transition-colors">

                Book Your Consultation
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>);

}
