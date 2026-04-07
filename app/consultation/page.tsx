import { Suspense } from 'react';
import { ConsultationPage } from '@/src/components/pages/ConsultationPage';
import { getSiteContentPageCached } from '@/src/lib/cached-site-content';

export default async function Page() {
  let initialTimeOptions: string[] | undefined;
  let initialEventTypeOptions: Array<{ id: string; label: string }> | undefined;
  let initialConsultationContent: any | undefined;
  let initialDateRange: { start_date: string; end_date: string } | undefined;

  try {
    const { grouped } = await getSiteContentPageCached('consultation');
    const timeData = grouped?.consultation_time_options || {};
    const times = timeData.options?.value || [];
    if (Array.isArray(times) && times.length) initialTimeOptions = times;

    const eventData = grouped?.consultation_event_types || {};
    const events = eventData.options?.value || [];
    if (Array.isArray(events) && events.length) initialEventTypeOptions = events;

    const typesData = grouped?.consultation_consultation_types || {};
    const types = typesData.types?.value || {};
    if (types && typeof types === 'object' && Object.keys(types).length > 0) {
      const transformedContent = Object.entries(types).reduce((acc, [key, value]) => {
        const stringValue = typeof value === 'string' ? value : String(value);
        acc[key] = {
          title: stringValue,
          subtitle: 'Dreamscape Curated Events',
          description: stringValue
        };
        return acc;
      }, {} as Record<string, { title: string; subtitle: string; description: string }>);
      initialConsultationContent = transformedContent;
    }

    const dateData = grouped?.consultation_date_range || {};
    const range = dateData.config?.value || {};
    if (range?.start_date && range?.end_date) initialDateRange = range;
  } catch {
    // ConsultationPage will fall back client-side
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConsultationPage
        initialTimeOptions={initialTimeOptions}
        initialEventTypeOptions={initialEventTypeOptions}
        initialConsultationContent={initialConsultationContent}
        initialDateRange={initialDateRange}
      />
    </Suspense>
  );
}
