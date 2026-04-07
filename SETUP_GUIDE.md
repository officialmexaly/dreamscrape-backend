# Quick Setup Guide - Dreamscape Auth System

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` in your project root:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth (required)
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Email for password resets (optional)
RESEND_API_KEY=your-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Run Database Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the contents of `database/migrations/001_create_users.sql`
6. Paste into the SQL editor
7. Click "Run"

### 4. Start the Development Server
```bash
npm run dev
```

### 5. Complete Initial Setup

1. Open [http://localhost:3000/admin/setup](http://localhost:3000/admin/setup)
2. Create your admin account
3. You'll be redirected to login

### 6. Log In

Use the credentials you just created to log in at `/admin/login`.

## 🔐 Security Features

Your auth system now includes:

- ✅ **PBKDF2 Password Hashing** - 600,000 iterations (NIST recommended)
- ✅ **Rate Limiting** - Prevents brute force attacks
- ✅ **Account Lockout** - Progressive lockout after failed attempts
- ✅ **Audit Logging** - Complete security event trail
- ✅ **Secure Password Reset** - Token-based with email delivery
- ✅ **Session Management** - HTTP-only cookies, 30-day expiration

## 📊 Default Configuration

### Password Requirements
- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limits
- Login: 5 attempts per 5 minutes
- Password reset: 3 attempts per hour
- User creation: 10 attempts per day

### Account Lockout
- 5 failed attempts: 15 minutes
- 6 failed attempts: 30 minutes
- 7+ failed attempts: Up to 24 hours

## 🎯 Next Steps

### Add More Users
1. Log in as admin
2. Go to `/admin/users`
3. Click "Add User"
4. Fill in user details

### View Audit Logs
Audit logs are automatically created for:
- All login attempts (success/failure)
- Password changes
- Password resets
- User creation/deletion
- Account lock/unlock

Access logs via database or create an admin UI.

### Configure Email (Optional)
For password reset emails:

1. Get a Resend API key at [resend.com](https://resend.com)
2. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_xxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

## 🛠️ Troubleshooting

### Setup Page Shows "Setup Already Complete"
This means users already exist in the database. Log in with existing credentials or reset via database.

### Login Fails
1. Check user exists in Supabase `users` table
2. Verify `is_active` is true
3. Check if `locked_until` is set (account locked)
4. Review `audit_logs` table for errors

### Rate Limit Issues
```sql
-- Clear rate limits (run in Supabase SQL Editor)
DELETE FROM rate_limits WHERE is_locked = true;
```

### Database Connection Issues
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check Supabase project is active

## 📚 Documentation

- **PRODUCTION_AUTH_GUIDE.md** - Complete production guide
- **AUTH_IMPLEMENTATION_SUMMARY.md** - Implementation overview
- **NEXTAUTH_IMPLEMENTATION.md** - NextAuth-specific docs

## 🔧 Development

### Run Type Check
```bash
npm run typecheck
```

### Run Linter
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

## 🚀 Production Deployment

### Environment Variables for Production

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
AUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://yourdomain.com
AUTH_TRUST_HOST=true

# Email
RESEND_API_KEY=your-production-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Security Checklist

- [ ] Change default admin password
- [ ] Enable HTTPS
- [ ] Set secure cookies (automatic in production)
- [ ] Configure email for password resets
- [ ] Set up database backups
- [ ] Review audit logs regularly
- [ ] Enable 2FA (coming soon)

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Check the server logs
3. Review the audit logs in Supabase
4. Check this guide's troubleshooting section

---

**You're all set!** Your Dreamscape Curated Events application now has enterprise-grade authentication. 🎉
