# Error Handling Documentation

This document outlines the comprehensive error handling strategy implemented across the Dreamscape Curated Events application.

## Table of Contents

1. [Overview](#overview)
2. [Error Types](#error-types)
3. [Server-Side Error Handling](#server-side-error-handling)
4. [Client-Side Error Handling](#client-side-error-handling)
5. [API Error Responses](#api-error-responses)
6. [Best Practices](#best-practices)

## Overview

The application implements a layered error handling approach:

- **Utility Layer**: Centralized error handling logic (`src/lib/error-handler.ts`)
- **API Layer**: Consistent error responses across all routes
- **Database Layer**: Specific handling for Supabase errors
- **Client Layer**: User-friendly error display and recovery options

## Error Types

The application uses standardized error types defined in `src/lib/error-handler.ts`:

```typescript
enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',      // 400
  DATABASE = 'DATABASE_ERROR',          // 500
  EMAIL = 'EMAIL_ERROR',                // 500
  FILE_UPLOAD = 'FILE_UPLOAD_ERROR',    // 500
  AUTHENTICATION = 'AUTHENTICATION_ERROR', // 401
  AUTHORIZATION = 'AUTHORIZATION_ERROR',  // 403
  RATE_LIMIT = 'RATE_LIMIT_ERROR',      // 429
  NOT_FOUND = 'NOT_FOUND',              // 404
  CONFLICT = 'CONFLICT',                // 409
  INTERNAL = 'INTERNAL_ERROR',          // 500
}
```

## Server-Side Error Handling

### API Routes

All API routes should use the error handling utilities:

```typescript
import { ErrorHandler, ErrorType, createErrorResponse } from '@/src/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    // Your logic here
    const result = await someOperation();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const appError = error instanceof Error
      ? error
      : ErrorHandler.createError('Operation failed', ErrorType.INTERNAL, 500);

    ErrorHandler.logError(appError, { operation: 'my_operation' });
    return createErrorResponse(appError);
  }
}
```

### Database Operations

Use specific database error handling:

```typescript
const { data, error } = await supabase()
  .from('table')
  .select('*');

if (error) {
  throw ErrorHandler.handleDatabaseError(error, {
    operation: 'fetch_data',
    table: 'table',
  });
}
```

### Email Sending

Implement retry logic for email operations:

```typescript
const emailResult = await sendEmailWithRetry(
  async () => {
    const resend = getResendClient();
    return await resend.emails.send({ /* ... */ });
  },
  3, // max retries
  { recipient: 'user@example.com', emailType: 'confirmation' }
);

if (!emailResult.success) {
  console.error('Email failed after retries:', emailResult.error);
  // Continue anyway - don't fail the operation
}
```

### File Uploads

Validate files before upload:

```typescript
// File size validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_FILE_SIZE) {
  throw ErrorHandler.createError(
    `File exceeds maximum size of 10MB`,
    ErrorType.VALIDATION,
    400,
    { fileName: file.name, fileSize: file.size }
  );
}

// Use the uploadFile utility
const { data, error } = await uploadFile(file, 'bucket-name', 'optional-path');
if (error) {
  throw ErrorHandler.handleFileUploadError(error, file.name);
}
```

## Client-Side Error Handling

### Error Boundaries

The root layout includes an ErrorBoundary to catch React component errors:

```tsx
<ErrorBoundary>
  <MainLayoutWrapper>{children}</MainLayoutWrapper>
</ErrorBoundary>
```

### Async Operations

Use the `useAsync` hook for async operations:

```tsx
import { useAsync } from '@/src/lib/hooks/useAsyncError';

function MyComponent() {
  const { data, error, isLoading, execute, retry } = useAsync();

  const fetchData = () => {
    execute(async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorDisplay error={error} onRetry={retry} />;

  return <div>{/* render data */}</div>;
}
```

### Error Display

Use the `ErrorDisplay` component for user-friendly error messages:

```tsx
<ErrorDisplay
  error={error}
  onRetry={handleRetry}
  retryCount={retryCount}
  maxRetries={3}
/>
```

### Async State Wrapper

Use the `AsyncStateWrapper` for complete async state management:

```tsx
<AsyncStateWrapper
  isLoading={isLoading}
  error={error}
  empty={!data || data.length === 0}
  emptyMessage="No items found"
  onRetry={fetchData}
>
  {/* Render data */}
</AsyncStateWrapper>
```

## API Error Responses

All API errors follow a consistent format:

```json
{
  "error": "Error message",
  "type": "ERROR_TYPE",
  "context": {
    "additional": "context information"
  }
}
```

### HTTP Status Codes

- `400` - Validation errors
- `401` - Authentication errors
- `403` - Authorization errors
- `404` - Resource not found
- `409` - Conflicts (e.g., duplicate records)
- `429` - Rate limit exceeded
- `500` - Internal server errors

### Example Error Responses

```json
// Validation Error
{
  "error": "Missing required fields: email, name",
  "type": "VALIDATION_ERROR",
  "context": {
    "missingFields": ["email", "name"],
    "providedFields": ["phone"]
  }
}

// Database Error
{
  "error": "Database operation failed",
  "type": "DATABASE_ERROR",
  "context": {
    "operation": "create_booking",
    "originalError": "duplicate key value violates unique constraint"
  }
}

// Conflict Error
{
  "error": "This time slot is no longer available. Please choose another time.",
  "type": "CONFLICT",
  "context": {
    "date": "2026-04-06",
    "time": "10:00"
  }
}
```

## Best Practices

### 1. Always Log Errors

```typescript
ErrorHandler.logError(error, {
  operation: 'operation_name',
  userId: 'user_id',
  additionalContext: 'value',
});
```

### 2. Provide Context

Include relevant context when creating errors:

```typescript
throw ErrorHandler.createError(
  'Operation failed',
  ErrorType.DATABASE,
  500,
  {
    operation: 'create_booking',
    userId: user.id,
    bookingData: booking,
  }
);
```

### 3. Don't Fail silently

Always handle errors explicitly:

```typescript
// Bad
try {
  await sendEmail();
} catch (error) {
  // Silent failure
}

// Good
try {
  await sendEmail();
} catch (error) {
  const emailError = ErrorHandler.handleEmailError(error, recipient);
  ErrorHandler.logError(emailError);
  // Optionally: notify user, retry, or continue with warning
}
```

### 4. Use Retry Logic

For transient failures (email, external APIs):

```typescript
await ErrorHandler.retry(
  () => externalApiCall(),
  3, // max retries
  1000, // initial delay
  { operation: 'external_api_call' }
);
```

### 5. Validate Input Early

Validate and sanitize inputs at the API boundary:

```typescript
const validationResult = schema.safeParse(body);
if (!validationResult.success) {
  throw ErrorHandler.handleValidationError(
    validationResult.error.issues,
    { requestBody: body }
  );
}
```

### 6. Graceful Degradation

When non-critical operations fail:

```typescript
// Email failures shouldn't prevent booking creation
try {
  await sendConfirmationEmail();
} catch (error) {
  ErrorHandler.logError(error);
  // Return success with warning
  return NextResponse.json({
    success: true,
    warnings: ['Confirmation email failed to send'],
  });
}
```

### 7. User-Friendly Messages

Technical errors should be logged, but users get friendly messages:

```typescript
// Server: Log technical details
ErrorHandler.logError(technicalError);

// Client: Show user-friendly message
return NextResponse.json({
  error: 'Unable to complete your request. Please try again.',
});
```

### 8. Environment-Specific Behavior

```typescript
if (process.env.NODE_ENV === 'development') {
  // Include stack traces in development
  return createErrorResponse(error, true);
} else {
  // Minimal error info in production
  return createErrorResponse(error, false);
}
```

## Testing Error Handling

### Test Error Cases

```typescript
describe('API Error Handling', () => {
  it('should handle validation errors', async () => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.type).toBe('VALIDATION_ERROR');
  });

  it('should handle database errors', async () => {
    // Mock database failure
    const response = await fetch('/api/bookings');

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.type).toBe('DATABASE_ERROR');
  });
});
```

## Monitoring and Alerting

Consider implementing:

1. **Error tracking**: Sentry, LogRocket, or similar
2. **Logging service**: CloudWatch, Loggly, or Datadog
3. **Alerts**: For critical errors (database down, email service failures)

```typescript
// Example: Integration with error tracking
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error);
}
```

## Summary

This error handling system provides:

- **Consistency**: Standardized error types and responses
- **Debuggability**: Comprehensive error logging with context
- **User Experience**: Friendly error messages and recovery options
- **Resilience**: Retry logic and graceful degradation
- **Maintainability**: Centralized error handling logic

For questions or improvements, please refer to the implementation in:
- `/src/lib/error-handler.ts` - Core error handling utilities
- `/src/lib/api-middleware.ts` - API middleware
- `/src/components/ErrorBoundary.tsx` - React error boundary
- `/src/components/ErrorDisplay.tsx` - UI error components
