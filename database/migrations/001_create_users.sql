-- =====================================================
-- DREAMSCAPE CURATED EVENTS - USERS TABLE SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor or via migration tool

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Authentication fields
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  -- Profile information
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),

  -- Email verification
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Login tracking
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_login_ip VARCHAR(45),
  last_login_user_agent TEXT,

  -- Security: Failed login attempts
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,

  -- Password reset
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP WITH TIME ZONE,

  -- Two-factor authentication
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  two_factor_backup_codes TEXT[], -- Encrypted JSON array of backup codes

  -- Account status
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event details
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL, -- 'auth', 'user_management', 'security'

  -- User who performed the action (nullable for system events)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),

  -- Target user (if different from actor)
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_user_email VARCHAR(255),

  -- Request information
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_method VARCHAR(10),
  request_path VARCHAR(500),

  -- Event data
  event_data JSONB DEFAULT '{}'::jsonb,

  -- Status
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_category ON audit_logs(event_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Create rate limiting table (for in-memory fallback or persistence)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identifier (IP address or user ID)
  identifier VARCHAR(255) NOT NULL,
  identifier_type VARCHAR(20) NOT NULL CHECK (identifier_type IN ('ip', 'user_id', 'email')),

  -- Request type (e.g., 'login', 'password_reset')
  request_type VARCHAR(100) NOT NULL,

  -- Count and window
  attempt_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Lockout
  is_locked BOOLEAN DEFAULT FALSE,
  locked_until TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(identifier, identifier_type, request_type)
);

-- Create rate limit indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_request_type ON rate_limits(request_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_is_locked ON rate_limits(is_locked);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- Create sessions table for enhanced session management
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User reference
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session token (hashed)
  session_token VARCHAR(255) UNIQUE NOT NULL,

  -- Session data
  user_data JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Session management
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP WITH TIME ZONE,

  -- Device/browser info
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_fingerprint VARCHAR(255)
);

-- Create sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_revoked ON sessions(is_revoked);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rate_limits_updated_at ON rate_limits;
CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired rate limit records
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour'
    AND is_locked = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions
  WHERE expires_at < NOW()
    OR (is_revoked = TRUE AND revoked_at < NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audit logs RLS (read-only for admins)
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create view for active users
CREATE OR REPLACE VIEW active_users AS
SELECT *
FROM users
WHERE is_active = TRUE
  AND deleted_at IS NULL;

-- Create view for recent security events
CREATE OR REPLACE VIEW recent_security_events AS
SELECT *
FROM audit_logs
WHERE event_category = 'security'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Create view for locked users
CREATE OR REPLACE VIEW locked_users AS
SELECT
  id,
  email,
  name,
  role,
  failed_login_attempts,
  locked_until
FROM users
WHERE locked_until IS NOT NULL
  AND locked_until > NOW()
  AND is_active = TRUE
  AND deleted_at IS NULL;

COMMENT ON TABLE users IS 'User accounts for Dreamscape Curated Events admin system';
COMMENT ON TABLE audit_logs IS 'Audit trail for security and compliance';
COMMENT ON TABLE rate_limits IS 'Rate limiting for authentication endpoints';
COMMENT ON TABLE sessions IS 'Enhanced session management';

-- Add helpful comments
COMMENT ON COLUMN users.password_hash IS 'PBKDF2 hash of user password (600k iterations)';
COMMENT ON COLUMN users.failed_login_attempts IS 'Counter for consecutive failed login attempts';
COMMENT ON COLUMN users.locked_until IS 'Timestamp until which account is locked';
COMMENT ON COLUMN users.two_factor_secret IS 'Encrypted TOTP secret for 2FA';
COMMENT ON COLUMN audit_logs.event_type IS 'Type of event (e.g., login, password_change, user_created)';
COMMENT ON COLUMN audit_logs.event_data IS 'Additional event metadata in JSON format';

-- Note: No default admin user is created by this script.
-- Please visit /admin/setup to create your first admin account.
