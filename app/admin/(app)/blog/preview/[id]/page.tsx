'use client'

import { BlogPreviewPage } from '@/src/admin/pages/BlogPreviewPage'
import { useParams } from 'next/navigation'

export default function PreviewBlogPostRoute() {
  const params = useParams()
  return <BlogPreviewPage postId={params.id as string} />
}
