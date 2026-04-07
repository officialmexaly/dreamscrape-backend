# Utility Libraries

This directory contains reusable utility functions, custom hooks, and configuration for the Dreamscape Curated Events application.

## Modules

### Hooks (`hooks/`)

Custom React hooks for data fetching and state management.

#### `useAvailability.ts`
Hook for fetching and managing consultation slot availability.

**Usage:**
```typescript
const { availability, isLoading, error, isSlotBooked } = useAvailability(
  startDate,
  endDate
);
```

**Returns:**
- `availability`: Booked dates and times
- `isLoading`: Loading state
- `error`: Error message if fetch failed
- `isSlotBooked(date, time)`: Check if specific slot is booked
- `isDateBooked(date)`: Check if date has any bookings
- `getAvailableTimes(date, allTimes)`: Get available times for date

#### `useFileUpload.ts`
Hook for handling file uploads with drag-and-drop support.

**Usage:**
```typescript
const {
  uploads,
  successfulUploads,
  isUploading,
  getRootProps,
  getInputProps
} = useFileUpload({
  maxFiles: 5,
  maxSize: 10 * 1024 * 1024,
  onUploadComplete: (files) => console.log('Uploaded:', files)
});
```

### Utilities

#### `utils.ts`
General utility functions.

**Functions:**
- `cn(...inputs)`: Merge Tailwind CSS classes with conflict resolution

```typescript
import { cn } from '@/src/lib/utils';

<div className={cn('px-4 py-2', isActive && 'bg-blue-500')} />
```

#### `validation.ts`
Zod validation schemas and security utilities.

**Schemas:**
- `bookingSchema`: Consultation booking form validation
- `contactFormSchema`: Contact form validation

**Security Functions:**
- `sanitizeInput(input)`: Remove dangerous characters
- `isDisposableEmail(email)`: Check for temporary email domains
- `formatPhoneNumber(phone)`: Format to international standard
- `escapeSqlLike(input)`: Escape SQL wildcards
- `escapeHtml(unsafe)`: Convert HTML entities
- `validateFile(file)`: Validate file uploads

**Rate Limiting:**
- `RATE_LIMITS`: Configuration for different endpoint types

#### `cache.ts`
Caching configuration for Next.js incremental static regeneration.

**Constants:**
- `CACHE_DURATION`: Cache times for different content types
- `CACHE_TAGS`: Cache tags for revalidation

**Functions:**
- `generateCacheHeaders(maxAge, staleWhileRevalidate)`: Generate HTTP cache headers
- `cachedFetch(url, options)`: Fetch with caching options

#### `rate-limit.ts`
In-memory rate limiting for API protection.

**Functions:**
- `rateLimit(identifier, type)`: Check if request is rate limited
- `getClientIdentifier(request)`: Generate unique client identifier
- `rateLimitMiddleware(request, type)`: Express-style middleware

#### `revalidate.ts`
Cache revalidation utilities.

**Functions:**
- `revalidateTag(tag)`: Revalidate cache by tag
- `revalidatePath(path)`: Revalidate cache by path

### Supabase Clients

#### `supabase.ts`
Public Supabase client for client-side operations.

```typescript
import { supabase } from '@/src/lib/supabase';

const { data, error } = await supabase()
  .from('table')
  .select('*');
```

#### `supabase-admin.ts`
Admin Supabase client with service role key (server-only).

```typescript
import { supabaseAdmin } from '@/src/lib/supabase-admin';

// Use in API routes or server components
const { data, error } = await supabaseAdmin()
  .from('table')
  .select('*');
```

#### `supabase-storage.ts`
File storage utilities for Supabase storage.

**Functions:**
- `uploadFile(bucket, path, file)`: Upload file to storage
- `deleteFile(bucket, path)`: Delete file from storage
- `getPublicUrl(bucket, path)`: Get public URL for file
- `listFiles(bucket, path)`: List files in directory

### Other Utilities

#### `request-url.ts`
Get the current request URL (server-side).

#### `blog-posts.ts`
Blog post data fetching and formatting.

#### `portfolio.ts`
Portfolio item data fetching and formatting.

## Adding New Utilities

1. Create file in appropriate subdirectory
2. Add JSDoc comments with examples
3. Export functions/types
4. Add tests if applicable
5. Update this README

## Best Practices

- Always add JSDoc comments with usage examples
- Use TypeScript for all functions
- Handle errors appropriately
- Validate inputs
- Follow existing patterns
- Keep functions focused and single-purpose
