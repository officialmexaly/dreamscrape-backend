package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"dreamscape-backend/pkg/config"
)

// CORS returns the CORS middleware with production configuration
func CORS() gin.HandlerFunc {
	corsConfig := cors.Config{
		AllowOrigins:     []string{config.AppConfig.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Cookie", "X-CSRF-Token", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}

	return cors.New(corsConfig)
}