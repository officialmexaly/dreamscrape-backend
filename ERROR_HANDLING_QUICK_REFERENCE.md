# Error Handling Quick Reference

## Quick Start

### 1. Import Error Handler
```typescript
import { ErrorHandler, ErrorType, createErrorResponse } from '@/src/lib/error-handler';
import { CommonErrors } from '@/src/lib/common-errors';
```

### 2. Handle API Route Errors
```typescript
export async function POST(request: NextRequest) {
  try {
    // Your logic
    return NextResponse.json({ success: true });
  } catch (error) {
    ErrorHandler.logError(error, { operation: 'my_operation' });
    return createErrorResponse(error as Error);
  }
}
```

### 3. Handle Database Errors
```typescript
const { data, error } = await supabase()
  .from('table')
  .select('*');

if (error) {
  throw ErrorHandler.handleDatabaseError(error, { operation: 'fetch_data' });
}
```

### 4. Use Pre-defined Errors
```typescript
// Validation
throw CommonErrors.invalidEmail(userInput);
throw CommonErrors.missingRequiredField(['email', 'name']);

// Database
throw CommonErrors.recordNotFound('Booking', { id: '123' });
throw CommonErrors.slotNotAvailable('2026-04-06', '10:00');

// Files
throw CommonErrors.fileTooLarge('photo.jpg', '10MB');
throw CommonErrors.invalidFileType(['image/jpeg', 'image/png']);
```

### 5. Add Retry Logic
```typescript
await ErrorHandler.retry(
  () => sendEmail(),
  3,      // max retries
  1000,   // initial delay (ms)
  { operation: 'send_email' }
);
```

### 6. Client-Side Error Handling
```tsx
import { ErrorDisplay, AsyncStateWrapper } from '@/src/components/ErrorDisplay';
import { useAsync } from '@/src/lib/hooks/useAsyncError';

function MyComponent() {
  const { data, error, isLoading, retry } = useAsync();

  return (
    <AsyncStateWrapper
      isLoading={isLoading}
      error={error}
      onRetry={retry}
    >
      {/* Render data */}
    </AsyncStateWrapper>
  );
}
```

## Error Types

| Type | Status Code | Use Case |
|------|-------------|----------|
| `VALIDATION` | 400 | Invalid input, missing fields |
| `AUTHENTICATION` | 401 | Not logged in |
| `AUTHORIZATION` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate record, slot taken |
| `RATE_LIMIT` | 429 | Too many requests |
| `DATABASE` | 500 | Database operation failed |
| `EMAIL` | 500 | Email sending failed |
| `FILE_UPLOAD` | 500 | File upload failed |
| `INTERNAL` | 500 | Unexpected error |

## Common Error Patterns

### Missing Required Fields
```typescript
throw CommonErrors.missingRequiredField(['email', 'name', 'phone']);
```

### Invalid Email/Phone
```typescript
if (!isValidEmail(email)) {
  throw CommonErrors.invalidEmail(email);
}
```

### Database Operation Failed
```typescript
if (dbError) {
  throw ErrorHandler.handleDatabaseError(dbError, {
    operation: 'create_booking',
    table: 'bookings',
  });
}
```

### File Upload Error
```typescript
if (file.size > MAX_SIZE) {
  throw CommonErrors.fileTooLarge(file.name, '10MB');
}
```

### Email with Retry
```typescript
try {
  await ErrorHandler.retry(
    () => resend.emails.send({ /* ... */ }),
    3,
    1000,
    { emailType: 'confirmation' }
  );
} catch (error) {
  // Log but don't fail - booking succeeded
  ErrorHandler.logError(error);
}
```

## Client Components

### ErrorDisplay
```tsx
<ErrorDisplay
  error={error}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
  retryCount={1}
  maxRetries={3}
/>
```

### LoadingState
```tsx
<LoadingState message="Loading bookings..." size="medium" />
```

### AsyncStateWrapper
```tsx
<AsyncStateWrapper
  isLoading={isLoading}
  error={error}
  empty={data.length === 0}
  emptyMessage="No bookings found"
  onRetry={fetchData}
>
  {/* Render data */}
</AsyncStateWrapper>
```

## API Response Format

### Success
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

### Error
```json
{
  "error": "Error message",
  "type": "ERROR_TYPE",
  "context": {
    "operation": "operation_name",
    "additional": "context"
  }
}
```

## Best Practices

✅ **DO:**
- Always log errors with context
- Use specific error types
- Provide recovery options
- Validate input early
- Use retry for transient failures
- Return warnings for non-critical failures

❌ **DON'T:**
- Fail silently
- Expose stack traces in production
- Use generic error messages
- Skip error logging
- Block operations on non-critical failures

## Testing

```typescript
// Test error handling
it('should handle validation errors', async () => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ invalid: 'data' }),
  });

  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.type).toBe('VALIDATION_ERROR');
});
```

## Quick Help

| Problem | Solution |
|---------|----------|
| Database error | `ErrorHandler.handleDatabaseError(error, context)` |
| Validation error | `CommonErrors.invalidEmail(email)` |
| File too large | `CommonErrors.fileTooLarge(name, size)` |
| Email failed | `ErrorHandler.retry(sendEmail, 3, 1000)` |
| Generic error | `ErrorHandler.createError(msg, type, status, context)` |

## Files Reference

- `/src/lib/error-handler.ts` - Core error handling
- `/src/lib/common-errors.ts` - Pre-defined errors
- `/src/lib/api-middleware.ts` - API utilities
- `/src/components/ErrorBoundary.tsx` - React error boundary
- `/src/components/ErrorDisplay.tsx` - UI components
- `/src/lib/hooks/useAsyncError.ts` - React hooks
- `/ERROR_HANDLING.md` - Full documentation
