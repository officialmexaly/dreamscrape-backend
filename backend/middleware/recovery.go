package middleware

import (
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"dreamscape-backend/pkg/config"
	"dreamscape-backend/pkg/errors"
)

// Recovery returns the panic recovery middleware
func Recovery(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Get request information
				requestID, _ := c.Get("RequestID")
				path := c.Request.URL.Path
				method := c.Request.Method

				// Log the panic
				logger.Error("Panic recovered",
					slog.Any("error", err),
					slog.String("request_id", fmt.Sprintf("%v", requestID)),
					slog.String("method", method),
					slog.String("path", path),
					slog.String("stack", string(debug.Stack())),
				)

				// Send appropriate response based on environment
				if config.AppConfig.GinMode == "release" {
					c.JSON(http.StatusInternalServerError, gin.H{
						"error":    "Internal server error",
						"request_id": fmt.Sprintf("%v", requestID),
					})
				} else {
					// In development, include panic details
					c.JSON(http.StatusInternalServerError, gin.H{
						"error":      fmt.Sprintf("Panic: %v", err),
						"request_id": fmt.Sprintf("%v", requestID),
						"stack":      string(debug.Stack()),
					})
				}

				c.Abort()
			}
		}()

		c.Next()
	}
}

// ErrorHandler custom error handler middleware
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Check if there are any errors
		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			requestID, _ := c.Get("RequestID")

			// Handle AppError
			if appErr, ok := err.Err.(*errors.AppError); ok {
				response := gin.H{
					"error":      appErr.Message,
					"request_id": fmt.Sprintf("%v", requestID),
				}

				if !appErr.Internal || config.AppConfig.GinMode != "release" {
					response["code"] = appErr.Code
				}

				c.JSON(appErr.Code, response)
				c.Abort()
				return
			}

			// Handle other errors
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":      "Internal server error",
				"request_id": fmt.Sprintf("%v", requestID),
			})
			c.Abort()
		}
	}
}