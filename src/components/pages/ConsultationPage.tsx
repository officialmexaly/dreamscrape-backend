'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { Checkbox } from '../ui/checkbox';

const TIME_OPTIONS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] as const;
const BOOKED_DATE_KEYS = new Set(['2026-03-28', '2026-03-30', '2026-04-03', '2026-04-10']);
const BOOKED_TIME_OPTIONS = new Set(['10:00', '13:00', '16:00']);
const CONSULTATION_CONTENT = {
  'wedding-destination-social': {
    title: 'Wedding/Destination/Social Event Planning',
    subtitle: 'Dreamscape Curated Events',
    description:
      'A brief overview before you schedule your consultation. Choose a date and time that fits your calendar, then continue to the inquiry form with your selected appointment details.'
  },
  'event-design-styling': {
    title: 'Event Design & Styling',
    subtitle: 'Dreamscape Curated Events',
    description:
      'A consultation focused on visual storytelling, styling direction, tablescape decisions, ambiance, and the design details that shape how your event feels from first impression to final reveal.'
  },
  'pick-my-brain': {
    title: 'Pick My Brain Session (1-Hour Virtual Consultation)',
    subtitle: 'Dreamscape Curated Events',
    description:
      'For clients who need strategic event guidance, vendor advice, or professional clarity before moving forward. Ideal for a focused conversation around planning decisions and next steps.'
  },
  'real-time-assessment': {
    title: 'Real-Time Event Assessment',
    subtitle: 'Dreamscape Curated Events',
    description:
      'A consultation designed to review your current event progress, identify what is missing, and recommend the structure, support, and production touchpoints needed to move the experience forward with confidence.'
  }
} as const;
const SERVICE_EVENT_TYPE_MAP = {
  'wedding-destination-social': ['wedding-destination-social'],
  'event-design-styling': ['design-styling'],
  'pick-my-brain': ['pick-my-brain'],
  'real-time-assessment': ['assessment']
} as const;

