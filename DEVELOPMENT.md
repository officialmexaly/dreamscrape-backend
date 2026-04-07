# Development Guide

## Project Structure

This document provides a comprehensive overview of the Dreamscape Curated Events codebase organization and development patterns.

### Directory Structure

```
dreamscape-curated-event/
├── app/                          # Next.js 16 App Router
│   ├── (public pages)/           # Public-facing pages
│   │   ├── page.tsx             # Home page
│   │   ├── about/               # About page
│   │   ├── services/            # Services page
│   │   ├── consultation/        # Consultation booking
│   │   ├── contact/             # Contact page
│   │   ├── love-notes/          # Testimonials
│   │   ├── blog/                # Blog listing and posts
│   │   └── portfolio/           # Portfolio showcase
│   ├── admin/                    # Admin panel
│   │   ├── (app)/               # Admin application pages
│   │   ├── login/               # Admin authentication
│   │   └── layout.tsx           # Admin layout
│   └── api/                      # API routes
│       ├── bookings/            # Booking management
│       ├── blog-posts/          # Blog content API
│       ├── events/              # Events API
│       ├── portfolio-items/     # Portfolio API
│       ├── services/            # Services API
│       ├── site-content/        # CMS content API
│       └── admin/               # Admin-only APIs
│           ├── blog-posts/
│           ├── bookings/
│           ├── content/
│           ├── events/
│           ├── media-library/
│           ├── portfolio-items/
│           ├── services/
│           └── site-settings/
│
├── src/                          # Source code
│   ├── components/               # React components
│   │   ├── pages/               # Page-specific components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── Footer.tsx           # Site footer
│   │   ├── Navigation.tsx       # Site navigation
│   │   └── ScrollReveal.tsx     # Animation component
│   │
│   ├── lib/                      # Utility libraries
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAvailability.ts
│   │   │   └── useFileUpload.ts
│   │   ├── cache.ts             # Caching configuration
│   │   ├── rate-limit.ts        # Rate limiting
│   │   ├── revalidate.ts        # Cache revalidation
│   │   ├── supabase.ts          # Supabase client
│   │   ├── supabase-admin.ts    # Admin Supabase client
│   │   ├── supabase-storage.ts  # File storage utilities
│   │   ├── utils.ts             # General utilities
│   │   └── validation.ts        # Zod schemas & validation
│   │
│   ├── admin/                    # Admin panel code
│   │   ├── components/          # Admin UI components
│   │   ├── pages/               # Admin page components
│   │   ├── providers/           # React context providers
│   │   └── theme.ts             # Admin theme configuration
│   │
│   └── types/                    # TypeScript type definitions
│       └── index.ts             # Central type definitions
│
├── public/                       # Static assets
│   └── media/                   # User-uploaded media
│
└── database/                     # Database schema & migrations
    ├── schema.sql               # Database schema
    └── migrations/              # Migration files
```

### Key Patterns

#### 1. Component Organization

**Page Components** (`src/components/pages/`)
- Server and client components for specific pages
- Named after the page they serve (e.g., `HomePage.tsx`)
- Handle page-specific logic and layout

**UI Components** (`src/components/ui/`)
- Reusable, generic UI components
- Organized by component type (button, input, etc.)
- Each component has its own directory with index file

**Admin Components** (`src/admin/components/`)
- Admin-specific UI components
- Higher-order components for admin functionality
- Data tables, forms, and management interfaces

#### 2. Data Fetching Patterns

**Server-Side Fetching** (App Router)
```typescript
// In app/page.tsx or similar
export default async function Page() {
  const { data } = await supabaseAdmin()
    .from('table')
    .select('*');

  return <Component data={data} />;
}
```

**Client-Side Fetching** (Custom Hooks)
```typescript
// Using custom hooks from src/lib/hooks/
const { data, isLoading, error } = useSiteContent('page-name');
```

**API Routes** (app/api/)
- RESTful endpoints for CRUD operations
- Auth-protected admin routes
- Validation and error handling

#### 3. Type Safety

**Central Types** (`src/types/index.ts`)
- All shared TypeScript interfaces
- Database row types
- API request/response types
- Component prop types

