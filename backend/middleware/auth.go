package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"dreamscape-backend/backend/models"
	"dreamscape-backend/backend/services"
	"dreamscape-backend/pkg/config"
)

type Claims struct {
	UserID string `json:"sub"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// AuthMiddleware validates JWT tokens and sets user context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from cookie or header
		token, err := c.Cookie("access_token")
		if err != nil {
			// Try Authorization header
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "No authentication token found"})
				c.Abort()
				return
			}
			token = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// Validate token
		claims, err := validateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authentication token"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)
		c.Set("userClaims", claims)

		c.Next()
	}
}

// RequireAuth requires authentication (no role check)
func RequireAuth() gin.HandlerFunc {
	return AuthMiddleware()
}

// RequireAdmin requires admin role
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// First validate authentication
		AuthMiddleware()(c)
		if c.IsAborted() {
			return
		}

		// Check if user has admin role
		role, exists := c.Get("userRole")
		if !exists {
			if !c.Writer.Written() {
				c.JSON(http.StatusForbidden, gin.H{"error": "User role not found"})
			}
			c.Abort()
			return
		}

		// Convert role to string, then to UserRole
		roleStr, ok := role.(string)
		if !ok {
			if !c.Writer.Written() {
				c.JSON(http.StatusForbidden, gin.H{"error": "Invalid role format"})
			}
			c.Abort()
			return
		}

		userRole := models.UserRole(roleStr)
		if userRole != models.RoleAdmin && userRole != models.RoleSuperAdmin {
			if !c.Writer.Written() {
				c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			}
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireSuperAdmin requires super_admin role
func RequireSuperAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// First validate authentication
		AuthMiddleware()(c)
		if c.IsAborted() {
			return
		}

		// Check if user has super_admin role
		role, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "User role not found"})
			c.Abort()
			return
		}

		// Convert role to string, then to UserRole
		roleStr, ok := role.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Invalid role format"})
			c.Abort()
			return
		}

		userRole := models.UserRole(roleStr)
		if userRole != models.RoleSuperAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// OptionalAuth validates token if present but doesn't require it
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from cookie or header
		token, err := c.Cookie("access_token")
		if err == nil && token != "" {
			// Token present, try to validate
			if claims, err := validateToken(token); err == nil {
				c.Set("userID", claims.UserID)
				c.Set("userEmail", claims.Email)
				c.Set("userRole", claims.Role)
				c.Set("userClaims", claims)
			}
		} else {
			// Try Authorization header
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" {
				token = strings.TrimPrefix(authHeader, "Bearer ")
				if claims, err := validateToken(token); err == nil {
					c.Set("userID", claims.UserID)
					c.Set("userEmail", claims.Email)
					c.Set("userRole", claims.Role)
					c.Set("userClaims", claims)
				}
			}
		}

		c.Next()
	}
}

// validateToken validates a JWT token and returns the claims
func validateToken(tokenString string) (*services.JWTClaims, error) {
	// Remove "Bearer " prefix if present
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	secret := config.AppConfig.JWTSecret
	if secret == "" {
		return nil, fmt.Errorf("JWT_SECRET environment variable is not set")
	}

	token, err := jwt.ParseWithClaims(tokenString, &services.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(*services.JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// GetUserID retrieves the user ID from the Gin context
func GetUserID(c *gin.Context) (string, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		return "", false
	}
	return userID.(string), true
}

// GetUserEmail retrieves the user email from the Gin context
func GetUserEmail(c *gin.Context) (string, bool) {
	email, exists := c.Get("userEmail")
	if !exists {
		return "", false
	}
	return email.(string), true
}

// GetUserRole retrieves the user role from the Gin context
func GetUserRole(c *gin.Context) (models.UserRole, bool) {
	role, exists := c.Get("userRole")
	if !exists {
		return "", false
	}
	return models.UserRole(role.(string)), true
}

// IsAuthenticated checks if user is authenticated
func IsAuthenticated(c *gin.Context) bool {
	_, exists := c.Get("userID")
	return exists
}

// HasRole checks if user has specific role
func HasRole(c *gin.Context, role models.UserRole) bool {
	userRole, exists := GetUserRole(c)
	if !exists {
		return false
	}
	return userRole == role
}

// HasAnyRole checks if user has any of the specified roles
func HasAnyRole(c *gin.Context, roles ...models.UserRole) bool {
	userRole, exists := GetUserRole(c)
	if !exists {
		return false
	}
	for _, r := range roles {
		if userRole == r {
			return true
		}
	}
	return false
}