const EVENT_TYPE_OPTIONS = [
  {
    id: 'wedding-destination-social',
    label: 'Wedding / Destination Planning'
  },
  {
    id: 'design-styling',
    label: 'Event Design & Styling'
  },
  {
    id: 'pick-my-brain',
    label: 'Pick My Brain Session (1-Hour Virtual Consultation)'
  },
  {
    id: 'assessment',
    label: 'Real-Time Event Assessment'
  }
] as const;

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatLongDate(date?: Date) {
  if (!date) return 'Choose a day on the calendar';

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function ConsultationPage() {
  const eventDatePickerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const selectedService = searchParams.get('service') as keyof typeof CONSULTATION_CONTENT | null;
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 2, 31));
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [activeTab, setActiveTab] = useState('availability');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isEventDatePickerOpen, setIsEventDatePickerOpen] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
    selectedService ? [...(SERVICE_EVENT_TYPE_MAP[selectedService] ?? [])] : []
  );

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventDate: undefined as Date | undefined,
    eventLocation: '',
    budget: '',
    guests: '',
    howDidYouHear: '',
    additionalDetails: ''
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const selectedDateStatus = date ? (BOOKED_DATE_KEYS.has(formatDateKey(date)) ? 'booked' : 'available') : undefined;
  const isBookedDay = selectedDateStatus === 'booked';
  const consultationIntro =
    (selectedService && CONSULTATION_CONTENT[selectedService]) ||
    CONSULTATION_CONTENT['wedding-destination-social'];
  const lockedEventTypes = selectedService
    ? new Set(SERVICE_EVENT_TYPE_MAP[selectedService] ?? [])
    : null;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        eventDatePickerRef.current &&
        !eventDatePickerRef.current.contains(event.target as Node)
      ) {
        setIsEventDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (selectedService && SERVICE_EVENT_TYPE_MAP[selectedService]) {
      setSelectedEventTypes([...SERVICE_EVENT_TYPE_MAP[selectedService]]);
    }
  }, [selectedService]);

  const toggleEventType = (value: string, checked: boolean | string) => {
    setSelectedEventTypes((current) => {
      if (checked) {
        return current.includes(value) ? current : [...current, value];
      }

      return current.filter((item) => item !== value);
    });
  };

  const isEventTypeDisabled = (value: string) => {
    if (!lockedEventTypes) return false;
    return !lockedEventTypes.has(value as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setSubmitStatus('error');
      setSubmitMessage('Please fill in all required fields.');
      return;
    }

    if (!date || !selectedTime) {
      setSubmitStatus('error');
      setSubmitMessage('Please select a consultation date and time.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          event_date: formData.eventDate ? formData.eventDate.toISOString().split('T')[0] : undefined,
          event_location: formData.eventLocation || undefined,
          event_types: selectedEventTypes,
          budget: formData.budget || undefined,
          guests: formData.guests || undefined,
          how_did_you_hear: formData.howDidYouHear || undefined,
          additional_details: formData.additionalDetails || undefined,
          consultation_date: date.toISOString().split('T')[0],
          consultation_time: selectedTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setSubmitStatus('success');
      setSubmitMessage('Your consultation has been booked successfully! You will receive a confirmation email shortly.');

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        eventDate: undefined,
        eventLocation: '',
        budget: '',
        guests: '',
        howDidYouHear: '',
        additionalDetails: ''
      });
      setUploadedFiles([]);

    } catch (error) {
      console.error('Booking error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-brand-light min-h-screen pt-40 md:pt-44 pb-24">
      <div className="container mx-auto px-6 max-w-5xl">
        <section className="mb-12">
          <Link
            href="/consultation-editorial"
            className="mb-8 inline-flex min-h-9 items-center gap-2 rounded-full border border-brand-purple/12 bg-white px-5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand-dark transition-colors hover:border-brand-pink hover:text-brand-pink">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>

          <h1 className="text-4xl md:text-5xl lg:text-6xl text-brand-dark font-normal leading-[0.96] mb-4">
            Consultation Booking
          </h1>
          <p className="text-xl md:text-2xl text-brand-purple mb-3">
            {consultationIntro.title}
          </p>
          <h2 className="text-lg md:text-xl text-brand-purple mb-6 tracking-wide">
            {consultationIntro.subtitle}
          </h2>
          <p className="max-w-2xl text-base md:text-lg text-brand-gray leading-relaxed mb-8">
            {consultationIntro.description}
          </p>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-4xl flex bg-transparent h-auto p-0 mb-12">
            <TabsTrigger
              value="availability"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:text-brand-dark data-[state=active]:shadow-none bg-transparent py-4 px-0 text-sm font-semibold tracking-[0.18em] uppercase">
              
              Availability
            </TabsTrigger>
            <TabsTrigger
              value="form"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:text-brand-dark data-[state=active]:shadow-none bg-transparent py-4 px-0 text-sm font-semibold tracking-[0.18em] uppercase">
              
              Form
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
              <div className="flex justify-center md:justify-end">
                <div className="w-full max-w-sm">
                  <Calendar
                    selected={date}
                    onSelect={setDate}
                    getDayStatus={(calendarDate) =>
                      BOOKED_DATE_KEYS.has(formatDateKey(calendarDate)) ? 'booked' : 'available'
                    }
                    className="w-full max-w-sm bg-transparent p-0"
                  />

                  <div className="mt-5 flex items-center gap-5 text-[0.68rem] uppercase tracking-[0.16em] text-brand-gray">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-pink" />
                      Available
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-gray" />
                      Booked
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-2xl text-brand-dark mb-1">
                  {date
                    ? date.toLocaleDateString('en-US', { weekday: 'long' })
                    : 'Select a Date'}
                </h3>
                <p className="text-brand-gray mb-6">{formatLongDate(date)}</p>

                <div className="mb-6 max-w-[320px] border-b border-brand-purple/10 pb-5">
                  <p className="text-xs tracking-[0.18em] uppercase text-brand-pink mb-3">
                    Selected Appointment
                  </p>
                  <p className="text-lg font-serif text-brand-dark">
                    {date ? `${formatLongDate(date)} at ${selectedTime}` : 'Select a date and time'}
                  </p>
                  {date &&
                    <p className={`mt-2 text-sm ${isBookedDay ? 'text-brand-gray' : 'text-brand-pink'}`}>
                      {isBookedDay ? 'This day is fully booked.' : 'This day is available for consultation.'}
                    </p>
                  }
                </div>

                <div className="max-w-[420px] mb-4">
                  <p className="text-xs tracking-[0.18em] uppercase text-brand-pink mb-3">
                    Available Times
                  </p>
                  <p className="text-sm text-brand-gray">
                    Monday to Friday, 8:00 AM to 5:00 PM
                  </p>
                </div>

                <div className="grid max-w-[420px] grid-cols-2 gap-3 sm:grid-cols-4">
                  {TIME_OPTIONS.map((time) => {
                    const isSelected = selectedTime === time;
                    const isBookedTime = BOOKED_TIME_OPTIONS.has(time);
                    const isDisabled = isBookedDay || isBookedTime;

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedTime(time)}
                        className={`h-11 rounded-lg border text-sm transition-colors ${
                          isDisabled
                            ? 'border-brand-gray/10 bg-brand-gray/5 text-brand-gray/45 cursor-not-allowed'
                            : isSelected
                            ? 'border-brand-purple bg-brand-purple text-white'
                            : 'border-brand-purple/10 bg-[#f6f4f2] text-brand-dark hover:border-brand-pink hover:text-brand-pink'
                        }`}>
                        {time}
                      </button>
                    );
                  })}
                </div>

                <Button
                  className="mt-8 w-full max-w-[320px] bg-brand-purple hover:bg-brand-pink text-white h-12 rounded-full font-medium tracking-[0.14em] uppercase"
                  disabled={!date || isBookedDay}
                  onClick={() => setActiveTab('form')}>
                  Submit and Next
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="form" className="mt-0">
            <div className="border-b border-brand-pink/15 pb-4 mb-8 text-sm text-brand-gray">
              {date && selectedTime && !isBookedDay
                ? `Your consultation is set for ${formatLongDate(date)} at ${selectedTime}.`
                : 'Select an available day and time for your appointment to complete this form.'}
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {submitStatus !== 'idle' && (
                <div className={`p-4 rounded-lg ${
                  submitStatus === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {submitMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label className="text-brand-gray font-normal text-sm">
                    First Name:<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Please provide your first name"
                    className="border-brand-purple/15 bg-white rounded-full h-11"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-gray font-normal text-sm">
                    Last Name:<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Please provide your last name"
                    className="border-brand-purple/15 bg-white rounded-full h-11"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-brand-gray font-normal text-sm">
                    Phone Number:<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Your phone number"
                    className="border-brand-purple/15 bg-white rounded-full h-11"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-gray font-normal text-sm">
                    Email Address:<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="Your email address"
                    className="border-brand-purple/15 bg-white rounded-full h-11"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-brand-gray font-normal text-sm">
                    Event Date:<span className="text-red-500">*</span>
                  </Label>
                  <div ref={eventDatePickerRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsEventDatePickerOpen((open) => !open)}
                      className="flex h-11 w-full items-center rounded-full border border-brand-purple/15 bg-white px-4 text-left text-sm text-brand-dark transition-colors hover:border-brand-pink"
                      disabled={isSubmitting}
                    >
                      {formData.eventDate ? formatLongDate(formData.eventDate) : 'Select date'}
                    </button>

                    {isEventDatePickerOpen && (
                      <div className="absolute left-0 top-full z-30 mt-2 rounded-[1.25rem] border border-brand-purple/12 bg-white p-3 shadow-[0_22px_60px_rgba(33,27,37,0.12)]">
                        <Calendar
                          selected={formData.eventDate}
                          onSelect={(selectedDate) => {
                            setFormData({...formData, eventDate: selectedDate});
                            setIsEventDatePickerOpen(false);
                          }}
                          getDayStatus={(calendarDate) =>
                            BOOKED_DATE_KEYS.has(formatDateKey(calendarDate)) ? 'booked' : 'available'
                          }
                          className="w-full bg-transparent p-0"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-gray font-normal text-sm">
                    Event Location (If Known)
                  </Label>
                  <Input className="border-brand-purple/15 bg-white rounded-full h-11" />
                </div>

                <div className="space-y-2">
                  <Label className="text-brand-gray font-normal text-sm">
                    Budget Range<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="$50,000"
                    className="border-brand-purple/15 bg-white rounded-full h-11"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-gray font-normal text-sm">
                    Estimated Number of Guests:
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="100"
                    className="border-brand-purple/15 bg-white rounded-full h-11"
                    value={formData.guests}
                    onChange={(e) => setFormData({...formData, guests: e.target.value})}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-brand-gray font-normal text-sm">
                  Event Type: <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-wrap gap-6">
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedEventTypes.includes(option.id)}
                        onCheckedChange={(checked) => toggleEventType(option.id, checked)}
                        disabled={isEventTypeDisabled(option.id)}
                        className="border-brand-purple/20 rounded-sm" />

                      <Label
                        htmlFor={option.id}
                        className={`font-normal text-sm ${isEventTypeDisabled(option.id) ? 'cursor-not-allowed text-brand-gray/45' : 'cursor-pointer text-brand-gray'}`}>

                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-brand-gray font-normal text-sm">
                  How did you hear about us?
                </Label>
                <Input
                  placeholder="Instagram, referral, etc."
                  className="border-brand-purple/15 bg-white rounded-full h-11"
                  value={formData.howDidYouHear}
                  onChange={(e) => setFormData({...formData, howDidYouHear: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-brand-gray font-normal text-sm">
                  Additional Details (Optional)
                </Label>
                <Textarea
                  placeholder="Tell us more about your event..."
                  className="border-brand-purple/15 bg-white rounded-[1.5rem] min-h-[120px] resize-none"
                  value={formData.additionalDetails}
                  onChange={(e) => setFormData({...formData, additionalDetails: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col items-center justify-center pt-4 pb-8">
                <input
                  id="consultation-file-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) =>
                    setUploadedFiles(
                      Array.from(e.target.files ?? []).map((file) => file.name)
                    )
                  }
                />
                <Label htmlFor="consultation-file-upload" className="cursor-pointer">
                  <span className="inline-flex items-center justify-center border border-brand-purple/15 text-brand-gray font-normal rounded-full px-6 h-11 mb-2 bg-brand-light transition-colors hover:border-brand-pink hover:text-brand-pink">
                    Choose file(s) to upload
                  </span>
                </Label>
                <p className="text-brand-gray/70 text-sm">
                  or drag files here to upload
                </p>
                {uploadedFiles.length > 0 &&
                  <div className="mt-4 space-y-1 text-center text-sm text-brand-gray">
                    {uploadedFiles.map((fileName) => (
                      <p key={fileName}>{fileName}</p>
                    ))}
                  </div>
                }
              </div>

              <div className="flex justify-end pt-4 border-t border-brand-purple/10">
                <Button
                  type="submit"
                  className="bg-brand-purple hover:bg-brand-pink text-white rounded-full px-8 h-11 font-medium tracking-[0.14em] uppercase"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit and Finish'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>);

}
