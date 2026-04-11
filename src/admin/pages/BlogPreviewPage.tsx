'use client'

import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { BlogPost as PublicPost } from '@/src/lib/blog-posts'
import { BlogStoryPage } from '@/src/components/pages/BlogStoryPage'
import { useBlogPosts } from '../providers/BlogPostsProvider'
import { Button } from '@/components/ui/button'
import { mapBlogRowToPublicPost } from '@/src/lib/public-posts'

export function BlogPreviewPage({ postId }: { postId: string }) {
  const router = useRouter()
  const { posts, getPost } = useBlogPosts()
  const [isLoading, setIsLoading] = React.useState(false)

  const post = posts.find((p: any) => p.id === postId || p.__raw?.slug === postId) as any

  React.useEffect(() => {
    if (post) return
    if (!postId) return
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        await getPost(postId)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [getPost, post, postId])

  const publicPost = React.useMemo<PublicPost | null>(() => {
    if (!post?.__raw) return null
    return mapBlogRowToPublicPost(post.__raw) as any
  }, [post, postId])

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading preview…</div>
  }

  if (!publicPost) {
    return <div className="p-8 text-sm text-muted-foreground">Post not found.</div>
  }

  const routeId = post.__raw?.slug || post.id || postId

  return (
    <div className="min-h-screen bg-[#fcf8f7] -m-8">
      <div className="sticky top-0 z-20 border-b border-border/70 bg-background/70 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/blog/${routeId}/edit`)}
            >
              <ArrowLeft size={16} />
              Back to Editor
            </Button>
            <span className="text-sm text-muted-foreground">Preview</span>
          </div>
        </div>
      </div>

      <BlogStoryPage post={publicPost} />
    </div>
  )
}
