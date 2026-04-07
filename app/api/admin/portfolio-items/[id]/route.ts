import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = (id || '').trim().replace(/\s+/g, '');

  const query = supabaseAdmin().from('portfolio_items').select('*');
  const { data, error } = isUuid(key)
    ? await query.eq('id', key).maybeSingle<any>()
    : await query.eq('slug', key).maybeSingle<any>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
  }

  return NextResponse.json({ item: data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = (id || '').trim().replace(/\s+/g, '');
  const body = await request.json();

  const update = {
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

  const updateQuery = supabaseAdmin().from('portfolio_items')
    // @ts-ignore - Supabase type inference issue with dynamic updates
    .update(update as any).select('*');
  const { data, error } = isUuid(key)
    ? await updateQuery.eq('id', key).maybeSingle<any>()
    : await updateQuery.eq('slug', key).maybeSingle<any>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    if (!isUuid(key) && update.slug) {
      const { data: upserted, error: upsertError } = await supabaseAdmin()
        .from('portfolio_items')
        // @ts-ignore - Supabase type inference issue with upsert
        .upsert(update as any, { onConflict: 'slug' })
        .select('*')
        .single();
      if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 400 });
      return NextResponse.json({ item: upserted });
    }
    return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = (id || '').trim().replace(/\s+/g, '');
  const deleteQuery = supabaseAdmin().from('portfolio_items').delete();
  const { error } = isUuid(key)
    ? await deleteQuery.eq('id', key)
    : await deleteQuery.eq('slug', key);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
