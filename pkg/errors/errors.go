package errors

import (
	"fmt"
	"net/http"
)

// AppError represents an application error with HTTP status code
type AppError struct {
	Code       int    `json:"code"`
	Message    string `json:"message"`
	Err        error  `json:"-"`
	Internal   bool   `json:"internal"`   // Whether to hide details in production
	RequestID  string `json:"request_id,omitempty"`
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

// Unwrap returns the underlying error
func (e *AppError) Unwrap() error {
	return e.Err
}

// New creates a new AppError
func New(code int, message string) *AppError {
	return &AppError{
		Code:     code,
		Message:  message,
		Internal: code >= 500,
	}
}

// Wrap wraps an existing error with additional context
func Wrap(err error, code int, message string) *AppError {
	if err == nil {
		return nil
	}
	return &AppError{
		Code:     code,
		Message:  message,
		Err:      err,
		Internal: code >= 500,
	}
}

// Common error constructors
func BadRequest(message string) *AppError {
	return New(http.StatusBadRequest, message)
}

func Unauthorized(message string) *AppError {
	return New(http.StatusUnauthorized, message)
}

func Forbidden(message string) *AppError {
	return New(http.StatusForbidden, message)
}

func NotFound(message string) *AppError {
	return New(http.StatusNotFound, message)
}

func Conflict(message string) *AppError {
	return New(http.StatusConflict, message)
}

func UnprocessableEntity(message string) *AppError {
	return New(http.StatusUnprocessableEntity, message)
}

func InternalServerError(message string) *AppError {
	return New(http.StatusInternalServerError, message)
}

func ServiceUnavailable(message string) *AppError {
	return New(http.StatusServiceUnavailable, message)
}

// ValidationError represents a validation error with field details
type ValidationError struct {
	Message string              `json:"message"`
	Fields  map[string]string   `json:"fields"`
}

func (v *ValidationError) Error() string {
	return v.Message
}

// NewValidationError creates a new validation error
func NewValidationError(message string) *ValidationError {
	return &ValidationError{
		Message: message,
		Fields:  make(map[string]string),
	}
}

// AddField adds a field error to the validation error
func (v *ValidationError) AddField(field, message string) {
	v.Fields[field] = message
}

// HasFields returns true if there are field errors
func (v *ValidationError) HasFields() bool {
	return len(v.Fields) > 0
}