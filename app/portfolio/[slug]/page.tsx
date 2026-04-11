import { notFound } from 'next/navigation';
import PortfolioStoryPage from '@/src/components/pages/PortfolioStoryPage';
import { mapPortfolioItemToPublicPost } from '@/src/lib/public-posts';
import { getPublishedPortfolioItemCached } from '@/src/lib/cached-posts';

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const key = (slug || '').trim().replace(/\s+/g, '');

  try {
    const data = await getPublishedPortfolioItemCached(key);
    if (data) {
      return <PortfolioStoryPage slug={key} post={mapPortfolioItemToPublicPost(data)} />;
    }
  } catch {
    // fall through to fallback/notFound
  }

  notFound();
}
