import { NextRequest, NextResponse } from 'next/server';
import { supabasePublicServer } from '@/src/lib/supabase-public-server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';
import { CACHE_DURATION, CACHE_TAGS } from '@/src/lib/cache';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS as POSTS_CACHE_TAGS } from '@/src/lib/cached-posts';

function requireAdmin(request: NextRequest) {
  const cookie = request.cookies.get('dreamscape_admin_auth')?.value;
  return cookie === '1';
}

export async function GET() {
  const { data, error } = await supabasePublicServer()
    .from('portfolio_items')
    .select('*')
    .eq('status', 'published')
    .order('display_order', { ascending: true })
    .order('event_date', { ascending: false, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Add cache headers for portfolio items
  const response = NextResponse.json({ items: data ?? [] });
  response.headers.set('Cache-Control', `public, max-age=${CACHE_DURATION.PORTFOLIO}, stale-while-revalidate=${CACHE_DURATION.PORTFOLIO * 2}`);
  response.headers.set('CDN-Cache-Control', `public, max-age=${CACHE_DURATION.PORTFOLIO}, stale-while-revalidate=${CACHE_DURATION.PORTFOLIO * 2}`);

  return response;
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const insert = {
    slug: body.slug,
    title: body.title,
    client_name: body.client_name ?? null,
    event_date: body.event_date ?? null,
    event_type: body.event_type,
    location: body.location ?? null,
    description: body.description ?? '',
    images: body.images ?? [],
    featured_image: body.featured_image ?? '',
    gallery_images: body.gallery_images ?? [],
    budget: body.budget ?? null,
    guest_count: body.guest_count ?? null,
    vendors: body.vendors ?? [],
    testimonial: body.testimonial ?? null,
    meta_title: body.meta_title ?? null,
    meta_description: body.meta_description ?? null,
    status: body.status ?? 'draft',
    display_order: body.display_order ?? 0,
  };

  const { data, error } = await supabaseAdmin()
    .from('portfolio_items')
    .insert([insert] as any)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Immediately invalidate cached public reads
  revalidateTag(POSTS_CACHE_TAGS.PORTFOLIO_LIST);
  if (data?.id) revalidateTag(POSTS_CACHE_TAGS.PORTFOLIO_ITEM(String(data.id)));
  if (data?.slug) revalidateTag(POSTS_CACHE_TAGS.PORTFOLIO_ITEM(String(data.slug)));
  return NextResponse.json({ item: data }, { status: 201 });
}