**Component Props**
```typescript
interface ComponentProps {
  data: DataType;
  onAction: (id: string) => void;
}

export function Component({ data, onAction }: ComponentProps) {
  // Implementation
}
```

#### 4. State Management

**Local State** (useState)
- Component-specific state
- Form inputs and UI state
- Temporary data

**Server State** (Custom Hooks)
- Data fetching with loading/error states
- Caching and revalidation
- Optimistic updates

**Global State** (Context Providers)
- Admin authentication
- Site content
- Media library
- Settings

#### 5. Styling

**Tailwind CSS**
- Utility-first CSS framework
- Custom configuration in `tailwind.config.js`
- Responsive design with mobile-first approach

**Component Styling**
```typescript
// Using cn() utility for class merging
import { cn } from '@/src/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  'additional-classes'
)}>
```

### Naming Conventions

#### Files
- **Components**: PascalCase (e.g., `HomePage.tsx`, `Button.tsx`)
- **Utilities**: camelCase (e.g., `useSiteContent.ts`, `validation.ts`)
- **Types**: camelCase (e.g., `index.ts`, `site-content-types.ts`)
- **API Routes**: lowercase with hyphens (e.g., `blog-posts/route.ts`)

#### Variables & Functions
- **Components**: PascalCase (e.g., `const HomePage = () => {}`)
- **Functions**: camelCase (e.g., `formatPhoneNumber()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `RATE_LIMITS`)
- **Types/Interfaces**: PascalCase (e.g., `interface HomePageProps`)

#### CSS Classes
- **Tailwind**: Use utility classes directly
- **Custom**: kebab-case (e.g., `.scroll-reveal`)

### Import Organization

```typescript
// 1. React and Next.js imports
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// 3. Internal imports (use @ alias)
import { Button } from '@/src/components/ui/button';
import { useSiteContent } from '@/src/lib/hooks/useSiteContent';
import type { HomePageProps } from '@/src/types';

// 4. Relative imports (for co-located files)
import { LocalComponent } from './LocalComponent';
```

### Best Practices

#### 1. Error Handling
```typescript
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

#### 2. Validation
```typescript
import { bookingSchema } from '@/src/lib/validation';

const result = bookingSchema.safeParse(formData);
if (!result.success) {
  return { errors: result.error.flatten() };
}
```

#### 3. Performance
- Use `React.memo()` for expensive components
- Implement `useCallback` and `useMemo` where appropriate
- Lazy load routes and heavy components
- Optimize images with Next.js Image component

#### 4. Security
- Validate all user inputs
- Sanitize data before display
- Use rate limiting on API routes
- Implement proper authentication checks
- Never expose sensitive data on client side

#### 5. Accessibility
- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Test with screen readers
- Use ARIA labels where necessary

### Development Workflow

#### 1. Adding a New Page
1. Create page in `app/[page-name]/page.tsx`
2. Create component in `src/components/pages/[PageName]Page.tsx`
3. Add types to `src/types/index.ts` if needed
4. Update navigation in `src/components/Navigation.tsx`

#### 2. Adding a New API Route
1. Create route in `app/api/[resource-name]/route.ts`
2. Add validation schemas to `src/lib/validation.ts`
3. Implement error handling and rate limiting
4. Add TypeScript types for request/response

#### 3. Adding a New Component
1. Create component file in appropriate directory
2. Define prop interfaces
3. Export component and types
4. Add to index file if in subdirectory

#### 4. Database Changes
1. Update schema in `database/schema.sql`
2. Create migration file
3. Update TypeScript types in `src/types/index.ts`
4. Update API routes to handle new fields

### Testing

#### Type Checking
```bash
npm run typecheck
```

#### Linting
```bash
npm run lint:check  # Check for issues
npm run lint        # Fix issues automatically
```

#### Building
```bash
npm run build       # Production build
npm run dev         # Development server
```

### Deployment

#### Environment Variables
Ensure these are set in production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

#### Build Process
```bash
npm run build       # Build for production
npm start           # Start production server
```

## Contributing

When contributing to this codebase:
1. Follow the established patterns and conventions
2. Add JSDoc comments to utility functions
3. Update types in `src/types/index.ts`
4. Test your changes thoroughly
5. Run type checking before committing
6. Update documentation as needed

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Zod Documentation](https://zod.dev/)
