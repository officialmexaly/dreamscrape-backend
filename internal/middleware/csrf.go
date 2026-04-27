package middleware

import (
	"crypto/subtle"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"dreamscape-backend/pkg/config"
)

// CSRFMiddleware provides CSRF protection
func CSRFMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip CSRF for GET, HEAD, OPTIONS requests
		if c.Request.Method == "GET" || c.Request.Method == "HEAD" || c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		// Get CSRF token from header
		csrfToken := c.GetHeader("X-CSRF-Token")
		if csrfToken == "" {
			c.JSON(http.StatusForbidden, gin.H{"error": "CSRF token missing"})
			c.Abort()
			return
		}

		// Get CSRF token from cookie
		csrfCookie, err := c.Cookie("csrf_token")
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "CSRF cookie missing"})
			c.Abort()
			return
		}

		// Validate tokens using constant-time comparison
		if subtle.ConstantTimeCompare([]byte(csrfToken), []byte(csrfCookie)) != 1 {
			c.JSON(http.StatusForbidden, gin.H{"error": "Invalid CSRF token"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// GenerateCSRFToken generates a CSRF token for authenticated users
func GenerateCSRFToken(userID string) (string, error) {
	// Create JWT token for CSRF
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     0, // Never expires for session
	})

	tokenString, err := token.SignedString([]byte(config.AppConfig.CSRFSecret))
	if err != nil {
		return "", err
	}

	// Use the raw token as CSRF token
	return tokenString, nil
}

// SetCSRFCookie sets the CSRF cookie for authenticated users
func SetCSRFCookie(c *gin.Context, userID string) error {
	csrfToken, err := GenerateCSRFToken(userID)
	if err != nil {
		return err
	}

	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"csrf_token",
		csrfToken,
		86400*7, // 7 days
		"/",
		"",
		false, // TODO: Set to true in production with HTTPS
		false, // Not HTTP-only, needed for JavaScript access
	)

	return nil
}

// ValidateCSRFToken validates a CSRF token
func ValidateCSRFToken(token string, cookie string) error {
	if token == "" || cookie == "" {
		return errors.New("CSRF token or cookie missing")
	}

	// Split the token and cookie into parts
	tokenParts := strings.Split(token, ".")
	cookieParts := strings.Split(cookie, ".")
	if len(tokenParts) != 3 || len(cookieParts) != 3 {
		return errors.New("Invalid CSRF token format")
	}

	// Compare using constant-time comparison to prevent timing attacks
	if subtle.ConstantTimeCompare([]byte(token), []byte(cookie)) != 1 {
		return errors.New("CSRF tokens do not match")
	}

	return nil
}