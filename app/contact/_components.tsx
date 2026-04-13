'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { ScrollReveal } from '@/src/components/ScrollReveal';

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

interface ContactPageProps {
  initialCards?: ContactCard[];
}

export function ContactPage({ initialCards }: ContactPageProps) {
  const [contactCards] = useState<ContactCard[]>(
    initialCards?.length ? initialCards : [...DEFAULT_CONTACT_CARDS]
  );

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventType: '',
        eventDate: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="w-full bg-brand-light min-h-screen pt-40 md:pt-44 pb-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
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

        {/* Contact Details */}
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
                  className="border-t border-brand-purple/10 px-0 py-5 transition-colors hover:border-brand-pink/30 md:pr-6"
                >
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

        {/* Inquiry Form */}
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
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif text-brand-dark mb-4">
                    Thank You!
                  </h3>
                  <p className="text-brand-gray">
                    We've received your inquiry and will respond within 24-48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-brand-dark mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Jane Doe"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="jane@example.com"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Phone and Event Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-brand-dark mb-2">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="eventType" className="block text-sm font-medium text-brand-dark mb-2">
                        Event Type *
                      </label>
                      <select
                        id="eventType"
                        name="eventType"
                        required
                        value={formData.eventType}
                        onChange={handleInputChange}
                        className="w-full h-10 rounded-md border border-brand-purple/12 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-brand-gray/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/20"
                      >
                        <option value="">Select event type</option>
                        <option value="wedding">Wedding</option>
                        <option value="corporate">Corporate Event</option>
                        <option value="private">Private Celebration</option>
                        <option value="brand">Brand Experience</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Event Date */}
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-brand-dark mb-2">
                      Preferred Event Date
                    </label>
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-brand-dark mb-2">
                      Tell Us About Your Event *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Share your vision, guest count, style preferences, and any special requirements..."
                      rows={6}
                      className="w-full"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto rounded-full px-12 py-4 bg-brand-purple text-white hover:bg-brand-pink disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* Calendly Booking Section */}
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
                className="rounded-full px-8 py-4 bg-white text-brand-purple hover:bg-brand-light"
              >
                <a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book via Calendly
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-8 py-4 border-white text-white hover:bg-white/10"
              >
                <Link href="/consultation-editorial">
                  Consultation Form
                </Link>
              </Button>
            </div>
          </section>
        </ScrollReveal>

        {/* Newsletter Section */}
        <ScrollReveal direction="up">
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
              <form
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 h-12 rounded-full border-brand-purple/12 bg-white px-5"
                />
                <Button
                  type="submit"
                  className="h-12 rounded-full bg-brand-purple px-8 text-sm uppercase tracking-[0.14em] text-white hover:bg-brand-pink whitespace-nowrap"
                >
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
