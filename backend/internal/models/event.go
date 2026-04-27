package models

import (
	"time"
)

// EventStatus represents event status
type EventStatus string

const (
	EventStatusDraft      EventStatus = "draft"
	EventStatusPublished  EventStatus = "published"
	EventStatusArchived   EventStatus = "archived"
)

// Event represents an event portfolio item
type Event struct {
	ID              string    `json:"id" db:"id"`
	Slug            string    `json:"slug" db:"slug"`
	Title           string    `json:"title" db:"title"`
	ClientName      string    `json:"client_name" db:"client_name"`
	EventDate       *time.Time `json:"event_date,omitempty" db:"event_date"`
	EventType       string    `json:"event_type" db:"event_type"`
	Location        string    `json:"location" db:"location"`
	Description     string    `json:"description" db:"description"`
	Images          []string  `json:"images" db:"images"`
	FeaturedImage   string    `json:"featured_image" db:"featured_image"`
	GalleryImages   []string  `json:"gallery_images" db:"gallery_images"`
	Budget          *string   `json:"budget,omitempty" db:"budget"`
	GuestCount      *int      `json:"guest_count,omitempty" db:"guest_count"`
	Vendors         []string  `json:"vendors" db:"vendors"`
	Testimonial     string    `json:"testimonial" db:"testimonial"`
	MetaTitle       string    `json:"meta_title" db:"meta_title"`
	MetaDescription string    `json:"meta_description" db:"meta_description"`
	Status          EventStatus `json:"status" db:"status"`
	DisplayOrder    int       `json:"display_order" db:"display_order"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

// CreateEventRequest represents a create event request
type CreateEventRequest struct {
	Slug            string     `json:"slug" binding:"required"`
	Title           string     `json:"title" binding:"required"`
	ClientName      string     `json:"client_name"`
	EventDate       *time.Time `json:"event_date"`
	EventType       string     `json:"event_type" binding:"required"`
	Location        string     `json:"location"`
	Description     string     `json:"description" binding:"required"`
	Images          []string   `json:"images"`
	FeaturedImage   string     `json:"featured_image" binding:"required"`
	GalleryImages   []string   `json:"gallery_images"`
	Budget          *string    `json:"budget"`
	GuestCount      *int       `json:"guest_count"`
	Vendors         []string   `json:"vendors"`
	Testimonial     string     `json:"testimonial"`
	MetaTitle       string     `json:"meta_title"`
	MetaDescription string     `json:"meta_description"`
	Status          EventStatus `json:"status"`
	DisplayOrder    int        `json:"display_order"`
}

// UpdateEventRequest represents an update event request
type UpdateEventRequest struct {
	Slug            *string       `json:"slug"`
	Title           *string       `json:"title"`
	ClientName      *string       `json:"client_name"`
	EventDate       *time.Time    `json:"event_date"`
	EventType       *string       `json:"event_type"`
	Location        *string       `json:"location"`
	Description     *string       `json:"description"`
	Images          *[]string     `json:"images"`
	FeaturedImage   *string       `json:"featured_image"`
	GalleryImages   *[]string     `json:"gallery_images"`
	Budget          *string       `json:"budget"`
	GuestCount      *int          `json:"guest_count"`
	Vendors         *[]string     `json:"vendors"`
	Testimonial     *string       `json:"testimonial"`
	MetaTitle       *string       `json:"meta_title"`
	MetaDescription *string       `json:"meta_description"`
	Status          *EventStatus  `json:"status"`
	DisplayOrder    *int          `json:"display_order"`
}

// ReorderEventsRequest represents a reorder events request
type ReorderEventsRequest struct {
	Events []EventOrderItem `json:"events" binding:"required"`
}

// EventOrderItem represents an event with its display order
type EventOrderItem struct {
	ID           string `json:"id" binding:"required"`
	DisplayOrder int    `json:"display_order" binding:"required"`
}

// EventsResponse represents the response for events list
type EventsResponse struct {
	Items []Event `json:"items"`
}

// EventItemResponse represents the response for a single event
type EventItemResponse struct {
	Item Event `json:"item"`
}
