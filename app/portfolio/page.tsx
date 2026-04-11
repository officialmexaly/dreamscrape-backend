import PortfolioPage from '@/src/components/pages/PortfolioPage';
import { getPublishedPortfolioItemsCached } from '@/src/lib/cached-posts';
import { mapPortfolioItemToPublicPost } from '@/src/lib/public-posts';
import type { BlogPost } from '@/src/lib/blog-posts';

export default async function Page() {
  let initialPosts: BlogPost[] | undefined;
  try {
    const rows = await getPublishedPortfolioItemsCached();
    const mapped = rows.map(mapPortfolioItemToPublicPost).filter((p: BlogPost) => p.id && p.title);
    initialPosts = mapped.length ? mapped : undefined;
  } catch {
    // PortfolioPage will fall back client-side
  }
  return <PortfolioPage initialPosts={initialPosts} />;
}
