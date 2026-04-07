import { notFound } from 'next/navigation';
import { PortfolioStoryPage } from '@/src/components/pages/PortfolioStoryPage';
import { BLOG_POSTS } from '@/src/lib/blog-posts';
import { mapPortfolioItemToPublicPost } from '@/src/lib/public-posts';
import { getPublishedPortfolioItemCached } from '@/src/lib/cached-posts';

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const key = (slug || '').trim().replace(/\s+/g, '');

  const fallback = BLOG_POSTS.find((p) => p.id === key);

  try {
    const data = await getPublishedPortfolioItemCached(key);
    if (data) {
      return <PortfolioStoryPage slug={key} post={mapPortfolioItemToPublicPost(data)} />;
    }
  } catch {
    // fall through to fallback/notFound
  }

  if (fallback) {
    return <PortfolioStoryPage slug={key} post={fallback} />;
  }

  notFound();
}
