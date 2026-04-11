import BlogPage from '@/src/components/pages/BlogPage';
import { getPublishedBlogPostsCached } from '@/src/lib/cached-posts';
import { mapBlogRowToPublicPost } from '@/src/lib/public-posts';
import type { BlogPost } from '@/src/lib/blog-posts';

export default async function Page() {
  let initialPosts: BlogPost[] | undefined;
  try {
    const rows = await getPublishedBlogPostsCached();
    const mapped = rows.map(mapBlogRowToPublicPost).filter((p: BlogPost) => p.id && p.title);
    initialPosts = mapped.length ? mapped : undefined;
  } catch {
    // BlogPage will fall back client-side
  }
  return <BlogPage initialPosts={initialPosts} />;
}
