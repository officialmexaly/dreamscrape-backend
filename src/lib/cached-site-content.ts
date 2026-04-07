import 'server-only';

import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

export const SITE_CONTENT_CACHE_TAGS = {
  ALL: 'site-content',
  PAGE: (page: string) => `site-content:${page}`,
  SECTION: (page: string, section: string) => `site-content:${page}:${section}`,
} as const;

function normalizeValue(item: any) {
  if (item?.content_type === 'json') {
    const value = item.content_json;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
  if (item?.content_type === 'number') return item.content_number;
  if (item?.content_type === 'boolean') return item.content_boolean;
  return item.content;
}

function groupItems(items: any[]) {
  const grouped: Record<string, any> = {};
  for (const item of items) {
    const key = `${item.page}_${item.section}`;
    if (!grouped[key]) grouped[key] = {};
    grouped[key][item.content_key] = {
      value: normalizeValue(item),
      type: item.content_type,
      id: item.id,
      display_order: item.display_order,
    };
  }
  return grouped;
}

export const getSiteContentPageCached = (page: string) =>
  unstable_cache(
    async (p: string) => {
      const { data, error } = await supabaseAdmin()
        .from('site_content')
        .select('*')
        .eq('page', p)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      const items = data ?? [];
      return { items, grouped: groupItems(items) };
    },
    ['site-content-page', page],
    { tags: [SITE_CONTENT_CACHE_TAGS.ALL, SITE_CONTENT_CACHE_TAGS.PAGE(page)], revalidate: 60 * 60 }
  )(page);

export const getSiteContentSectionCached = (page: string, section: string) =>
  unstable_cache(
    async (p: string, s: string) => {
      const { data, error } = await supabaseAdmin()
        .from('site_content')
        .select('*')
        .eq('page', p)
        .eq('section', s)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      const items = data ?? [];
      return { items, grouped: groupItems(items) };
    },
    ['site-content-section', page, section],
    {
      tags: [
        SITE_CONTENT_CACHE_TAGS.ALL,
        SITE_CONTENT_CACHE_TAGS.PAGE(page),
        SITE_CONTENT_CACHE_TAGS.SECTION(page, section),
      ],
      revalidate: 60 * 60,
    }
  )(page, section);

