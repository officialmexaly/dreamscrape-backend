import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/src/lib/cached-posts'
import { protectAdminRoute } from '@/src/lib/server-auth'

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

function normalizeKey(value: string) {
  return value.trim().replace(/\s+/g, '')
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const errorResponse = await protectAdminRoute()
  if (errorResponse) return errorResponse

  const { id } = await params
  const key = normalizeKey(id || '')

  const query = supabaseAdmin().from('portfolio_items').select('*')
  const { data, error } = isUuid(key)
    ? await query.eq('id', key).maybeSingle()
    : await query.eq('slug', key).maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ item: data })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const errorResponse = await protectAdminRoute()
  if (errorResponse) return errorResponse

  const { id } = await params
  const key = normalizeKey(id || '')
  const body = await request.json()

  const update = {
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
    
    updated_at: new Date().toISOString(),
  }

  const query = supabaseAdmin().from('portfolio_items').update(update).select().single()
  const { data, error } = isUuid(key)
    ? await query.eq('id', key)
    : await query.eq('slug', key)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag(CACHE_TAGS.blogPosts)
  return NextResponse.json({ item: data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const errorResponse = await protectAdminRoute()
  if (errorResponse) return errorResponse

  const { id } = await params
  const key = normalizeKey(id || '')

  const query = supabaseAdmin().from('portfolio_items').delete().select().single()
  const { data, error } = isUuid(key)
    ? await query.eq('id', key)
    : await query.eq('slug', key)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag(CACHE_TAGS.blogPosts)
  return NextResponse.json({ item: data })
}
