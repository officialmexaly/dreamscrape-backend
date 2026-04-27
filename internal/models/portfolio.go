package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// StringArray is a custom type for handling string arrays that works with Swagger
type StringArray []string

// Scan implements the sql.Scanner interface for StringArray
func (a *StringArray) Scan(value interface{}) error {
	if value == nil {
		*a = nil
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, a)
	case string:
		return json.Unmarshal([]byte(v), a)
	default:
		return fmt.Errorf("unsupported type: %T", value)
	}
}

// Value implements the driver.Valuer interface for StringArray
func (a StringArray) Value() (driver.Value, error) {
	if a == nil {
		return nil, nil
	}
	return json.Marshal(a)
}

// PortfolioItem represents a blog post or portfolio item
type PortfolioItem struct {
	ID              uuid.UUID              `json:"id" db:"id"`
	Slug            string                 `json:"slug" db:"slug"`
	Title           string                 `json:"title" db:"title"`
	Subtitle        *string                `json:"subtitle,omitempty" db:"subtitle"`
	Excerpt         *string                `json:"excerpt,omitempty" db:"excerpt"`
	Author          *string                `json:"author,omitempty" db:"author"`
	Categories      StringArray            `json:"categories,omitempty" db:"categories" example:"["weddings","corporate"]"`
	Tags            StringArray            `json:"tags,omitempty" db:"tags" example:"["outdoor","elegant"]"`
	Content         *JSONB                 `json:"content,omitempty" db:"content"`
	ClientName      *string                `json:"client_name,omitempty" db:"client_name"`
	EventDate       *time.Time             `json:"event_date,omitempty" db:"event_date"`
	EventType       *string                `json:"event_type,omitempty" db:"event_type"`
	Location        *string                `json:"location,omitempty" db:"location"`
	Description     *string                `json:"description,omitempty" db:"description"`
	Images          StringArray            `json:"images,omitempty" db:"images" example:"["image1.jpg","image2.jpg"]"`
	FeaturedImage   *string                `json:"featured_image,omitempty" db:"featured_image"`
	GalleryImages   StringArray            `json:"gallery_images,omitempty" db:"gallery_images" example:"["gallery1.jpg","gallery2.jpg"]"`
	Budget          *string                `json:"budget,omitempty" db:"budget"`
	GuestCount      *int                   `json:"guest_count,omitempty" db:"guest_count"`
	Vendors         StringArray            `json:"vendors,omitempty" db:"vendors" example:"["catering","photography"]"`
	Testimonial     *string                `json:"testimonial,omitempty" db:"testimonial"`
	MetaTitle       *string                `json:"meta_title,omitempty" db:"meta_title"`
	MetaDescription *string                `json:"meta_description,omitempty" db:"meta_description"`
	Status          string                 `json:"status" db:"status" example:"published"`
	DisplayOrder    int                    `json:"display_order" db:"display_order"`
	CreatedAt       time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time              `json:"updated_at" db:"updated_at"`
}

// JSONB is a custom type for handling JSONB data from PostgreSQL
type JSONB struct {
	Data interface{}
}

// Scan implements the sql.Scanner interface for JSONB
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		j.Data = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal JSONB value: %v", value)
	}

	return json.Unmarshal(bytes, &j.Data)
}

// Value implements the driver.Valuer interface for JSONB
func (j JSONB) Value() (driver.Value, error) {
	if j.Data == nil {
		return nil, nil
	}

	bytes, err := json.Marshal(j.Data)
	return bytes, err
}

// CreatePortfolioItemRequest represents a request to create a portfolio item
type CreatePortfolioItemRequest struct {
	Slug            *string       `json:"slug" binding:"required"`
	Title           string        `json:"title" binding:"required"`
	Subtitle        *string       `json:"subtitle"`
	Excerpt         *string       `json:"excerpt"`
	Author          *string       `json:"author"`
	Categories      []string      `json:"categories"`
	Tags            []string      `json:"tags"`
	Content         *interface{}  `json:"content"`
	ClientName      *string       `json:"client_name"`
	EventDate       *string       `json:"event_date"`
	EventType       *string       `json:"event_type"`
	Location        *string       `json:"location"`
	Description     *string       `json:"description"`
	Images          []string      `json:"images"`
	FeaturedImage   *string       `json:"featured_image"`
	GalleryImages   []string      `json:"gallery_images"`
	Budget          *string       `json:"budget"`
	GuestCount      *int          `json:"guest_count"`
	Vendors         []string      `json:"vendors"`
	Testimonial     *string       `json:"testimonial"`
	MetaTitle       *string       `json:"meta_title"`
	MetaDescription *string       `json:"meta_description"`
	Status          *string       `json:"status"`
	DisplayOrder    *int          `json:"display_order"`
}

// UpdatePortfolioItemRequest represents a request to update a portfolio item
type UpdatePortfolioItemRequest struct {
	Slug            *string       `json:"slug"`
	Title           *string       `json:"title"`
	Subtitle        *string       `json:"subtitle"`
	Excerpt         *string       `json:"excerpt"`
	Author          *string       `json:"author"`
	Categories      []string      `json:"categories"`
	Tags            []string      `json:"tags"`
	Content         *interface{}  `json:"content"`
	ClientName      *string       `json:"client_name"`
	EventDate       *string       `json:"event_date"`
	EventType       *string       `json:"event_type"`
	Location        *string       `json:"location"`
	Description     *string       `json:"description"`
	Images          []string      `json:"images"`
	FeaturedImage   *string       `json:"featured_image"`
	GalleryImages   []string      `json:"gallery_images"`
	Budget          *string       `json:"budget"`
	GuestCount      *int          `json:"guest_count"`
	Vendors         []string      `json:"vendors"`
	Testimonial     *string       `json:"testimonial"`
	MetaTitle       *string       `json:"meta_title"`
	MetaDescription *string       `json:"meta_description"`
	Status          *string       `json:"status"`
	DisplayOrder    *int          `json:"display_order"`
}

// PortfolioItemsResponse represents the response for portfolio items list
type PortfolioItemsResponse struct {
	Items []PortfolioItem `json:"items"`
}

// PortfolioItemResponse represents the response for a single portfolio item
type PortfolioItemResponse struct {
	Item PortfolioItem `json:"item"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// SuccessResponse represents a generic success response
type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}
