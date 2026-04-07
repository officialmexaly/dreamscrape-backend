/**
 * Performance Optimization Quick Reference
 *
 * Quick copy-paste examples for common performance optimizations
 */

// ============================================
// COMPONENT OPTIMIZATION
// ============================================

// 1. Wrap expensive components in React.memo
import { memo } from 'react';

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  return <div>{/* expensive rendering */}</div>;
});

// 2. Use useCallback for event handlers
import { useCallback } from 'react';

const handleClick = useCallback((id: string) => {
  // Handle click
}, [/* dependencies */]);

// 3. Use useMemo for expensive calculations
import { useMemo } from 'react';

const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// 4. Batch state updates
const [state1, setState1] = useState();
const [state2, setState2] = useState();

// Bad: Two renders
setState1(value1);
setState2(value2);

// Good: One render
startTransition(() => {
  setState1(value1);
  setState2(value2);
});

// ============================================
// IMAGE OPTIMIZATION
// ============================================

// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For above-fold images
  sizes="(max-width: 768px) 100vw, 50vw"
  placeholder="blur" // Optional: blur placeholder
/>

// ============================================
// CODE SPLITTING
// ============================================

// Dynamic import for heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false // Optional: disable SSR
});

// ============================================
// PERFORMANCE UTILITIES
// ============================================

import {
  debounce,
  throttle,
  rafThrottle,
  clientCache,
  performanceMonitor
} from '@/lib/performance';

// Debounce search input
const handleSearch = debounce((query: string) => {
  // Perform search
}, 300);

// Throttle scroll handler
const handleScroll = throttle(() => {
  // Handle scroll
}, 100);

// RAF throttle for smooth animations
const handleAnimation = rafThrottle(() => {
  // Animation logic
});

// Client-side cache
const cache = clientCache.create<UserData>(60000); // 1 minute
cache.set('user-123', userData);
const cached = cache.get('user-123');

// Performance monitoring
performanceMonitor.measureRender('MyComponent', () => {
  // Component logic
});

// ============================================
// RATE LIMITING
// ============================================

import { rateLimit, rateLimitMiddleware } from '@/lib/rate-limit';

// In API route
export async function POST(request: NextRequest) {
  const result = await rateLimitMiddleware(request, 'booking');

  if (!result.success) {
    return result.response; // Returns 429 if rate limited
  }

  // Proceed with request
}

// ============================================
// CACHING
// ============================================

import { cachedFetch, CACHE_DURATION } from '@/lib/cache';

// Fetch with caching
const data = await cachedFetch('/api/data', {
  next: {
    revalidate: CACHE_DURATION.STATIC,
    tags: ['user-data', 'user-123']
  }
});

// ============================================
// PERFORMANCE MONITORING
// ============================================

// Measure component render
import { usePerformanceMonitor } from '@/lib/performance';

function MyComponent() {
  usePerformanceMonitor('MyComponent');

  return <div>Content</div>;
}

// Log web vitals
import { performanceMonitor } from '@/lib/performance';

performanceMonitor.logWebVital({
  name: 'LCP',
  value: 1234
});

// ============================================
// BEST PRACTICES
// ============================================

// DO:
// - Use React.memo for expensive components
// - Use useCallback for event handlers
// - Use useMemo for expensive calculations
// - Batch state updates when possible
// - Use Next.js Image component
// - Implement code splitting for large components
// - Use caching for expensive operations
// - Monitor performance regularly

// DON'T:
// - Over-optimize prematurely
// - Wrap everything in React.memo
// - Create too many useCallback/useMemo hooks
// - Forget to cleanup side effects
// - Use regular img tags (use Next.js Image)
// - Ignore performance monitoring
// - Skip code splitting for admin pages
// - Forget to set up caching

// ============================================
// PERFORMANCE CHECKLIST
// ============================================

// Before deploying to production:
// ✓ Run bundle analysis: npm run analyze
// ✓ Run Lighthouse audit: npm run lighthouse
// ✓ Check Core Web Vitals
// ✓ Verify image optimization
// ✓ Test on slow connections
// ✓ Monitor memory usage
// ✓ Check for unnecessary re-renders
// ✓ Verify caching strategy
// ✓ Test rate limiting
// ✓ Set up performance monitoring

// ============================================
// TROUBLESHOOTING
// ============================================

// Issue: Slow initial load
// Solution 1: Check bundle size
// Solution 2: Verify code splitting
// Solution 3: Optimize images

// Issue: High memory usage
// Solution 1: Profile with Chrome DevTools
// Solution 2: Check for memory leaks
// Solution 3: Reduce state size

// Issue: Poor Lighthouse scores
// Solution 1: Enable compression
// Solution 2: Optimize images
// Solution 3: Reduce JavaScript bundle

// ============================================
// RESOURCES
// ============================================

// Documentation:
// - /PERFORMANCE.md - Complete performance guide
// - /PERFORMANCE_IMPLEMENTATION_SUMMARY.md - Implementation details
// - /src/lib/performance.ts - Performance utilities

// Tools:
// - Bundle Analyzer: npm run analyze
// - Lighthouse: npm run lighthouse
// - Chrome DevTools: Performance tab
// - React DevTools: Profiler tab

// External Resources:
// - Next.js Performance: https://nextjs.org/docs/app/building-your-application/optimizing
// - Web Vitals: https://web.dev/vitals/
// - React Performance: https://react.dev/learn/render-and-commit
