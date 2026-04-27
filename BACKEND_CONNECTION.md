# Backend Connection Guide

This document explains how the Next.js frontend connects to the Go backend API.

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│  Next.js Frontend │──────│  Golang Backend  │──────│  Supabase DB     │
│  (Port 3000)     │      │  (Port 8080)     │      │  (PostgreSQL)    │
└─────────────────┘      └─────────────────┘      └──────────────────┘
```

## Setup

### 1. Environment Configuration

Add this to your `.env.local` file:

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080
```

### 2. Start the Backend

```bash
cd backend
make run
```

The backend will start on `http://localhost:8080`

### 3. Start Next.js

```bash
npm run dev
```

Next.js will start on `http://localhost:3000`

## How It Works

### API Rewrites

Next.js is configured to proxy API requests to the Go backend through rewrites in `next.config.ts`. This means:

1. Frontend makes request to `/api/admin/portfolio-items`
2. Next.js rewrites it to `http://localhost:8080/api/admin/portfolio-items`
3. Go backend handles the request
4. Response is returned to the frontend

This happens transparently - the frontend doesn't need to know about the backend URL.

### Updated Routes

The following routes have been updated to use the Go backend:

- ✅ `/api/admin/portfolio-items` - List and create portfolio items
- ✅ `/api/admin/portfolio-items/[id]` - Get, update, delete portfolio items
- ✅ `/api/admin/blog-posts` - List and create blog posts
- ✅ `/api/admin/blog-posts/[id]` - Get, update, delete blog posts

### Backend API Client

A centralized API client has been created at `src/lib/backend-api.ts` that provides:

- Type-safe API methods for all backend endpoints
- Automatic authentication cookie handling
- Consistent error handling
- Response formatting

Usage example:

```typescript
import { backendApi } from '@/src/lib/backend-api';

// Get all portfolio items
const items = await backendApi.portfolio.list();

// Create a new portfolio item
const newItem = await backendApi.portfolio.create({
  title: 'Amazing Event',
  slug: 'amazing-event',
  // ... other fields
});

// Update a portfolio item
const updated = await backendApi.portfolio.update('id-or-slug', {
  title: 'Updated Title',
});
```

## Migration Status

### Completed
- Portfolio items CRUD operations
- Blog posts CRUD operations (alias for portfolio items)

### Pending Migration
The following Next.js API routes still use Supabase directly and need to be migrated:

**Admin Routes:**
- `/api/admin/events` - Events management
- `/api/admin/services` - Services management
- `/api/admin/bookings` - Bookings management
- `/api/admin/users` - User management
- `/api/admin/media-library` - Media library management
- `/api/admin/content` - Site content management
- `/api/admin/site-settings` - Settings management

**Public Routes:**
- `/api/events` - Public events listing
- `/api/services` - Public services listing
- `/api/bookings` - Booking creation and availability

## Authentication

Authentication is handled by NextAuth.js. The session cookie is automatically included in requests to the backend through the `credentials: 'include'` option.

The Go backend validates the JWT token from the session cookie and checks user permissions before allowing access to admin endpoints.

## Cache Invalidation

When data is modified through the backend API, Next.js cache tags are automatically invalidated to ensure fresh data is served.

## Testing the Connection

1. Start both servers (backend on :8080, Next.js on :3000)
2. Login to the admin panel at `/admin`
3. Try creating/editing portfolio items
4. Check the browser Network tab to see requests being proxied to the backend
5. Check the backend console for request logs

## Troubleshooting

### Backend not responding
- Ensure the backend is running on port 8080
- Check that `NEXT_PUBLIC_BACKEND_API_URL` is set correctly
- Check the backend console for errors

### CORS errors
- Ensure the backend CORS middleware allows requests from your frontend URL
- Check that credentials are being included in requests

### Authentication errors
- Ensure you're logged in to the admin panel
- Check that the session cookie is being sent with requests
- Verify the backend JWT validation is working correctly

## Next Steps

1. Migrate remaining admin routes to use the backend
2. Migrate public API routes
3. Remove direct Supabase imports from migrated routes
4. Update any frontend code that directly uses Supabase to use the backend API client
5. Add comprehensive error handling and loading states
6. Implement request retry logic for failed requests
