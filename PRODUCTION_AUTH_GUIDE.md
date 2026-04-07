# Production-Ready Authentication System

## Overview

This is a comprehensive, production-ready authentication system with enterprise-grade security features.

## Features

### Security Features
- ✅ **Bcrypt Password Hashing** - 12 rounds with automatic rehashing
- ✅ **Password Complexity Requirements** - Enforced at creation and change
- ✅ **Rate Limiting** - Prevents brute force attacks
- ✅ **Account Lockout** - Progressive lockout after failed attempts
- ✅ **Audit Logging** - Complete security event trail
- ✅ **Secure Password Reset** - Token-based with email delivery
- ✅ **Session Management** - Secure JWT sessions with HTTP-only cookies
- ✅ **SQL Injection Protection** - Parameterized queries via Supabase
- ✅ **XSS Prevention** - Proper input sanitization
- ✅ **CSRF Protection** - Built into NextAuth

### User Management
- ✅ Create, update, delete users
- ✅ Role-based access control (admin, super_admin)
- ✅ Account lock/unlock functionality
- ✅ Password reset by admin
- ✅ Failed login attempt tracking
- ✅ Last login tracking

### Compliance
- ✅ GDPR-compliant audit logging
- ✅ Data retention policies
- ✅ Right to deletion (soft delete)
- ✅ Password security requirements

## Installation

### 1. Run Database Migration

```bash
# In Supabase SQL Editor, run:
psql -h db.your-project.supabase.co -U postgres -f database/migrations/001_create_users.sql
```

Or copy the contents of `database/migrations/001_create_users.sql` into Supabase SQL Editor.

### 2. Install Dependencies

```bash
npm install bcrypt @types/bcrypt
```

### 3. Configure Environment Variables

Add to your `.env.local`:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-key

# NextAuth
AUTH_SECRET=your-secret  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Email (for password resets)
RESEND_API_KEY=your-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Default Admin User

After migration, a default admin user is created:
- **Email:** admin@dreamscapeevents.com
- **Password:** Admin123!
- **⚠️ IMPORTANT:** Change this immediately after first login!

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### User Management (Admin)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users/[id]` - Get user by ID
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `POST /api/admin/users/[id]/lock` - Lock account
- `DELETE /api/admin/users/[id]/lock` - Unlock account

### Password Reset
- `POST /api/admin/password-reset` - Request reset
- `POST /api/admin/password-reset/complete` - Complete reset

### Audit Logs
- `GET /api/admin/audit-logs` - View audit logs
- `GET /api/admin/audit-logs/security` - Security events

## Usage Examples

### Client-Side Authentication

```typescript
'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

export function LoginForm() {
  const { data: session, status } = useSession()

  const handleLogin = async () => {
    const result = await signIn('credentials', {
      email: 'admin@example.com',
      password: 'password',
      redirect: false,
    })

    if (result?.error) {
      console.error('Login failed:', result.error)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  // ...
}
```

### Server-Side Authentication

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    redirect('/admin/login')
  }

  return <div>Welcome, {session.user.name}</div>
}
```

### Creating a User

```typescript
import { createUser } from '@/src/lib/user-service'

const result = await createUser({
  email: 'newuser@example.com',
  password: 'SecurePass123!',
  name: 'John Doe',
  role: 'admin',
  createdBy: 'admin-user-id',
})
```

### Resetting User Password

```typescript
import { adminResetUserPassword } from '@/src/lib/password-reset'

const result = await adminResetUserPassword(
  'user-id',
  'admin@example.com'
)

if (result.success && result.tempPassword) {
  // Send tempPassword to user via secure channel
}
```

## Security Configuration

### Password Requirements

- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common patterns

### Rate Limits

| Endpoint | Limit | Window | Lockout |
|----------|-------|--------|---------|
| Login | 5 attempts | 5 minutes | 15 minutes |
| Password Reset | 3 attempts | 1 hour | 1 hour |
| User Creation | 10 attempts | 24 hours | 1 hour |
| API Requests | 100 requests | 1 minute | 1 minute |

### Account Lockout

- **5 failed attempts:** 15 minutes
- **6 failed attempts:** 30 minutes
- **7+ failed attempts:** Progressive (up to 24 hours)

## Audit Logging

All security events are logged:

- Login (success/failure)
- Logout
- Password changes
- Password resets
- User creation/deletion
- Account lock/unlock
- Suspicious activity

### Viewing Audit Logs

```typescript
import { getUserAuditLogs, getRecentSecurityEvents } from '@/src/lib/audit-log'

