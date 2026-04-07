import { ContentListPage } from '@/src/admin/pages/ContentListPage';

export default async function PageContentRoute({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return <ContentListPage page={page} />;
}
