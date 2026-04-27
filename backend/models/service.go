package models

import (
	"time"
)

// ServiceStatus represents service status
type ServiceStatus string

const (
	ServiceStatusDraft     ServiceStatus = "draft"
	ServiceStatusPublished ServiceStatus = "published"
	ServiceStatusArchived  ServiceStatus = "archived"
)

// Service represents a service offering
type Service struct {
	ID              string        `json:"id" db:"id"`
	Slug            string        `json:"slug" db:"slug"`
	Category        string        `json:"category" db:"category"`
	Title           string        `json:"title" db:"title"`
	Subtitle        string        `json:"subtitle" db:"subtitle"`
	Description     string        `json:"description" db:"description"`
	Image           string        `json:"image" db:"image"`
	ListItems       []string      `json:"list_items" db:"list_items"`
	CTAText         string        `json:"cta_text" db:"cta_text"`
	CTALink         string        `json:"cta_link" db:"cta_link"`
	Status          ServiceStatus `json:"status" db:"status"`
	DisplayOrder    int           `json:"display_order" db:"display_order"`
	CreatedAt       time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at" db:"updated_at"`
}

// CreateServiceRequest represents a create service request
type CreateServiceRequest struct {
	Slug            string        `json:"slug" binding:"required"`
	Category        string        `json:"category"`
	Title           string        `json:"title" binding:"required"`
	Subtitle        string        `json:"subtitle"`
	Description     string        `json:"description"`
	Image           string        `json:"image"`
	ListItems       []string      `json:"list_items"`
	CTAText         string        `json:"cta_text"`
	CTALink         string        `json:"cta_link"`
	Status          ServiceStatus `json:"status"`
	DisplayOrder    int           `json:"display_order"`
}

// UpdateServiceRequest represents an update service request
type UpdateServiceRequest struct {
	Slug            *string       `json:"slug"`
	Category        *string       `json:"category"`
	Title           *string       `json:"title"`
	Subtitle        *string       `json:"subtitle"`
	Description     *string       `json:"description"`
	Image           *string       `json:"image"`
	ListItems       *[]string     `json:"list_items"`
	CTAText         *string       `json:"cta_text"`
	CTALink         *string       `json:"cta_link"`
	Status          *ServiceStatus `json:"status"`
	DisplayOrder    *int          `json:"display_order"`
}

// ReorderServicesRequest represents a reorder services request
type ReorderServicesRequest struct {
	Services []ServiceOrderItem `json:"services" binding:"required"`
}

// ServiceOrderItem represents a service with its display order
type ServiceOrderItem struct {
	ID           string `json:"id" binding:"required"`
	DisplayOrder int    `json:"display_order" binding:"required"`
}

// ServicesResponse represents the response for services list
type ServicesResponse struct {
	Items []Service `json:"items"`
}

// ServiceItemResponse represents the response for a single service
type ServiceItemResponse struct {
	Item Service `json:"item"`
}
