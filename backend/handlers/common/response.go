package common

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"dreamscape-backend/pkg/errors"
)

// Response represents a standard API response
type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Success bool           `json:"success"`
	Data    interface{}    `json:"data"`
	Meta    PaginationMeta `json:"meta"`
}

// PaginationMeta contains pagination metadata
type PaginationMeta struct {
	Page       int `json:"page"`
	PerPage    int `json:"per_page"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// SuccessResponse sends a successful JSON response
func SuccessResponse(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, Response{
		Success: true,
		Data:    data,
	})
}

// MessageResponse sends a successful message response
func MessageResponse(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, Response{
		Success: true,
		Message: message,
	})
}

// ErrorResponse sends an error response
func ErrorResponse(c *gin.Context, err error) {
	if appErr, ok := err.(*errors.AppError); ok {
		c.JSON(appErr.Code, Response{
			Success: false,
			Error:   appErr.Message,
		})
		return
	}

	// Handle unknown errors
	c.JSON(500, Response{
		Success: false,
		Error:   "Internal server error",
	})
}

// SendPaginatedResponse sends a paginated response
func SendPaginatedResponse(c *gin.Context, statusCode int, data interface{}, meta PaginationMeta) {
	c.JSON(statusCode, PaginatedResponse{
		Success: true,
		Data:    data,
		Meta:    meta,
	})
}

// ValidationErrorResponse sends a validation error response
func ValidationErrorResponse(c *gin.Context, validationErr *errors.ValidationError) {
	c.JSON(422, Response{
		Success: false,
		Error:   validationErr.Message,
		Data:    validationErr.Fields,
	})
}

// SqlParam converts an integer to SQL parameter string
func SqlParam(n int) string {
	return fmt.Sprintf("%d", n)
}

// ParseOptionalDate parses an optional date string from a pointer
func ParseOptionalDate(dateStr *string) (*time.Time, error) {
	if dateStr == nil || *dateStr == "" {
		return nil, nil
	}
	parsed, err := time.Parse("2006-01-02", *dateStr)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}