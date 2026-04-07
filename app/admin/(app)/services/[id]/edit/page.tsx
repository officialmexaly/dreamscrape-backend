'use client';

import { ServicesEditorPage } from '@/src/admin/pages/ServicesEditorPage';

export default function EditServicePage({ params }: { params: { id: string } }) {
  return <ServicesEditorPage id={params.id} />;
}
