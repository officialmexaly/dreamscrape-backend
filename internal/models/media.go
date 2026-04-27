package models

import (
	"time"
)

// MediaType represents media type
type MediaType string

const (
	MediaTypeImage MediaType = "image"
	MediaTypeVideo MediaType = "video"
	MediaTypeDocument MediaType = "document"
	MediaTypeOther MediaType = "other"
)

// Media represents a media file
type Media struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	URL       string    `json:"url" db:"url"`
	Type      MediaType `json:"type" db:"type"`
	MimeType  string    `json:"mime_type" db:"mime_type"`
	Size      int64     `json:"size" db:"size"`
	Width     *int      `json:"width" db:"width"`
	Height    *int      `json:"height" db:"height"`
	AltText   string    `json:"alt_text" db:"alt_text"`
	Folder    string    `json:"folder" db:"folder"`
	Tags      []string  `json:"tags" db:"tags"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// CreateMediaRequest represents a create media request
type CreateMediaRequest struct {
	Name      string    `json:"name" binding:"required"`
	URL       string    `json:"url" binding:"required"`
	Type      MediaType `json:"type" binding:"required"`
	MimeType  string    `json:"mime_type"`
	Size      int64     `json:"size"`
	Width     *int      `json:"width"`
	Height    *int      `json:"height"`
	AltText   string    `json:"alt_text"`
	Folder    string    `json:"folder"`
	Tags      []string  `json:"tags"`
}

// UpdateMediaRequest represents an update media request
type UpdateMediaRequest struct {
	Name     *string   `json:"name"`
	URL      *string   `json:"url"`
	Type     *MediaType `json:"type"`
	MimeType *string   `json:"mime_type"`
	Size     *int64    `json:"size"`
	Width    *int      `json:"width"`
	Height   *int      `json:"height"`
	AltText  *string   `json:"alt_text"`
	Folder   *string   `json:"folder"`
	Tags     *[]string `json:"tags"`
}

// SiteContent represents dynamic site content
type SiteContent struct {
	ID          string      `json:"id" db:"id"`
	Page        string      `json:"page" db:"page"`
	Section     string      `json:"section" db:"section"`
	ContentKey  string      `json:"content_key" db:"content_key"`
	ContentType string      `json:"content_type" db:"content_type"`
	Content     *string     `json:"content,omitempty" db:"content"`
	ContentJSON interface{} `json:"content_json,omitempty" db:"content_json"`
	ContentNumber *float64   `json:"content_number,omitempty" db:"content_number"`
	DisplayOrder int        `json:"display_order" db:"display_order"`
	IsActive    bool        `json:"is_active" db:"is_active"`
	CreatedAt   time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at" db:"updated_at"`
}

// CreateContentRequest represents a create content request
type CreateContentRequest struct {
	Page        string      `json:"page" binding:"required"`
	Section     string      `json:"section" binding:"required"`
	ContentKey  string      `json:"content_key" binding:"required"`
	ContentType string      `json:"content_type" binding:"required"`
	Content     interface{} `json:"content"`
	DisplayOrder int        `json:"display_order"`
	IsActive    bool        `json:"is_active"`
}

// UpdateContentRequest represents an update content request
type UpdateContentRequest struct {
	Content      *interface{} `json:"content"`
	DisplayOrder *int         `json:"display_order"`
	IsActive     *bool        `json:"is_active"`
}

// SiteSettings represents site configuration
type SiteSettings struct {
	ID              string            `json:"id" db:"id"`
	SiteName        string            `json:"site_name" db:"site_name"`
	SiteDescription string            `json:"site_description" db:"site_description"`
	LogoURL         string            `json:"logo_url" db:"logo_url"`
	FaviconURL      string            `json:"favicon_url" db:"favicon_url"`
	ContactEmail    string            `json:"contact_email" db:"contact_email"`
	ContactPhone    string            `json:"contact_phone" db:"contact_phone"`
	ContactAddress  string            `json:"contact_address" db:"contact_address"`
	WhatsAppNumber  string            `json:"whatsapp_number" db:"whatsapp_number"`
	SocialLinks     map[string]string `json:"social_links" db:"social_links"`
	SEOSettings     map[string]string `json:"seo_settings" db:"seo_settings"`
	BusinessHours   map[string]string `json:"business_hours" db:"business_hours"`
	UpdatedAt       time.Time         `json:"updated_at" db:"updated_at"`
}

// UpdateSettingsRequest represents an update settings request
type UpdateSettingsRequest struct {
	SiteName        *string            `json:"site_name"`
	SiteDescription *string            `json:"site_description"`
	LogoURL         *string            `json:"logo_url"`
	FaviconURL      *string            `json:"favicon_url"`
	ContactEmail    *string            `json:"contact_email"`
	ContactPhone    *string            `json:"contact_phone"`
	ContactAddress  *string            `json:"contact_address"`
	WhatsAppNumber  *string            `json:"whatsapp_number"`
	SocialLinks     map[string]string  `json:"social_links"`
	SEOSettings     map[string]string  `json:"seo_settings"`
	BusinessHours   map[string]string  `json:"business_hours"`
}
