import HomePage from '@/src/components/pages/HomePage';
import { getSiteContentPageCached } from '@/src/lib/cached-site-content';

export default async function Page() {
  let grouped: Record<string, any> | undefined;
  try {
    const res = await getSiteContentPageCached('home');
    grouped = res.grouped;
  } catch {
    // HomePage will fall back client-side
  }

  return <HomePage initialGrouped={grouped} />;
}
