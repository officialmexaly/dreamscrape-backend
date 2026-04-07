import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/src/lib/cached-posts';

type BlogPost = {
  id?: string;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  featured_image?: string | null;
  author?: string | null;
  categories?: string[];
  tags?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  status?: string;
  published_at?: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = (id || '').trim().replace(/\s+/g, '');

  const query = supabaseAdmin().from('blog_posts').select('*');
  const { data, error } = isUuid(key)
    ? await query.eq('id', key).maybeSingle<BlogPost>()
    : await query.eq('slug', key).maybeSingle<BlogPost>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
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

  // @ts-ignore - Supabase type inference issue with dynamic updates
  const updateQuery = supabaseAdmin().from('blog_posts').update(update).select('*');
  const { data, error } = isUuid(key)
    ? await updateQuery.eq('id', key).maybeSingle()
    : await updateQuery.eq('slug', key).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) {
    // If the client is editing by slug and the row doesn't exist (e.g. slug changed),
    // fall back to upsert by `slug`.
    if (!isUuid(key) && update.slug) {
      const { data: upserted, error: upsertError } = await supabaseAdmin()
        .from('blog_posts')
        // @ts-ignore - Supabase type inference issue with upsert
        .upsert(update, { onConflict: 'slug' })
        .select('*')
        .single();

      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 400 });
      }
      return NextResponse.json({ item: upserted });
    }

    return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
  }
  // Immediately invalidate cached public reads
  revalidateTag(CACHE_TAGS.BLOG_LIST);
  if (key) revalidateTag(CACHE_TAGS.BLOG_POST(key));
  if (data?.id) revalidateTag(CACHE_TAGS.BLOG_POST(String(data.id)));
  if (data?.slug) revalidateTag(CACHE_TAGS.BLOG_POST(String(data.slug)));
  return NextResponse.json({ item: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = (id || '').trim().replace(/\s+/g, '');
  const deleteQuery = supabaseAdmin().from('blog_posts').delete();
  const { error } = isUuid(key) ? await deleteQuery.eq('id', key) : await deleteQuery.eq('slug', key);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Immediately invalidate cached public reads
  revalidateTag(CACHE_TAGS.BLOG_LIST);
  if (key) revalidateTag(CACHE_TAGS.BLOG_POST(key));
  return NextResponse.json({ ok: true });
}
