package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"dreamscape-backend/pkg/config"
)

// CORS returns the CORS middleware with production configuration
func CORS() gin.HandlerFunc {
	// Allow both www and non-www versions of the frontend
	allowedOrigins := []string{
		config.AppConfig.FrontendURL,
	}

	// Add www variant if not already present
	if config.AppConfig.FrontendURL != "" {
		wwwURL := ""
		if config.AppConfig.FrontendURL[:7] == "http://" {
			wwwURL = "http://www." + config.AppConfig.FrontendURL[7:]
		} else if config.AppConfig.FrontendURL[:8] == "https://" {
			wwwURL = "https://www." + config.AppConfig.FrontendURL[8:]
		}
		if wwwURL != "" && wwwURL != config.AppConfig.FrontendURL {
			allowedOrigins = append(allowedOrigins, wwwURL)
		}
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