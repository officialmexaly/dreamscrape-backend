package services

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/models"
	"dreamscape-backend/pkg/config"
)

// AuthService handles authentication operations
type AuthService struct {
	useSupabase bool
}

// NewAuthService creates a new authentication service
func NewAuthService() *AuthService {
	return &AuthService{useSupabase: true}
}

func (s *AuthService) ensureDB() error {
	if s == nil {
		return errors.New("authentication service unavailable")
	}
	if s.useSupabase && database.GetClient() == nil {
		return errors.New("authentication database unavailable")
	}
	return nil
}

// JWTClaims represents JWT claims
type JWTClaims struct {
	UserID string          `json:"user_id"`
	Email  string          `json:"email"`
	Role   models.UserRole `json:"role"`
	jwt.RegisteredClaims
}

// TokenPair represents access and refresh tokens
type TokenPair struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

// HashPassword hashes a password using bcrypt
func (s *AuthService) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hash), nil
}

// VerifyPassword verifies a password against a hash
func (s *AuthService) VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// GenerateTokenPair generates access and refresh tokens
func (s *AuthService) GenerateTokenPair(user *models.User) (*TokenPair, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	// Generate access token
	expiresAt := time.Now().Add(config.AppConfig.AccessTokenDuration)
	claims := JWTClaims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString([]byte(config.AppConfig.JWTSecret))
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate refresh token
	refreshToken, err := s.generateSecureToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Store refresh token in Supabase (optional - don't fail if table doesn't exist)
	hashedRefreshToken, err := s.HashPassword(refreshToken)
	if err != nil {
		log.Printf("Warning: failed to hash refresh token: %v", err)
	}

	refreshRecord := map[string]interface{}{
		"id":         uuid.NewString(),
		"user_id":    user.ID,
		"token":      hashedRefreshToken,
		"expires_at": time.Now().Add(config.AppConfig.RefreshTokenDuration),
		"created_at": time.Now(),
	}
	if _, err := database.GetClient().Insert("refresh_tokens", refreshRecord); err != nil {
		log.Printf("Warning: failed to store refresh token in database: %v", err)
		// Continue anyway - the token will still work, just won't be stored for revocation
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
	}, nil
}

