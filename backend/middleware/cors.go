package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"dreamscape-backend/pkg/config"
)

// CORS returns the CORS middleware with configuration from JSON file
func CORS() gin.HandlerFunc {
	corsConfig := config.AppConfig.CORS

	if corsConfig == nil {
		// Fallback to default configuration if CORS config is not loaded
		corsConfig = config.GetDefaultCORSConfig()
	}

	config := cors.Config{
		AllowOrigins:     corsConfig.AllowedOrigins,
		AllowMethods:     corsConfig.AllowedMethods,
		AllowHeaders:     corsConfig.AllowedHeaders,
		ExposeHeaders:    corsConfig.ExposedHeaders,
		AllowCredentials: corsConfig.AllowCredentials,
		MaxAge:           12 * 60 * 60, // 12 hours in seconds
	}

	return cors.New(config)
}