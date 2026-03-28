import { notFound } from 'next/navigation';
import { PortfolioStoryPage } from '@/src/components/pages/PortfolioStoryPage';
import { BLOG_POSTS, getBlogPostById } from '@/src/lib/blog-posts';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.id
  }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostById(slug);

  if (!post) {
    notFound();
  }

  return <PortfolioStoryPage post={post} />;
}