// ValidateAccessToken validates an access token
func (s *AuthService) ValidateAccessToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(config.AppConfig.JWTSecret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// RefreshAccessToken refreshes an access token using a refresh token
func (s *AuthService) RefreshAccessToken(refreshToken string) (*TokenPair, string, error) {
	if err := s.ensureDB(); err != nil {
		return nil, "", err
	}

	tokens, err := database.GetClient().Select("refresh_tokens", map[string]string{
		"revoked_at": "is.null",
		"order":      "created_at.desc",
		"select":     "*",
	})
	if err != nil {
		return nil, "", fmt.Errorf("refresh token not found: %w", err)
	}
	if len(tokens) == 0 {
		return nil, "", fmt.Errorf("refresh token not found")
	}

	var tokenRow map[string]interface{}
	for _, row := range tokens {
		hashedToken, _ := row["token"].(string)
		if hashedToken == "" {
			continue
		}
		if err := s.VerifyPassword(hashedToken, refreshToken); err != nil {
			continue
		}
		tokenRow = row
		break
	}
	if tokenRow == nil {
		return nil, "", errors.New("invalid refresh token")
	}

	userID, _ := tokenRow["user_id"].(string)
	hashedToken, _ := tokenRow["token"].(string)
	expiresAt, err := parseTimeValue(tokenRow["expires_at"])
	if err != nil {
		return nil, "", fmt.Errorf("invalid refresh token expiry: %w", err)
	}

	// Check if token is expired
	if time.Now().After(expiresAt) {
		return nil, "", errors.New("refresh token expired")
	}

	// Verify refresh token
	if err := s.VerifyPassword(hashedToken, refreshToken); err != nil {
		return nil, "", errors.New("invalid refresh token")
	}

	// Get user
	user, err := s.GetUserByID(userID)
	if err != nil {
		return nil, "", fmt.Errorf("user not found: %w", err)
	}

	// Check if user is active
	if !user.IsActiveAccount() {
		return nil, "", errors.New("user account is not active")
	}

	// Generate new token pair
		tokenPair, err := s.GenerateTokenPair(user)
	if err != nil {
		return nil, "", err
	}

	// Revoke old refresh token
	if _, err := database.GetClient().UpdateWhere("refresh_tokens",
		map[string]string{"user_id": "eq." + userID, "token": "eq." + hashedToken},
		map[string]interface{}{"revoked_at": time.Now()}); err != nil {
		return nil, "", fmt.Errorf("failed to revoke old refresh token: %w", err)
	}

	return tokenPair, userID, nil
}

// RevokeRefreshToken revokes a refresh token
func (s *AuthService) RevokeRefreshToken(userID string) error {
	if err := s.ensureDB(); err != nil {
		return err
	}

	_, err := database.GetClient().UpdateWhere(
		"refresh_tokens",
		map[string]string{"user_id": "eq." + userID, "revoked_at": "is.null"},
		map[string]interface{}{"revoked_at": time.Now()},
	)
	if err != nil {
		return fmt.Errorf("failed to revoke refresh tokens: %w", err)
	}
	return nil
}

// Register registers a new user using Supabase REST API
func (s *AuthService) Register(req *models.RegisterRequest) (*models.User, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	// Check if passwords match
	if req.Password != req.ConfirmPassword {
		return nil, errors.New("passwords do not match")
	}

	// Check if user already exists
	filters := map[string]string{"email": "eq." + req.Email}
	existingUsers, err := database.GetClient().Select("users", filters)
	if err != nil {
		return nil, fmt.Errorf("failed to check user existence: %w", err)
	}
	if len(existingUsers) > 0 {
		return nil, errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := s.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user data
	name := strings.TrimSpace(req.FirstName + " " + req.LastName)
	newUser := map[string]interface{}{
		"id":             uuid.NewString(),
		"email":           req.Email,
		"password_hash":   hashedPassword,
		"name":            name,
		"role":            string(models.RoleUser),
		"email_verified":  false,
		"is_active":       true,
	}

	// Insert user using Supabase
	insertedUser, err := database.GetClient().Insert("users", newUser)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Parse response
	user := &models.User{}
	userJSON, _ := json.Marshal(insertedUser)
	if err := json.Unmarshal(userJSON, user); err != nil {
		return nil, fmt.Errorf("failed to parse user data: %w", err)
	}

	return user, nil
}

// Login authenticates a user using Supabase REST API
func (s *AuthService) Login(req *models.LoginRequest) (*models.User, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	// Get user by email using Supabase
	filters := map[string]string{"email": "eq." + req.Email}
	users, err := database.GetClient().Select("users", filters)
	if err != nil {
		log.Printf("❌ Failed to fetch user: %v", err)
		return nil, fmt.Errorf("failed to fetch user: %w", err)
	}
	if len(users) == 0 {
		log.Printf("❌ No user found with email: %s", req.Email)
		return nil, errors.New("invalid credentials")
	}

	log.Printf("✅ Found user: %v", users[0])

	// Parse user data
	userData := users[0]
	user := &models.User{}
	userJSON, _ := json.Marshal(userData)
	if err := json.Unmarshal(userJSON, user); err != nil {
		log.Printf("❌ Failed to parse user data: %v", err)
		return nil, fmt.Errorf("failed to parse user data: %w", err)
	}

	// Set computed status based on is_active field
	if user.IsActive {
		user.Status = models.StatusActive
	} else {
		user.Status = models.StatusInactive
	}

	// Parse name into first_name/last_name for backward compatibility
	if user.Name != "" && (user.FirstName == "" && user.LastName == "") {
		// Simple split by space for first/last name
		words := []string{}
		current := ""
		for _, char := range user.Name {
			if char == ' ' {
				if current != "" {
					words = append(words, current)
					current = ""
				}
			} else {
				current += string(char)
			}
		}
		if current != "" {
			words = append(words, current)
		}

		if len(words) > 0 {
			user.FirstName = words[0]
			if len(words) > 1 {
				user.LastName = user.Name[len(user.FirstName):]
				for len(user.LastName) > 0 && user.LastName[0] == ' ' {
					user.LastName = user.LastName[1:]
				}
			}
		}
	}

	log.Printf("✅ Parsed user: Email=%s, Role=%s, IsActive=%v, Status=%s", user.Email, user.Role, user.IsActive, user.Status)
	log.Printf("🔐 Password hash: %s", user.PasswordHash)

	// Check if user is locked
	if user.IsLocked() {
		log.Printf("❌ User account is locked")
		return nil, errors.New("account is locked")
	}

	// Check if user is active (using is_active field)
	if !user.IsActiveAccount() {
		log.Printf("❌ User is not active: is_active=%v, status=%s", user.IsActive, user.Status)
		return nil, errors.New("account is not active")
	}

	// Verify password
	log.Printf("🔍 Verifying password...")
	if err := s.VerifyPassword(user.PasswordHash, req.Password); err != nil {
		log.Printf("❌ Password verification failed: %v", err)
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

// GetUserByID retrieves a user by ID using Supabase REST API
func (s *AuthService) GetUserByID(userID string) (*models.User, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	// Use Supabase REST API
	filters := map[string]string{"id": "eq." + userID}
	users, err := database.GetClient().Select("users", filters)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user: %w", err)
	}
	if len(users) == 0 {
		return nil, fmt.Errorf("user not found")
	}

	// Parse user data
	user := &models.User{}
	userJSON, _ := json.Marshal(users[0])
	if err := json.Unmarshal(userJSON, user); err != nil {
		return nil, fmt.Errorf("failed to parse user data: %w", err)
	}

	return user, nil
}

// CreatePasswordResetToken creates a password reset token
func (s *AuthService) CreatePasswordResetToken(email string) (string, error) {
	if err := s.ensureDB(); err != nil {
		return "", err
	}

	users, err := database.GetClient().Select("users", map[string]string{"email": "eq." + email, "limit": "1"})
	if err != nil {
		return "", fmt.Errorf("user not found: %w", err)
	}
	if len(users) == 0 {
		return "", fmt.Errorf("user not found")
	}

	userID, _ := users[0]["id"].(string)

	// Generate secure token
	token, err := s.generateSecureToken()
	if err != nil {
		return "", err
	}

	// Hash token
	hashedToken, err := s.HashPassword(token)
	if err != nil {
		return "", err
	}

	// Store token in Supabase
	record := map[string]interface{}{
		"id":         uuid.NewString(),
		"user_id":    userID,
		"token":      hashedToken,
		"expires_at": time.Now().Add(1 * time.Hour),
		"used":       false,
		"created_at": time.Now(),
	}
	if _, err := database.GetClient().Insert("password_reset_tokens", record); err != nil {
		return "", fmt.Errorf("failed to store password reset token: %w", err)
	}

	return token, nil
}

// ValidatePasswordResetToken validates a password reset token
func (s *AuthService) ValidatePasswordResetToken(token string) (string, string, error) {
	if err := s.ensureDB(); err != nil {
		return "", "", err
	}

	tokens, err := database.GetClient().Select("password_reset_tokens", map[string]string{
		"used":  "eq.false",
		"order": "created_at.desc",
		"select": "*",
	})
	if err != nil {
		return "", "", fmt.Errorf("token not found: %w", err)
	}
	if len(tokens) == 0 {
		return "", "", fmt.Errorf("token not found")
	}

	var row map[string]interface{}
	for _, candidate := range tokens {
		hashedToken, _ := candidate["token"].(string)
		if hashedToken == "" {
			continue
		}
		if err := s.VerifyPassword(hashedToken, token); err != nil {
			continue
		}
		row = candidate
		break
	}
	if row == nil {
		return "", "", errors.New("invalid token")
	}

	userID, _ := row["user_id"].(string)
	tokenID, _ := row["id"].(string)
	hashedToken, _ := row["token"].(string)
	expiresAt, err := parseTimeValue(row["expires_at"])
	if err != nil {
		return "", "", fmt.Errorf("invalid token expiry: %w", err)
	}

	// Check if token is expired
	if time.Now().After(expiresAt) {
		return "", "", errors.New("token expired")
	}

	// Verify token
	if err := s.VerifyPassword(hashedToken, token); err != nil {
		return "", "", errors.New("invalid token")
	}

	return userID, tokenID, nil
}

// ResetPassword resets a user's password
func (s *AuthService) ResetPassword(token, newPassword string) error {
	if err := s.ensureDB(); err != nil {
		return err
	}

	// Validate token and get user ID
	userID, tokenID, err := s.ValidatePasswordResetToken(token)
	if err != nil {
		return err
	}

	// Hash new password
	hashedPassword, err := s.HashPassword(newPassword)
	if err != nil {
		return err
	}

	if _, err := database.GetClient().UpdateByID("users", userID, map[string]interface{}{
		"password_hash": hashedPassword,
		"updated_at":    time.Now(),
	}); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Mark token as used
	if _, err := database.GetClient().UpdateByID("password_reset_tokens", tokenID, map[string]interface{}{"used": true}); err != nil {
		return fmt.Errorf("failed to mark token as used: %w", err)
	}

	return nil
}

// ChangePassword changes a user's password (for authenticated users)
func (s *AuthService) ChangePassword(userID string, currentPassword, newPassword string) error {
	if err := s.ensureDB(); err != nil {
		return err
	}

	// Get user by ID using Supabase
	filters := map[string]string{"id": "eq." + userID}
	users, err := database.GetClient().Select("users", filters)
	if err != nil {
		return fmt.Errorf("failed to fetch user: %w", err)
	}
	if len(users) == 0 {
		return errors.New("user not found")
	}

	// Parse user data
	user := &models.User{}
	userJSON, _ := json.Marshal(users[0])
	if err := json.Unmarshal(userJSON, user); err != nil {
		return fmt.Errorf("failed to parse user data: %w", err)
	}

	// Verify current password
	if err := s.VerifyPassword(user.PasswordHash, currentPassword); err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := s.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	if _, err := database.GetClient().UpdateByID("users", userID, map[string]interface{}{
		"password_hash": hashedPassword,
		"updated_at":    time.Now(),
	}); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

// CreateEmailVerificationToken creates an email verification token
func (s *AuthService) CreateEmailVerificationToken(userID string) (string, error) {
	if err := s.ensureDB(); err != nil {
		return "", err
	}

	// Generate secure token
	token, err := s.generateSecureToken()
	if err != nil {
		return "", err
	}

	// Hash token
	hashedToken, err := s.HashPassword(token)
	if err != nil {
		return "", err
	}

	record := map[string]interface{}{
		"id":         uuid.NewString(),
		"user_id":    userID,
		"token":      hashedToken,
		"expires_at": time.Now().Add(24 * time.Hour),
		"used":       false,
		"created_at": time.Now(),
	}
	if _, err := database.GetClient().Insert("email_verification_tokens", record); err != nil {
		return "", fmt.Errorf("failed to store email verification token: %w", err)
	}

	return token, nil
}

// VerifyEmail verifies a user's email
func (s *AuthService) VerifyEmail(token string) error {
	if err := s.ensureDB(); err != nil {
		return err
	}

	tokens, err := database.GetClient().Select("email_verification_tokens", map[string]string{
		"used":  "eq.false",
		"order": "created_at.desc",
		"select": "*",
	})
	if err != nil {
		return fmt.Errorf("token not found: %w", err)
	}
	if len(tokens) == 0 {
		return fmt.Errorf("token not found")
	}

	var row map[string]interface{}
	for _, candidate := range tokens {
		hashedToken, _ := candidate["token"].(string)
		if hashedToken == "" {
			continue
		}
		if err := s.VerifyPassword(hashedToken, token); err != nil {
			continue
		}
		row = candidate
		break
	}
	if row == nil {
		return errors.New("invalid token")
	}

	userID, _ := row["user_id"].(string)
	tokenID, _ := row["id"].(string)
	hashedToken, _ := row["token"].(string)
	expiresAt, err := parseTimeValue(row["expires_at"])
	if err != nil {
		return fmt.Errorf("invalid token expiry: %w", err)
	}

	// Check if token is expired
	if time.Now().After(expiresAt) {
		return errors.New("token expired")
	}

	// Verify token
	if err := s.VerifyPassword(hashedToken, token); err != nil {
		return errors.New("invalid token")
	}

	if _, err := database.GetClient().UpdateByID("users", userID, map[string]interface{}{
		"email_verified": true,
		"is_active":      true,
		"locked_until":   nil,
		"updated_at":     time.Now(),
	}); err != nil {
		return fmt.Errorf("failed to verify email: %w", err)
	}

	// Mark token as used
	if _, err := database.GetClient().UpdateByID("email_verification_tokens", tokenID, map[string]interface{}{"used": true}); err != nil {
		return fmt.Errorf("failed to mark token as used: %w", err)
	}

	return nil
}

// generateSecureToken generates a secure random token
func (s *AuthService) generateSecureToken() (string, error) {
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}
// GetUsers retrieves all users from the database
func (s *AuthService) GetUsers() ([]models.User, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	usersData, err := database.GetClient().Select("users", map[string]string{"order": "created_at.desc"})
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}

	users := make([]models.User, 0, len(usersData))
	for _, row := range usersData {
		var user models.User
		if err := decodeMap(row, &user); err != nil {
			continue
		}
		users = append(users, user)
	}

	return users, nil
}

// UpdateUser updates a user's information
func (s *AuthService) UpdateUser(userID string, req *models.UpdateUserRequest) (*models.User, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	updateData := map[string]interface{}{"updated_at": time.Now()}
	nameParts := []string{}
	if req.Name != nil {
		updateData["name"] = *req.Name
	}
	if req.FirstName != nil {
		nameParts = append(nameParts, *req.FirstName)
	}
	if req.LastName != nil {
		nameParts = append(nameParts, *req.LastName)
	}
	if req.Email != nil {
		updateData["email"] = *req.Email
	}
	if req.Role != nil {
		updateData["role"] = *req.Role
	}
	if req.IsActive != nil {
		updateData["is_active"] = *req.IsActive
	}
	if req.Metadata != nil {
		updateData["metadata"] = req.Metadata
	}
	if req.AvatarURL != nil {
		metadata := map[string]interface{}{}
		if existing, ok := updateData["metadata"].(map[string]interface{}); ok {
			metadata = existing
		}
		metadata["avatar_url"] = *req.AvatarURL
		updateData["metadata"] = metadata
	}
	if len(nameParts) > 0 {
		updateData["name"] = strings.TrimSpace(strings.Join(nameParts, " "))
	}

	updated, err := database.GetClient().UpdateByID("users", userID, updateData)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	var user models.User
	if err := decodeMap(updated, &user); err != nil {
		return nil, fmt.Errorf("failed to parse updated user: %w", err)
	}

	return &user, nil
}

// DeleteUser deletes a user from the database
func (s *AuthService) DeleteUser(userID string) error {
	if err := s.ensureDB(); err != nil {
		return err
	}

	if err := database.GetClient().DeleteWhere("refresh_tokens", map[string]string{"user_id": "eq." + userID}); err != nil {
		return fmt.Errorf("failed to delete refresh tokens: %w", err)
	}
	if err := database.GetClient().DeleteByID("users", userID); err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	return nil
}

// UpdateUserStatus updates a user's status
func (s *AuthService) UpdateUserStatus(userID string, status models.UserStatus) error {
	if err := s.ensureDB(); err != nil {
		return err
	}

	updateData := map[string]interface{}{
		"updated_at": time.Now(),
		"is_active":  status == models.StatusActive,
	}
	if status == models.StatusLocked {
		updateData["locked_until"] = time.Now().Add(24 * time.Hour)
	} else {
		updateData["locked_until"] = nil
	}

	if _, err := database.GetClient().UpdateByID("users", userID, map[string]interface{}{
		"is_active":    updateData["is_active"],
		"locked_until": updateData["locked_until"],
		"updated_at":   updateData["updated_at"],
	}); err != nil {
		return fmt.Errorf("failed to update user status: %w", err)
	}

	return nil
}

// CreateOrUpdateOAuthUser creates or updates a user from OAuth provider
func (s *AuthService) CreateOrUpdateOAuthUser(provider, email string, userInfo interface{}) (*models.User, *TokenPair, error) {
	if err := s.ensureDB(); err != nil {
		return nil, nil, err
	}

	// Check if user exists by email
	users, err := database.GetClient().Select("users", map[string]string{"email": "eq." + email, "limit": "1"})
	if err != nil {
		return nil, nil, fmt.Errorf("failed to query user: %w", err)
	}

	var user *models.User
	newUser := false
	if len(users) == 0 {
		newUser = true
		user, err = s.createOAuthUser(provider, userInfo)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create OAuth user: %w", err)
		}
	} else {
		user = &models.User{}
		if err := decodeMap(users[0], user); err != nil {
			return nil, nil, fmt.Errorf("failed to parse user: %w", err)
		}
		newUser = false
		err = s.updateLastLogin(user.ID)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to update last login: %w", err)
		}
	}

	// Generate JWT tokens
	tokenPair, err := s.GenerateTokenPair(user)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	log.Printf("✅ User %s authenticated via %s OAuth (new: %v)", email, provider, newUser)

	return user, tokenPair, nil
}

// createOAuthUser creates a new user from OAuth provider data
func (s *AuthService) createOAuthUser(provider string, userInfo interface{}) (*models.User, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	var email, firstName, lastName, avatarURL string
	var role models.UserRole = models.RoleUser // Default role for OAuth users

	switch provider {
	case "google":
		googleUser, ok := userInfo.(*models.GoogleUserInfo)
		if !ok || googleUser == nil {
			return nil, fmt.Errorf("invalid google user info")
		}
		email = googleUser.Email
		firstName = googleUser.GivenName
		lastName = googleUser.FamilyName
		avatarURL = googleUser.Picture

	case "facebook":
		facebookUser, ok := userInfo.(*models.FacebookUserInfo)
		if !ok || facebookUser == nil {
			return nil, fmt.Errorf("invalid facebook user info")
		}
		email = facebookUser.Email
		firstName = facebookUser.FirstName
		lastName = facebookUser.LastName
		avatarURL = facebookUser.Picture.Data.URL

	case "apple":
		appleUser, ok := userInfo.(*models.AppleUserInfo)
		if !ok || appleUser == nil {
			return nil, fmt.Errorf("invalid apple user info")
		}
		email = appleUser.Email
		// Apple name format: "First Last"
		if appleUser.Name != "" {
			parts := strings.Split(appleUser.Name, " ")
			if len(parts) >= 2 {
				firstName = parts[0]
				lastName = strings.Join(parts[1:], " ")
			} else {
				firstName = appleUser.Name
				lastName = ""
			}
		}
	}

	inserted, err := database.GetClient().Insert("users", map[string]interface{}{
		"id":             uuid.NewString(),
		"email":          email,
		"name":           strings.TrimSpace(firstName + " " + lastName),
		"role":           role,
		"email_verified": true,
		"is_active":      true,
		"metadata":       map[string]interface{}{"avatar_url": avatarURL},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	var user models.User
	if err := decodeMap(inserted, &user); err != nil {
		return nil, fmt.Errorf("failed to parse created user: %w", err)
	}

	return &user, nil
}

// updateLastLogin updates the last login timestamp for a user
func (s *AuthService) updateLastLogin(userID string) error {
	if err := s.ensureDB(); err != nil {
		return err
	}

	_, err := database.GetClient().UpdateByID("users", userID, map[string]interface{}{
		"last_login_at": time.Now(),
	})
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	return nil
}

func decodeMap(input map[string]interface{}, target interface{}) error {
	data, err := json.Marshal(input)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, target)
}

func parseTimeValue(value interface{}) (time.Time, error) {
	if value == nil {
		return time.Time{}, fmt.Errorf("nil time value")
	}

	switch v := value.(type) {
	case time.Time:
		return v, nil
	case string:
		return time.Parse(time.RFC3339, v)
	case []byte:
		return time.Parse(time.RFC3339, string(v))
	case map[string]interface{}:
		raw, err := json.Marshal(v)
		if err != nil {
			return time.Time{}, err
		}
		var parsed time.Time
		if err := json.Unmarshal(raw, &parsed); err != nil {
			return time.Time{}, err
		}
		return parsed, nil
	default:
		raw, err := json.Marshal(v)
		if err != nil {
			return time.Time{}, err
		}
		var parsed time.Time
		if err := json.Unmarshal(raw, &parsed); err != nil {
			return time.Time{}, err
		}
		return parsed, nil
	}
}
