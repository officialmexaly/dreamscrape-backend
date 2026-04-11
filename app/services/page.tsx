import ServicesPage from '@/app/_client/ServicesPageClient';
import { getPublishedServicesCached } from '@/src/lib/cached-services';

export default async function Page() {
  const items = await getPublishedServicesCached();
  return <ServicesPage initialServices={items ?? []} />;
}
