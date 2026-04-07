import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from('events')
    .select('*')
    .order('display_order', { ascending: true })
    .order('event_date', { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
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
    .from('events')
    .insert([insert] as any)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