// Get user's audit history
const logs = await getUserAuditLogs('user-id', 100)

// Get recent security events
const securityEvents = await getRecentSecurityEvents(24, 50)
```

## Monitoring & Alerts

### Health Checks

Check these regularly:

```typescript
// Check for locked accounts
SELECT * FROM locked_users;

// Check recent failed logins
SELECT * FROM audit_logs
WHERE event_type = 'login_failed'
AND created_at > NOW() - INTERVAL '1 hour';

// Check rate limit violations
SELECT * FROM audit_logs
WHERE event_type = 'rate_limit_exceeded'
AND created_at > NOW() - INTERVAL '24 hours';
```

### Suspicious Activity Detection

```typescript
import { checkSuspiciousActivity } from '@/src/lib/audit-log'

const { isSuspicious, reasons, details } =
  await checkSuspiciousActivity('user@example.com')

if (isSuspicious) {
  // Alert admin, lock account, etc.
  console.log('Suspicious activity detected:', reasons)
  console.log('Details:', details)
}
```

## Maintenance

### Scheduled Tasks

Run these periodically (cron job):

```bash
# Clean up expired rate limits (daily)
curl -X POST https://your-app.com/api/cron/cleanup-rate-limits

# Clean up old audit logs (weekly)
curl -X POST https://your-app.com/api/cron/cleanup-audit-logs

# Clean up expired reset tokens (daily)
curl -X POST https://your-app.com/api/cron/cleanup-reset-tokens
```

### Data Retention

- **Audit logs:** 90 days (configurable)
- **Rate limits:** 1 hour
- **Reset tokens:** 1 hour
- **Sessions:** 30 days

## Troubleshooting

### Login Fails

1. Check user exists: `SELECT * FROM users WHERE email = 'user@example.com'`
2. Check account is active: `SELECT is_active FROM users WHERE email = '...'`
3. Check if locked: `SELECT locked_until FROM users WHERE email = '...'`
4. Check failed attempts: `SELECT failed_login_attempts FROM users WHERE email = '...'`

### Rate Limit Issues

```sql
-- Check rate limits for IP
SELECT * FROM rate_limits
WHERE identifier = 'ip:1.2.3.4'
AND is_locked = true;

-- Clear rate limit (admin only)
DELETE FROM rate_limits
WHERE identifier = 'ip:1.2.3.4';
```

### Password Reset Not Working

1. Check Resend API key is valid
2. Check email in spam folder
3. Verify token hasn't expired (1 hour)
4. Check audit logs for errors

## Best Practices

### For Developers

1. **Never** log passwords or tokens
2. **Always** use parameterized queries (Supabase handles this)
3. **Always** validate input on both client and server
4. **Use** `requireAdminUser()` for protected routes
5. **Log** all security-relevant events
6. **Never** expose detailed error messages to users

### For Administrators

1. **Change** default admin password immediately
2. **Use** strong, unique passwords
3. **Enable** 2FA when available (coming soon)
4. **Review** audit logs regularly
5. **Monitor** for suspicious activity
6. **Lock** inactive accounts after 90 days
7. **Require** password changes every 90 days

## Migration from Old Auth

If migrating from the previous auth system:

1. **Run migration script** to create users table
2. **Import existing users** using a script
3. **Update environment variables**
4. **Test login flow** with existing users
5. **Update any custom auth code** to use new utilities
6. **Remove old auth files** after verification

## Support & Contributing

For issues or questions:
- Check audit logs first
- Review this documentation
- Check browser console for errors
- Check server logs for errors

## License

This authentication system is part of the Dreamscape Curated Events project.
