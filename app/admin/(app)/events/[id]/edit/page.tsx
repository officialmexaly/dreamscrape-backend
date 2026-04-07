'use client';

import { EventsEditorPage } from '@/src/admin/pages/EventsEditorPage';

export default function EditEventPage({ params }: { params: { id: string } }) {
  return <EventsEditorPage id={params.id} />;
}
