import { Suspense } from 'react';
import { ConsultationPage } from '@/src/components/pages/ConsultationPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConsultationPage />
    </Suspense>
  );
}
