-- =====================================================
-- CLEANUP: Remove existing admin user
-- =====================================================
-- Run this in Supabase SQL Editor to remove the existing
-- admin user so you can create a new one via /admin/setup

-- First, let's see what users exist
SELECT id, email, name, role, is_active, created_at
FROM users
WHERE deleted_at IS NULL;

-- If you see the admin@dreamscapeevents.com user, run this to delete it:
DELETE FROM users
WHERE email = 'admin@dreamscapeevents.com';

-- Or delete ALL users (clean slate):
-- DELETE FROM users WHERE deleted_at IS NULL;

-- Verify deletion
SELECT COUNT(*) as user_count
FROM users
WHERE deleted_at IS NULL;

-- Expected result: user_count should be 0
