import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/src/lib/cached-posts';

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const insert = {
    slug: body.slug,
    title: body.title,
    content: body.content ?? '',
    excerpt: body.excerpt ?? null,
    featured_image: body.featured_image ?? null,
    author: body.author ?? null,
    categories: body.categories ?? [],
    tags: body.tags ?? [],
    meta_title: body.meta_title ?? null,
    meta_description: body.meta_description ?? null,
    status: body.status ?? 'draft',
    published_at: body.published_at ?? null,
  };

  const { data, error } = await supabaseAdmin()
    .from('blog_posts')
    .insert([insert] as any)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Immediately invalidate cached public reads
  revalidateTag(CACHE_TAGS.BLOG_LIST);
  if (data?.id) revalidateTag(CACHE_TAGS.BLOG_POST(String(data.id)));
  if (data?.slug) revalidateTag(CACHE_TAGS.BLOG_POST(String(data.slug)));
  return NextResponse.json({ item: data }, { status: 201 });
}
