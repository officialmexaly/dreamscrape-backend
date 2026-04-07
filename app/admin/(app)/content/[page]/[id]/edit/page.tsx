import { ContentEditPage } from '@/src/admin/pages/ContentEditPage';

export default async function EditContentRoute({ params }: { params: Promise<{ page: string; id: string }> }) {
  const { page, id } = await params;
  return <ContentEditPage page={page} id={id} />;
}
