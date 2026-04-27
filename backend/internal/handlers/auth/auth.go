package auth

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"dreamscape-backend/internal/models"
	"dreamscape-backend/internal/handlers/common"
	"dreamscape-backend/internal/services"
	apperrors "dreamscape-backend/pkg/errors"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	authService *services.AuthService
}

// NewAuthHandler creates a new authentication handler
func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	// Validate passwords match
	if req.Password != req.ConfirmPassword {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "Passwords do not match",
			Fields:  map[string]string{"confirm_password": "Passwords do not match"},
		})
		return
	}

	// Register user
	user, err := h.authService.Register(&req)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Create email verification token
	token, err := h.authService.CreateEmailVerificationToken(user.ID)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// TODO: Send verification email

	common.MessageResponse(c, http.StatusCreated, "Registration successful. Please check your email to verify your account.")
	c.Set("verification_token", token) // For testing purposes
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	// Authenticate user
	user, err := h.authService.Login(&req)
	if err != nil {
		common.ErrorResponse(c, apperrors.Unauthorized("Invalid credentials"))
		return
	}

	// Generate tokens
	tokenPair, err := h.authService.GenerateTokenPair(user)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Set HTTP-only cookies
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"access_token",
		tokenPair.AccessToken,
		int(time.Until(tokenPair.ExpiresAt).Seconds()),
		"/",
		"",
		false, // TODO: Set to true in production with HTTPS
		true,  // HTTP-only
	)
	c.SetCookie(
		"refresh_token",
		tokenPair.RefreshToken,
		int(time.Until(tokenPair.ExpiresAt).Seconds()),
		"/",
		"",
		false, // TODO: Set to true in production with HTTPS
		true,  // HTTP-only
	)

	common.SuccessResponse(c, http.StatusOK, models.AuthResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresAt:    tokenPair.ExpiresAt,
		User:         *user,
	})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		common.ErrorResponse(c, apperrors.Unauthorized("Not authenticated"))
		return
	}

	// Revoke refresh tokens
	if err := h.authService.RevokeRefreshToken(userID.(string)); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Clear cookies
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	common.MessageResponse(c, http.StatusOK, "Logged out successfully")
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	// Get refresh token from cookie or request body
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		var req models.RefreshTokenRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			common.ErrorResponse(c, apperrors.Unauthorized("Refresh token required"))
			return
		}
		refreshToken = req.RefreshToken
	}

	// Refresh access token
	tokenPair, userID, err := h.authService.RefreshAccessToken(refreshToken)
	if err != nil {
		common.ErrorResponse(c, apperrors.Unauthorized("Invalid refresh token"))
		return
	}

	// Get user details
	user, err := h.authService.GetUserByID(userID)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Set new cookies
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"access_token",
		tokenPair.AccessToken,
		int(time.Until(tokenPair.ExpiresAt).Seconds()),
		"/",
		"",
		false,
		true,
	)
	c.SetCookie(
		"refresh_token",
		tokenPair.RefreshToken,
		int(time.Until(tokenPair.ExpiresAt).Seconds()),
		"/",
		"",
		false,
		true,
	)

	common.SuccessResponse(c, http.StatusOK, models.AuthResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresAt:    tokenPair.ExpiresAt,
		User:         *user,
	})
}

// GetMe handles getting current user info
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		common.ErrorResponse(c, apperrors.Unauthorized("Not authenticated"))
		return
	}

	user, err := h.authService.GetUserByID(userID.(string))
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, user)
}

// ForgotPassword handles password reset request
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req models.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	// Create password reset token
	token, err := h.authService.CreatePasswordResetToken(req.Email)
	if err != nil {
		// Don't reveal if user exists or not
		common.MessageResponse(c, http.StatusOK, "If an account exists with this email, a password reset link has been sent.")
		return
	}

	// TODO: Send password reset email
	c.Set("reset_token", token) // For testing purposes

	common.MessageResponse(c, http.StatusOK, "If an account exists with this email, a password reset link has been sent.")
}

