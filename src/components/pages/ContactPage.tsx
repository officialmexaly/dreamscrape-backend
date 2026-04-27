'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ScrollReveal } from '../ScrollReveal';
import CalendlyEmbed from '../CalendlyEmbed';

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '';

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

const PROCESS_STEPS = [
  'Send your event details and preferred date.',
  'We review the scope and follow up within 24 to 48 hours.',
  'We book a consultation and shape the experience from there.'
];

const RESPONSE_NOTES = [
  { label: 'Coverage', value: 'GTA, Canada & worldwide' },
  { label: 'Reply window', value: '24 to 48 hours' },
  { label: 'Best for', value: 'Weddings, private events, brand activations' }
];

type ContactCard = { label: string; value: string; href: string };

interface ContactPageProps {
  initialCards?: ContactCard[];
}

export function ContactPage({ initialCards }: ContactPageProps) {
  const [contactCards] = useState<ContactCard[]>(
    initialCards?.length ? initialCards : [...DEFAULT_CONTACT_CARDS]
  );

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);

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
    <div className="relative w-full overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(196,100,147,0.12),transparent_30%),radial-gradient(circle_at_left_top,rgba(64,21,63,0.06),transparent_26%),linear-gradient(180deg,#fcfaf7_0%,#f7f1ec_100%)] pt-36 pb-24 md:pt-44">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-brand-pink/10 blur-3xl" />
        <div className="absolute right-[-7rem] top-[30rem] h-80 w-80 rounded-full bg-brand-purple/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal direction="up" className="mb-14">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="mb-4 text-[0.72rem] uppercase tracking-[0.34em] text-brand-pink">
                Contact
              </p>
              <h1 className="max-w-3xl text-4xl font-serif leading-[0.96] text-brand-dark sm:text-5xl md:text-6xl lg:text-7xl">
                Sleek, responsive planning starts with one conversation.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-brand-gray sm:text-lg">
                Dreamscape Curated Events creates weddings, private celebrations, and
                branded experiences with a calm process and a polished finish.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_70px_rgba(64,21,63,0.08)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[0.7rem] uppercase tracking-[0.28em] text-brand-pink">
                  Direct access
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="space-y-3">
                {RESPONSE_NOTES.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-brand-purple/8 bg-brand-light/70 px-4 py-3"
                  >
                    <p className="text-[0.7rem] uppercase tracking-[0.22em] text-brand-pink">
                      {item.label}
                    </p>
                    <p className="max-w-[16rem] text-right text-sm leading-6 text-brand-dark">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={80} className="mb-16">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {contactCards.map((card) => (
              <a
                key={card.label}
                href={card.href}
                className="group rounded-[1.5rem] border border-white/70 bg-white/75 p-5 shadow-[0_16px_50px_rgba(64,21,63,0.05)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-pink/30 hover:shadow-[0_20px_60px_rgba(64,21,63,0.12)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-brand-pink">
                    {card.label}
                  </p>
                  <span className="rounded-full border border-brand-pink/15 px-2.5 py-1 text-[0.64rem] uppercase tracking-[0.18em] text-brand-pink transition-colors group-hover:bg-brand-pink group-hover:text-white">
                    Open
                  </span>
                </div>
                <p className="text-sm leading-6 text-brand-dark sm:text-[0.96rem]">
                  {card.value}
                </p>
              </a>
            ))}
          </section>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={120} className="mb-20">
          <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-8">
              <div className="rounded-[1.75rem] border border-white/70 bg-brand-dark px-6 py-7 text-white shadow-[0_20px_60px_rgba(64,21,63,0.16)]">
                <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/55">
                  What happens next
                </p>
                <div className="mt-6 space-y-4">
                  {PROCESS_STEPS.map((step, index) => (
                    <div
                      key={step}
                      className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-sm font-medium text-white/85">
                        0{index + 1}
                      </div>
                      <p className="text-sm leading-7 text-white/82">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-brand-purple/10 bg-white/80 p-6 shadow-[0_20px_60px_rgba(64,21,63,0.05)] backdrop-blur-md">
                <p className="text-[0.7rem] uppercase tracking-[0.28em] text-brand-pink">
                  Ideal for
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-tight text-brand-dark">
                  Weddings, private parties, corporate launches, and editorial-style
                  moments.
                </h2>
                <p className="mt-4 text-sm leading-7 text-brand-gray">
                  If you already know your date, venue, or guest count, include those
                  details in the form. If not, we can help shape the scope after the
                  first inquiry.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Event design', 'Production', 'Coordination', 'Creative direction'].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-brand-purple/10 bg-brand-light px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-brand-dark"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_24px_80px_rgba(64,21,63,0.10)] backdrop-blur-xl sm:p-7 lg:p-8">
              <div className="mb-8">
                <p className="mb-3 text-[0.7rem] uppercase tracking-[0.28em] text-brand-pink">
                  Inquiry Form
                </p>
                <h2 className="max-w-2xl font-serif text-3xl leading-tight text-brand-dark sm:text-4xl">
                  Tell us what you are planning.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-gray sm:text-base">
                  Share the essentials and we will respond with a tailored next step.
                </p>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-brand-pink/15 bg-brand-light/70 px-6 py-14 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink/10">
                    <svg
                      className="h-8 w-8 text-brand-pink"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-brand-dark">Inquiry received</h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-brand-gray">
                    We will get back to you within 24 to 48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-brand-dark">
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
                        className="h-12 rounded-xl border-brand-purple/12 bg-white/80 px-4 text-sm shadow-sm placeholder:text-brand-gray/45 focus-visible:border-brand-pink/35 focus-visible:ring-brand-pink/15"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-brand-dark">
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
                        className="h-12 rounded-xl border-brand-purple/12 bg-white/80 px-4 text-sm shadow-sm placeholder:text-brand-gray/45 focus-visible:border-brand-pink/35 focus-visible:ring-brand-pink/15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-brand-dark">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className="h-12 rounded-xl border-brand-purple/12 bg-white/80 px-4 text-sm shadow-sm placeholder:text-brand-gray/45 focus-visible:border-brand-pink/35 focus-visible:ring-brand-pink/15"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="eventType" className="text-sm font-medium text-brand-dark">
                        Event Type *
                      </label>
                      <select
                        id="eventType"
                        name="eventType"
                        required
                        value={formData.eventType}
                        onChange={handleInputChange}
                        className="h-12 w-full rounded-xl border border-brand-purple/12 bg-white/80 px-4 text-sm text-brand-dark shadow-sm outline-none transition focus:border-brand-pink/35 focus:ring-4 focus:ring-brand-pink/10"
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

                  <div className="space-y-2">
                    <label htmlFor="eventDate" className="text-sm font-medium text-brand-dark">
                      Preferred Event Date
                    </label>
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="h-12 rounded-xl border-brand-purple/12 bg-white/80 px-4 text-sm shadow-sm focus-visible:border-brand-pink/35 focus-visible:ring-brand-pink/15"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-brand-dark">
                      Tell Us About Your Event *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Share your vision, guest count, style preferences, venue details, and any special requirements..."
                      rows={7}
                      className="min-h-40 rounded-2xl border-brand-purple/12 bg-white/80 px-4 py-3 text-sm shadow-sm placeholder:text-brand-gray/45 focus-visible:border-brand-pink/35 focus-visible:ring-brand-pink/15"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-6 text-brand-gray">
                      Prefer a direct conversation? You can book a consultation below
                      instead.
                    </p>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 rounded-full bg-brand-dark px-8 text-xs uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_rgba(64,21,63,0.22)] transition-colors hover:bg-brand-pink disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={160} className="mb-16">
          <section className="rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_20px_60px_rgba(64,21,63,0.06)] backdrop-blur-xl md:p-8">
            <div className="mb-8 max-w-2xl">
              <p className="mb-3 text-[0.7rem] uppercase tracking-[0.28em] text-brand-pink">
                Quick Booking
              </p>
              <h2 className="font-serif text-3xl leading-tight text-brand-dark sm:text-4xl">
                Prefer to book a call directly?
              </h2>
              <p className="mt-4 text-sm leading-7 text-brand-gray sm:text-base">
                Schedule a 30-minute consultation when it is easier for you to talk
                through the details live.
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-brand-purple/8 bg-white">
              <CalendlyEmbed url={CALENDLY_URL} />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-brand-purple/15 bg-white/80 px-6 text-xs uppercase tracking-[0.14em] text-brand-purple hover:border-brand-pink/30 hover:bg-brand-pink/5"
              >
                <Link href="/consultation-editorial">
                  Browse consultation types instead
                </Link>
              </Button>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <section className="rounded-[2rem] border border-brand-purple/10 bg-brand-dark px-6 py-10 text-white shadow-[0_24px_80px_rgba(64,21,63,0.18)] md:px-8 md:py-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/55">
                  Stay connected
                </p>
                <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
                  Want planning notes, launch updates, and occasional offers?
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                  Join the newsletter for occasional updates from the Dreamscape team.
                </p>
              </div>

              <form
                className="flex w-full max-w-xl flex-col gap-3 sm:flex-row lg:w-[32rem]"
                onSubmit={(e) => e.preventDefault()}
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="h-12 rounded-full border-white/10 bg-white/10 px-5 text-white placeholder:text-white/45 focus-visible:border-brand-pink/40 focus-visible:ring-brand-pink/15"
                />
                <Button
                  type="submit"
                  className="h-12 rounded-full bg-white px-6 text-xs uppercase tracking-[0.16em] text-brand-dark hover:bg-brand-pink hover:text-white"
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

export default ContactPage;
