import { ContentEditPage } from '@/src/admin/pages/ContentEditPage';

export default async function NewContentRoute({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return <ContentEditPage page={page} id="new" />;
}
