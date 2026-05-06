package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"dreamscape-backend/pkg/config"
)

// CORS returns the CORS middleware with production configuration
func CORS() gin.HandlerFunc {
	// Create set of allowed origins to avoid duplicates
	originSet := make(map[string]bool)

	// Add the configured frontend URL
	if config.AppConfig.FrontendURL != "" {
		originSet[config.AppConfig.FrontendURL] = true
	}

	// Explicitly add both www and non-www variants
	originSet["https://www.dreamscapecurated.com"] = true
	originSet["https://dreamscapecurated.com"] = true
	originSet["http://localhost:3000"] = true
	originSet["http://localhost:8080"] = true

	// Convert map to slice
	allowedOrigins := make([]string, 0, len(originSet))
	for origin := range originSet {
		allowedOrigins = append(allowedOrigins, origin)
	}

	corsConfig := cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Cookie", "X-CSRF-Token", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}

	return cors.New(corsConfig)
}