// ResetPassword handles password reset
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req models.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	// Validate passwords match
	if req.NewPassword != req.ConfirmPassword {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "Passwords do not match",
			Fields:  map[string]string{"confirm_password": "Passwords do not match"},
		})
		return
	}

	// Reset password
	if err := h.authService.ResetPassword(req.Token, req.NewPassword); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Password reset successfully. Please login with your new password.")
}

// ChangePassword handles password change for authenticated users
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	// Get authenticated user from context (set by JWT middleware)
	userID, exists := c.Get("userID")
	if !exists {
		common.ErrorResponse(c, errors.New("user not authenticated"))
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	// Validate passwords match
	if req.NewPassword != req.ConfirmPassword {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "Passwords do not match",
			Fields:  map[string]string{"confirm_password": "Passwords do not match"},
		})
		return
	}

	// Validate new password is different from current password
	if req.CurrentPassword == req.NewPassword {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "New password must be different from current password",
			Fields:  map[string]string{"new_password": "New password must be different from current password"},
		})
		return
	}

	// Change password
	if err := h.authService.ChangePassword(userID.(string), req.CurrentPassword, req.NewPassword); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Password changed successfully.")
}

// VerifyEmail handles email verification
func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		common.ErrorResponse(c, apperrors.BadRequest("Verification token required"))
		return
	}

	if err := h.authService.VerifyEmail(token); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Email verified successfully. You can now login.")
}
// GetUsers retrieves all users (admin only)
// @Summary      Get all users
// @Description  Retrieve all users (admin only)
// @Tags         admin-users
// @Accept       json
// @Produce      json
// @Success      200  {object}  map[string]interface{} "users: []models.User"
// @Failure      401  {object}  models.ErrorResponse
// @Failure      403  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/users [get]
// @Security Bearer
func (h *AuthHandler) GetUsers(c *gin.Context) {
	users, err := h.authService.GetUsers()
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"count": len(users),
	})
}

// GetUserByID retrieves a user by ID (admin only)
// @Summary      Get user by ID
// @Description  Retrieve a user by ID (admin only)
// @Tags         admin-users
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "User ID"
// @Success      200  {object}  map[string]interface{} "user: models.User"
// @Failure      401  {object}  models.ErrorResponse
// @Failure      403  {object}  models.ErrorResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/users/:id [get]
// @Security Bearer
func (h *AuthHandler) GetUserByID(c *gin.Context) {
	id := c.Param("id")

	user, err := h.authService.GetUserByID(id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

// UpdateUser updates a user (admin only)
// @Summary      Update user
// @Description  Update a user (admin only)
// @Tags         admin-users
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "User ID"
// @Param        user   body      models.UpdateUserRequest  true  "User data"
// @Success      200  {object}  map[string]interface{} "user: models.User"
// @Failure      400  {object}  models.ErrorResponse
// @Failure      401  {object}  models.ErrorResponse
// @Failure      403  {object}  models.ErrorResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/users/:id [put]
// @Security Bearer
func (h *AuthHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	_, err := h.authService.UpdateUser(id, &req)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "User updated successfully")
}

// DeleteUser deletes a user (admin only)
// @Summary      Delete user
// @Description  Delete a user (admin only)
// @Tags         admin-users
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "User ID"
// @Success      200  {object}  models.SuccessResponse
// @Failure      401  {object}  models.ErrorResponse
// @Failure      403  {object}  models.ErrorResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/users/:id [delete]
// @Security Bearer
func (h *AuthHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := h.authService.DeleteUser(id); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "User deleted successfully")
}

// UpdateUserStatus updates a user's status (admin only)
// @Summary      Update user status
// @Description  Update a user's status (admin only)
// @Tags         admin-users
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "User ID"
// @Param        status   body      map[string]string  true  "Status data"
// @Success      200  {object}  models.SuccessResponse
// @Failure      400  {object}  models.ErrorResponse
// @Failure      401  {object}  models.ErrorResponse
// @Failure      403  {object}  models.ErrorResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/users/:id/status [put]
// @Security Bearer
func (h *AuthHandler) UpdateUserStatus(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Status models.UserStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &apperrors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	if err := h.authService.UpdateUserStatus(id, req.Status); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "User status updated successfully")
}
