import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

// GET /api/blog-posts - Fetch published blog posts for public website
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    // If slug is provided, fetch single published post
    if (slug) {
      const key = slug.trim().replace(/\s+/g, '');
      const query = supabaseAdmin().from('portfolio_items').select('*').eq('status', 'published');
      const { data, error } = isUuid(key)
        ? await query.eq('id', key).maybeSingle()
        : await query.eq('slug', key).maybeSingle();

      if (error) {
        console.error('❌ Error fetching blog post:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }

      return NextResponse.json({ post: data });
    }

    // Otherwise fetch all published posts
    const { data, error } = await supabaseAdmin()
      .from('portfolio_items')
      .select('*')
      .eq('status', 'published')
      ..order('event_date', { ascending: false }), { ascending: false });

    if (error) {
      console.error('❌ Error fetching blog posts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data ?? [] });
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
