'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type BlogPost = any;

type BlogPostsContextValue = {
  posts: BlogPost[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  savePost: (post: BlogPost, mode: 'create' | 'update') => Promise<BlogPost>;
  deletePost: (id: string) => Promise<void>;
};

const BlogPostsContext = createContext<BlogPostsContextValue | null>(null);

export function BlogPostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapFromDb = (row: any) => {
    // Map database rows to blog post format with content blocks
    let contentBlocks: any[] = [];
    if (Array.isArray(row?.images) && row.images.length) {
      contentBlocks = row.images;
    } else {
      const description = String(row?.description || '');
      const paragraphs = description
        .split(/\n\s*\n/g)
        .map((p) => p)
        .filter((p) => p.length > 0);

      const gallery = Array.isArray(row?.gallery_images) ? row.gallery_images : [];
      contentBlocks = paragraphs.map((p: string, idx: number) => ({
        id: `t_${row.id}_${idx}`,
        type: 'text',
        content: p,
      }));

      // Add gallery images as image blocks at the end (simple, predictable)
      gallery.forEach((url: string, idx: number) => {
        if (!url) return;
        contentBlocks.push({
          id: `i_${row.id}_${idx}`,
          type: 'image',
          content: url,
        });
      });
    }

    return {
      id: row.id,
      title: row.title || '',
      subtitle: '',
      author: row.client_name || 'Dreamscape Team',
      date: (row.event_date || row.created_at || new Date().toISOString()).slice(0, 10),
      status: row.status === 'published' ? 'Published' : 'Draft',
      category: row.event_type || '',
      location: row.location || '',
      excerpt: row.meta_description || '',
      image: row.featured_image || '',
      contentBlocks,
      __raw: row,
    };
  };

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/portfolio-items', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load posts');
      setPosts((json.items || []).map(mapFromDb));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const savePost: BlogPostsContextValue['savePost'] = async (post, mode) => {
    const slugBase =
      (post.title || 'story')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'story';
    const slug = post.__raw?.slug || `${slugBase}-${Date.now()}`;

    // Convert editor blocks back to database format
    const blocks = Array.isArray(post.contentBlocks) ? post.contentBlocks : [];
    const descriptionParagraphs = blocks
      .filter((b: any) => b?.type === 'text' && String(b?.content || '').length > 0)
      .map((b: any) => String(b.content));
    const galleryImages = blocks
      .filter((b: any) => b?.type === 'image' && String(b?.content || '').trim())
      .map((b: any) => String(b.content).trim());

    const payload = {
      slug,
      title: post.title,
      client_name: post.author || null,
      event_date: post.date || null,
      event_type: post.category || 'Wedding',
      location: post.location || null,
      description: descriptionParagraphs.join('\n\n'),
      images: blocks,
      featured_image: post.image || '',
      gallery_images: galleryImages,
      meta_description: post.excerpt || null,
      status: post.status === 'Published' ? 'published' : 'draft',
    };

    const routeKey = post?.id || post?.__raw?.id || post?.__raw?.slug || slug;
    const endpoint =
      mode === 'create' ? '/api/portfolio-items' : `/api/portfolio-items/${routeKey}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    const res = await fetch(endpoint, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'Failed to save post');

    const mapped = mapFromDb(json.item);
    setPosts((prev) => {
      if (mode === 'create') return [mapped, ...prev];
      return prev.map((p: any) => (p.id === mapped.id ? mapped : p));
    });
    return mapped;
  };

  const deletePost: BlogPostsContextValue['deletePost'] = async (id) => {
    const res = await fetch(`/api/portfolio-items/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'Failed to delete post');
    setPosts((prev) => prev.filter((p: any) => p.id !== id));
  };

  const value = useMemo<BlogPostsContextValue>(
    () => ({ posts, isLoading, refresh, savePost, deletePost }),
    [posts, isLoading]
  );

  return <BlogPostsContext.Provider value={value}>{children}</BlogPostsContext.Provider>;
}

export function useBlogPosts() {
  const ctx = useContext(BlogPostsContext);
  if (!ctx) throw new Error('useBlogPosts must be used within BlogPostsProvider');
  return ctx;
}
