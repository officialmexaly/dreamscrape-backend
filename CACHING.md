# Caching Strategy for Dreamscape Website

## Overview

This website implements a comprehensive multi-layer caching strategy to optimize performance and reduce database load while ensuring content stays fresh.

## Cache Durations

| Content Type | Cache Duration | Stale-While-Revalidate | Description |
|--------------|----------------|------------------------|-------------|
| Static Assets (JS/CSS) | 1 year | - | Immutable static files |
| Images (SVG, JPG, PNG, etc.) | 1 year | - | Optimized images |
| Portfolio Items | 15 minutes | 30 minutes | Event stories and showcase |
| Blog Posts | 30 minutes | 1 hour | Articles and blog content |
| Site Content | 1 hour | 2 hours | Home, About, Services, Contact pages |
| Availability | 5 minutes | 5 minutes | Real-time booking availability |
| Media Library | 2 hours | - | Uploaded media files |

## Implementation Details

### 1. API Route Caching

All public API routes include cache headers:

```typescript
response.headers.set('Cache-Control', `public, max-age=${duration}, stale-while-revalidate=${swr}`);
response.headers.set('CDN-Cache-Control', `public, max-age=${duration}, stale-while-revalidate=${swr}`);
```

**Cached Routes:**
- `/api/portfolio-items` - 15 minutes
- `/api/site-content` - 1 hour
- `/api/blog-posts` - 30 minutes
- `/api/bookings/availability` - 5 minutes

### 2. Static Asset Caching

Configured in `next.config.ts`:

- Images: 1 year, immutable
- JavaScript/CSS: 1 year, immutable
- Static files: 1 year, immutable

### 3. Image Optimization

Next.js Image component automatically:
- Converts to AVIF/WebP formats
- Optimizes file sizes
- Caches optimized versions

### 4. Cache Revalidation

When content is updated in the admin panel, cache is automatically invalidated:

```typescript
revalidateTag('site-content');
revalidateTag(`content-${page}`);
revalidateTag('portfolio');
```

## Cache Invalidation

### Automatic Invalidation

Cache is automatically invalidated when:
- Content is updated via admin panel
- Portfolio items are added/edited/deleted
- Site content is modified
- Blog posts are published/updated

### Manual Invalidation

Use the revalidation API:

```typescript
// Revalidate all site content
await fetch('/api/revalidate?tag=site-content', { method: 'POST' });

// Revalidate specific page
await fetch('/api/revalidate?tag=content-home', { method: 'POST' });

// Revalidate portfolio
await fetch('/api/revalidate?tag=portfolio', { method: 'POST' });

// Revalidate by path
await fetch('/api/revalidate?path=/blog', { method: 'POST' });
```

## Stale-While-Revalidate

This strategy allows:
1. Serve cached content immediately (fast)
2. Refresh cache in background (fresh content)
3. Zero downtime for users

Example: Portfolio items cached for 15 minutes with 30-minute SWR:
- First 15 min: Serve from cache
- 15-30 min: Serve stale cache, refresh in background
- After 30 min: Cache expires, fetch fresh

## Performance Benefits

1. **Faster Page Loads** - Cached content loads instantly
2. **Reduced Database Load** - Fewer queries to Supabase
3. **Better SEO** - Faster page speeds improve rankings
4. **Lower Costs** - Reduced database queries and bandwidth
5. **Better UX** - Instant page transitions

## Monitoring

Check cache effectiveness using:
1. Browser DevTools Network tab (look for "Disk Cache" or "Memory Cache")
2. Response headers (Cache-Control, CDN-Cache-Control)
3. Next.js analytics (if enabled)

## Best Practices

1. **Appropriate Cache Times** - Balance freshness vs performance
2. **Tag-Based Invalidation** - Use specific tags for precise invalidation
3. **Stale-While-Revalidate** - Always use SWR for better UX
4. **Monitor Performance** - Regular check cache hit rates
5. **Test Invalidation** - Verify cache clears when content updates

## Troubleshooting

### Content not updating after admin edit

1. Check if cache revalidation was triggered
2. Verify cache tags match
3. Clear browser cache and test
4. Check Next.js revalidation logs

### Slow page loads

1. Verify cache headers are present
2. Check CDN is caching responses
3. Monitor database query performance
4. Review cache duration settings

## Future Enhancements

1. **Edge Runtime** - Move API routes to edge for global caching
2. **CDN Integration** - Use Vercel/Cloudflare CDN
3. **Full Static Generation** - Pre-render pages at build time
4. **Query Caching** - Cache Supabase queries directly
5. **Client-Side Caching** - Implement React Query/SWR
