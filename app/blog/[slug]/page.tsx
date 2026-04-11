import { notFound } from 'next/navigation';
import BlogStoryPage from '@/src/components/pages/BlogStoryPage';
import { mapBlogRowToPublicPost } from '@/src/lib/public-posts';
import { getPublishedBlogPostCached } from '@/src/lib/cached-posts';

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const key = (slug || '').trim().replace(/\s+/g, '');

  try {
    const data = await getPublishedBlogPostCached(key);
    if (data) {
      return <BlogStoryPage slug={key} post={mapBlogRowToPublicPost(data)} />;
    }
  } catch {
    // fall through to fallback/notFound
  }

  notFound();
}
