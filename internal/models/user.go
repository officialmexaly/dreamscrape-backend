package models

import (
	"time"
)

// UserRole represents user roles
type UserRole string

const (
	RoleAdmin     UserRole = "admin"
	RoleSuperAdmin UserRole = "super_admin"
	RoleUser      UserRole = "user"
)

// UserStatus represents user account status
type UserStatus string

const (
	StatusActive   UserStatus = "active"
	StatusInactive UserStatus = "inactive"
	StatusLocked   UserStatus = "locked"
	StatusPending  UserStatus = "pending"
)

// User represents a user in the system
type User struct {
	ID             string                 `json:"id" db:"id"`
	Email          string                 `json:"email" db:"email"`
	PasswordHash   string                 `json:"password_hash" db:"password_hash"`
	Name           string                 `json:"name" db:"name"`
	Role           UserRole               `json:"role" db:"role"`
	EmailVerified  bool                   `json:"email_verified" db:"email_verified"`
	EmailVerificationToken string          `json:"email_verification_token,omitempty" db:"email_verification_token"`
	EmailVerificationExpires *time.Time    `json:"email_verification_expires,omitempty" db:"email_verification_expires"`
	CreatedAt      time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at" db:"updated_at"`
	LastLoginAt    *time.Time             `json:"last_login_at,omitempty" db:"last_login_at"`
	LastLoginIP    *string                `json:"last_login_ip,omitempty" db:"last_login_ip"`
	LastLoginUserAgent *string            `json:"last_login_user_agent,omitempty" db:"last_login_user_agent"`
	FailedLoginAttempts int               `json:"failed_login_attempts" db:"failed_login_attempts"`
	LockedUntil    *time.Time             `json:"locked_until,omitempty" db:"locked_until"`
	PasswordResetToken *string            `json:"password_reset_token,omitempty" db:"password_reset_token"`
	PasswordResetExpires *time.Time       `json:"password_reset_expires,omitempty" db:"password_reset_expires"`
	TwoFactorEnabled bool                 `json:"two_factor_enabled" db:"two_factor_enabled"`
	TwoFactorSecret *string               `json:"two_factor_secret,omitempty" db:"two_factor_secret"`
	TwoFactorBackupCodes []string         `json:"two_factor_backup_codes,omitempty" db:"two_factor_backup_codes"`
	IsActive       bool                  `json:"is_active" db:"is_active"`
	DeletedAt      *time.Time             `json:"deleted_at,omitempty" db:"deleted_at"`
	Metadata       map[string]interface{} `json:"metadata,omitempty" db:"metadata"`
	// Compatibility-only fields for the admin UI. These are derived from Name.
	FirstName      string                `json:"first_name,omitempty" db:"-"`
	LastName       string                `json:"last_name,omitempty" db:"-"`
	Status         UserStatus            `json:"status,omitempty" db:"-"`
	AvatarURL      string                `json:"avatar_url,omitempty" db:"-"`
}

// RefreshToken represents a refresh token for JWT
type RefreshToken struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"user_id" db:"user_id"`
	Token     string    `json:"-" db:"token"` // Hashed token
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	RevokedAt *time.Time `json:"revoked_at,omitempty" db:"revoked_at"`
}

// PasswordResetToken represents a password reset token
type PasswordResetToken struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"user_id" db:"user_id"`
	Token     string    `json:"-" db:"token"` // Hashed token
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
	Used      bool      `json:"used" db:"used"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// EmailVerificationToken represents an email verification token
type EmailVerificationToken struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"user_id" db:"user_id"`
	Token     string    `json:"-" db:"token"` // Hashed token
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
	Used      bool      `json:"used" db:"used"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// LoginRequest represents a login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest represents a registration request
type RegisterRequest struct {
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=8"`
	FirstName       string `json:"first_name" binding:"required"`
	LastName        string `json:"last_name" binding:"required"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

// RefreshTokenRequest represents a refresh token request
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// ForgotPasswordRequest represents a forgot password request
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest represents a reset password request
type ResetPasswordRequest struct {
	Token           string `json:"token" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

// ChangePasswordRequest represents a change password request for authenticated users
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

// AuthResponse represents an authentication response
type AuthResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	User         User      `json:"user"`
}

// IsLocked checks if the user account is locked
func (u *User) IsLocked() bool {
	if u.LockedUntil != nil && u.LockedUntil.After(time.Now()) {
		return true
	}
	if u.Status == StatusLocked {
		return true
	}
	return false
}

// IsActiveAccount checks if the user account is active
func (u *User) IsActiveAccount() bool {
	return u.IsActive && !u.IsLocked()
}
// UpdateUserRequest represents an update user request
type UpdateUserRequest struct {
	Name      *string   `json:"name"`
	FirstName *string   `json:"first_name"`
	LastName  *string   `json:"last_name"`
	Email     *string   `json:"email"`
	Role      *UserRole `json:"role"`
	IsActive  *bool     `json:"is_active"`
	Metadata  map[string]interface{} `json:"metadata"`
	AvatarURL *string   `json:"avatar_url"`
}

// OAuthUserInfo represents OAuth user information
type OAuthUserInfo struct {
	Provider   string `json:"provider"`
	Email      string `json:"email"`
	Name       string `json:"name"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	AvatarURL  string `json:"avatar_url"`
	Verified   bool   `json:"verified"`
}

// GoogleUserInfo represents Google OAuth user info
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

// FacebookUserInfo represents Facebook OAuth user info
type FacebookUserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email,omitempty"`
	Name    string `json:"name"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Picture struct {
		Data struct {
			URL string `json:"url"`
		} `json:"data"`
	} `json:"picture"`
}

// AppleUserInfo represents Apple OAuth user info
type AppleUserInfo struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Verified bool   `json:"email_verified"`
}
