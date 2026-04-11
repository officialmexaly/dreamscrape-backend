import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/src/lib/cached-posts';
import { protectAdminRoute } from '@/src/lib/server-auth';

export async function GET() {
  const errorResponse = await protectAdminRoute();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabaseAdmin()
    .from('portfolio_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
  const errorResponse = await protectAdminRoute();
  if (errorResponse) return errorResponse;

  const body = await request.json();

  const insert = {
    slug: body.slug,
    title: body.title,
    excerpt: body.excerpt ?? null,
    content: body.content ?? null,
    featured_image: body.featured_image ?? null,
    author: body.author ?? null,
    categories: body.categories ?? [],
    tags: body.tags ?? [],
    meta_title: body.meta_title ?? null,
    meta_description: body.meta_description ?? null,
    status: body.status ?? 'draft',
    
  };

  const { data, error } = await supabaseAdmin()
    .from('portfolio_items')
    .insert(insert)
    .select()
    .single();

  if (error) {
    console.error('Insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateTag(CACHE_TAGS.blogPosts, "max");
  return NextResponse.json({ item: data });
}
