package admin

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"dreamscape-backend/backend/models"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/backend/services"
	"dreamscape-backend/pkg/errors"
)

// AdminUserHandler handles admin user endpoints
type AdminUserHandler struct {
	db          *pgxpool.Pool
	authService *services.AuthService
}

func NewAdminUserHandler(db *pgxpool.Pool, authService *services.AuthService) *AdminUserHandler {
	return &AdminUserHandler{db: db, authService: authService}
}

func (h *AdminUserHandler) GetUsers(c *gin.Context) {
	ctx := context.Background()

	role := c.Query("role")
	status := c.Query("status")
	limit := 100

	query := `
		SELECT id, email, password_hash, name, role, email_verified, email_verification_token,
		       email_verification_expires, created_at, updated_at, last_login_at, last_login_ip,
		       last_login_user_agent, failed_login_attempts, locked_until, password_reset_token,
		       password_reset_expires, two_factor_enabled, two_factor_secret,
		       two_factor_backup_codes, is_active, deleted_at, metadata
		FROM users
		WHERE 1=1
	`

	args := []interface{}{}
	argCount := 1

	if role != "" {
		query += " AND role = $" + common.SqlParam(argCount)
		args = append(args, role)
		argCount++
	}
	if status != "" {
		switch strings.ToLower(status) {
		case "active":
			query += " AND is_active = $" + common.SqlParam(argCount)
			args = append(args, true)
			argCount++
		case "inactive":
			query += " AND is_active = $" + common.SqlParam(argCount)
			args = append(args, false)
			argCount++
		case "locked":
			query += " AND locked_until IS NOT NULL AND locked_until > NOW()"
		case "pending":
			query += " AND email_verified = false"
		}
	}

	query += " ORDER BY created_at DESC LIMIT $" + common.SqlParam(argCount)
	args = append(args, limit)

	rows, err := h.db.Query(ctx, query, args...)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(
			&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role,
			&user.EmailVerified, &user.EmailVerificationToken, &user.EmailVerificationExpires,
			&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt, &user.LastLoginIP,
			&user.LastLoginUserAgent, &user.FailedLoginAttempts, &user.LockedUntil,
			&user.PasswordResetToken, &user.PasswordResetExpires, &user.TwoFactorEnabled,
			&user.TwoFactorSecret, &user.TwoFactorBackupCodes, &user.IsActive,
			&user.DeletedAt, &user.Metadata,
		)
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}
		populateUserCompatibility(&user)
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, users)
}

func (h *AdminUserHandler) GetUserByID(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()

	var user models.User
	err := h.db.QueryRow(ctx,
		`SELECT id, email, password_hash, name, role, email_verified, email_verification_token,
		       email_verification_expires, created_at, updated_at, last_login_at, last_login_ip,
		       last_login_user_agent, failed_login_attempts, locked_until, password_reset_token,
		       password_reset_expires, two_factor_enabled, two_factor_secret,
		       two_factor_backup_codes, is_active, deleted_at, metadata
		 FROM users WHERE id = $1`, id).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role,
		&user.EmailVerified, &user.EmailVerificationToken, &user.EmailVerificationExpires,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt, &user.LastLoginIP,
		&user.LastLoginUserAgent, &user.FailedLoginAttempts, &user.LockedUntil,
		&user.PasswordResetToken, &user.PasswordResetExpires, &user.TwoFactorEnabled,
		&user.TwoFactorSecret, &user.TwoFactorBackupCodes, &user.IsActive,
		&user.DeletedAt, &user.Metadata,
	)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("User not found"))
		return
	}

	populateUserCompatibility(&user)
	common.SuccessResponse(c, http.StatusOK, user)
}

type CreateUserRequest struct {
	Email     string                 `json:"email" binding:"required,email"`
	Password  string                 `json:"password" binding:"required,min=8"`
	Role      models.UserRole        `json:"role" binding:"required"`
	Name      string                 `json:"name"`
	FirstName string                 `json:"first_name"`
	LastName  string                 `json:"last_name"`
	IsActive  *bool                  `json:"is_active"`
	Metadata  map[string]interface{} `json:"metadata"`
}

