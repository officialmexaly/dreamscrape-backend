package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"log/slog"
)

// Logger returns the structured logging middleware
func Logger(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate request ID if not already set
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Set("RequestID", requestID)

		// Start timer
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(start)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method

		// Build log attributes
		attrs := []slog.Attr{
			slog.String("request_id", requestID),
			slog.String("client_ip", clientIP),
			slog.String("method", method),
			slog.String("path", path),
			slog.Int("status", statusCode),
			slog.Duration("latency", latency),
		}

		if query != "" {
			attrs = append(attrs, slog.String("query", query))
		}

		// Add user agent if available
		if userAgent := c.Request.UserAgent(); userAgent != "" {
			attrs = append(attrs, slog.String("user_agent", userAgent))
		}

		// Add error if request failed
		if len(c.Errors) > 0 {
			attrs = append(attrs, slog.String("errors", c.Errors.String()))
		}

		// Log based on status code
		msg := "Request completed"
		if statusCode >= 500 {
			logger.LogAttrs(c.Request.Context(), slog.LevelError, msg, attrs...)
		} else if statusCode >= 400 {
			logger.LogAttrs(c.Request.Context(), slog.LevelWarn, msg, attrs...)
		} else {
			logger.LogAttrs(c.Request.Context(), slog.LevelInfo, msg, attrs...)
		}
	}
}

// RequestIDMiddleware adds a request ID to the context
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Set("RequestID", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}