type UpdateUserRequest struct {
	Email     *string                `json:"email"`
	Role      *models.UserRole       `json:"role"`
	Name      *string                `json:"name"`
	FirstName *string                `json:"first_name"`
	LastName  *string                `json:"last_name"`
	IsActive  *bool                  `json:"is_active"`
	Metadata  map[string]interface{} `json:"metadata"`
}

func (h *AdminUserHandler) CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()

	var exists bool
	err := h.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`, req.Email).Scan(&exists)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	if exists {
		common.ErrorResponse(c, errors.Conflict("User with this email already exists"))
		return
	}

	hashedPassword, err := h.authService.HashPassword(req.Password)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	name := resolveUserName(req.Name, req.FirstName, req.LastName)
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	metadataJSON := metadataJSONOrNull(req.Metadata)

	var user models.User
	err = h.db.QueryRow(ctx,
		`INSERT INTO users (id, email, password_hash, name, role, email_verified, is_active,
		       metadata, created_at, updated_at)
		 VALUES (gen_random_uuid(), $1, $2, $3, $4, false, $5, COALESCE($6::jsonb, '{}'::jsonb), NOW(), NOW())
		 RETURNING id, email, password_hash, name, role, email_verified, email_verification_token,
		           email_verification_expires, created_at, updated_at, last_login_at, last_login_ip,
		           last_login_user_agent, failed_login_attempts, locked_until, password_reset_token,
		           password_reset_expires, two_factor_enabled, two_factor_secret,
		           two_factor_backup_codes, is_active, deleted_at, metadata`,
		req.Email, hashedPassword, name, req.Role, isActive, metadataJSON).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role,
		&user.EmailVerified, &user.EmailVerificationToken, &user.EmailVerificationExpires,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt, &user.LastLoginIP,
		&user.LastLoginUserAgent, &user.FailedLoginAttempts, &user.LockedUntil,
		&user.PasswordResetToken, &user.PasswordResetExpires, &user.TwoFactorEnabled,
		&user.TwoFactorSecret, &user.TwoFactorBackupCodes, &user.IsActive,
		&user.DeletedAt, &user.Metadata,
	)

	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	populateUserCompatibility(&user)
	common.SuccessResponse(c, http.StatusCreated, user)
}

func (h *AdminUserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()
	query := "UPDATE users SET updated_at = NOW()"
	args := []interface{}{}
	argCount := 1

	if req.Email != nil {
		query += ", email = $" + common.SqlParam(argCount)
		args = append(args, *req.Email)
		argCount++
	}
	if req.Role != nil {
		query += ", role = $" + common.SqlParam(argCount)
		args = append(args, *req.Role)
		argCount++
	}
	if req.Name != nil {
		query += ", name = $" + common.SqlParam(argCount)
		args = append(args, *req.Name)
		argCount++
	}
	if req.Name == nil && (req.FirstName != nil || req.LastName != nil) {
		query += ", name = $" + common.SqlParam(argCount)
		args = append(args, resolveUserName("", derefString(req.FirstName), derefString(req.LastName)))
		argCount++
	}
	if req.IsActive != nil {
		query += ", is_active = $" + common.SqlParam(argCount)
		args = append(args, *req.IsActive)
		argCount++
	}
	if req.Metadata != nil {
		query += ", metadata = $" + common.SqlParam(argCount) + "::jsonb"
		args = append(args, metadataJSONOrNull(req.Metadata))
		argCount++
	}

	query += " WHERE id = $" + common.SqlParam(argCount)
	args = append(args, id)

	_, err := h.db.Exec(ctx, query, args...)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	var user models.User
	err = h.db.QueryRow(ctx,
		`SELECT id, email, password_hash, name, role, email_verified, email_verification_token,
		       email_verification_expires, created_at, updated_at, last_login_at, last_login_ip,
		       last_login_user_agent, failed_login_attempts, locked_until, password_reset_token,
		       password_reset_expires, two_factor_enabled, two_factor_secret,
		       two_factor_backup_codes, is_active, deleted_at, metadata
		 FROM users WHERE id = $1`, id).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role,
		&user.EmailVerified, &user.EmailVerificationToken, &user.EmailVerificationExpires,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt, &user.LastLoginIP,
		&user.LastLoginUserAgent, &user.FailedLoginAttempts, &user.LockedUntil,
		&user.PasswordResetToken, &user.PasswordResetExpires, &user.TwoFactorEnabled,
		&user.TwoFactorSecret, &user.TwoFactorBackupCodes, &user.IsActive,
		&user.DeletedAt, &user.Metadata,
	)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("User not found"))
		return
	}

	populateUserCompatibility(&user)
	common.SuccessResponse(c, http.StatusOK, user)
}

func (h *AdminUserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()

	_, err := h.db.Exec(ctx, "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "User deleted successfully")
}

type LockUserRequest struct {
	Locked   bool  `json:"locked"`
	Duration *int  `json:"duration"`
	Reason   string `json:"reason"`
}

func (h *AdminUserHandler) LockUser(c *gin.Context) {
	id := c.Param("id")
	var req LockUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()

	if req.Locked {
		var lockedUntil *time.Time
		if req.Duration != nil {
			until := time.Now().Add(time.Duration(*req.Duration) * time.Minute)
			lockedUntil = &until
		}

		_, err := h.db.Exec(ctx,
			`UPDATE users SET locked_until = $1, is_active = false, updated_at = NOW() WHERE id = $2`,
			lockedUntil, id)
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}

		common.MessageResponse(c, http.StatusOK, "User locked successfully")
		return
	}

	_, err := h.db.Exec(ctx,
		`UPDATE users SET locked_until = NULL, failed_login_attempts = 0, is_active = true, updated_at = NOW() WHERE id = $1`,
		id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "User unlocked successfully")
}

type ResetUserPasswordRequest struct {
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

func (h *AdminUserHandler) ResetUserPassword(c *gin.Context) {
	id := c.Param("id")
	var req ResetUserPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()

	hashedPassword, err := h.authService.HashPassword(req.NewPassword)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	_, err = h.db.Exec(ctx,
		`UPDATE users SET password_hash = $1, failed_login_attempts = 0, locked_until = NULL, updated_at = NOW() WHERE id = $2`,
		hashedPassword, id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Password reset successfully")
}

func populateUserCompatibility(user *models.User) {
	first, last := splitName(user.Name)
	user.FirstName = first
	user.LastName = last
	user.Status = deriveUserStatus(user)
	if user.Metadata != nil {
		if avatar, ok := user.Metadata["avatar_url"].(string); ok {
			user.AvatarURL = avatar
		}
	}
}

func splitName(name string) (string, string) {
	parts := strings.Fields(strings.TrimSpace(name))
	if len(parts) == 0 {
		return "", ""
	}
	if len(parts) == 1 {
		return parts[0], ""
	}
	return parts[0], strings.Join(parts[1:], " ")
}

func resolveUserName(name, firstName, lastName string) string {
	if strings.TrimSpace(name) != "" {
		return strings.TrimSpace(name)
	}
	full := strings.TrimSpace(firstName + " " + lastName)
	return strings.TrimSpace(full)
}

func deriveUserStatus(user *models.User) models.UserStatus {
	if user.LockedUntil != nil && user.LockedUntil.After(time.Now()) {
		return models.StatusLocked
	}
	if !user.IsActive {
		return models.StatusInactive
	}
	return models.StatusActive
}

func metadataJSONOrNull(metadata map[string]interface{}) interface{} {
	if metadata == nil {
		return nil
	}
	b, err := json.Marshal(metadata)
	if err != nil {
		return nil
	}
	return string(b)
}

func derefString(v *string) string {
	if v == nil {
		return ""
	}
	return *v
}
