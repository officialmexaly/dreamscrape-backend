package models

import (
	"time"
)

// BookingStatus represents booking status
type BookingStatus string

const (
	BookingStatusPending   BookingStatus = "pending"
	BookingStatusConfirmed BookingStatus = "confirmed"
	BookingStatusCancelled BookingStatus = "cancelled"
	BookingStatusCompleted BookingStatus = "completed"
)

// Booking represents a consultation booking
type Booking struct {
	ID                string    `json:"id" db:"id"`
	FirstName         string    `json:"first_name" db:"first_name"`
	LastName          string    `json:"last_name" db:"last_name"`
	Email             string    `json:"email" db:"email"`
	Phone             string    `json:"phone" db:"phone"`
	EventDate         *time.Time `json:"event_date,omitempty" db:"event_date"`
	EventLocation     string    `json:"event_location" db:"event_location"`
	EventTypes        []string  `json:"event_types" db:"event_types"`
	Budget            *string   `json:"budget,omitempty" db:"budget"`
	Guests            *string   `json:"guests,omitempty" db:"guests"`
	HowDidYouHear     string    `json:"how_did_you_hear" db:"how_did_you_hear"`
	AdditionalDetails string     `json:"additional_details" db:"additional_details"`
	ConsultationDate   time.Time `json:"consultation_date" db:"consultation_date"`
	ConsultationTime   string    `json:"consultation_time" db:"consultation_time"`
	FileURLs          []string  `json:"file_urls" db:"file_urls"`
	FileNames         []string  `json:"file_names" db:"file_names"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

// CreateBookingRequest represents a create booking request
type CreateBookingRequest struct {
	FirstName        string   `json:"first_name" binding:"required"`
	LastName         string   `json:"last_name" binding:"required"`
	Email            string   `json:"email" binding:"required,email"`
	Phone            string   `json:"phone" binding:"required"`
	EventDate        *time.Time `json:"event_date"`
	EventLocation    string   `json:"event_location"`
	EventTypes       []string `json:"event_types"`
	Budget           *string  `json:"budget"`
	Guests           *string  `json:"guests"`
	HowDidYouHear    string   `json:"how_did_you_hear"`
	AdditionalDetails string  `json:"additional_details"`
	ConsultationDate time.Time `json:"consultation_date" binding:"required"`
	ConsultationTime string   `json:"consultation_time" binding:"required"`
	FileURLs         []string `json:"file_urls"`
	FileNames        []string `json:"file_names"`
}

// UpdateBookingRequest represents an update booking request
type UpdateBookingRequest struct {
	FirstName        *string   `json:"first_name"`
	LastName         *string   `json:"last_name"`
	Email            *string   `json:"email"`
	Phone            *string   `json:"phone"`
	EventDate        *time.Time `json:"event_date"`
	EventLocation    *string   `json:"event_location"`
	EventTypes       *[]string `json:"event_types"`
	Budget           *string   `json:"budget"`
	Guests           *string   `json:"guests"`
	HowDidYouHear    *string   `json:"how_did_you_hear"`
	AdditionalDetails *string  `json:"additional_details"`
	ConsultationDate *time.Time `json:"consultation_date"`
	ConsultationTime *string   `json:"consultation_time"`
	FileURLs         *[]string `json:"file_urls"`
	FileNames        *[]string `json:"file_names"`
}
// AvailabilityRequest represents an availability check request
type AvailabilityRequest struct {
	Date string `json:"date" binding:"required"`
}

// TimeSlot represents an available time slot
type TimeSlot struct {
	Time     string `json:"time"`
	Available bool  `json:"available"`
}

// AvailabilityResponse represents availability check response
type AvailabilityResponse struct {
	Date      string     `json:"date"`
	Slots     []TimeSlot `json:"slots"`
}

// TakenSlotsResponse represents taken slots response
type TakenSlotsResponse struct {
	Date  string   `json:"date"`
	Slots []string `json:"slots"`
}

// BookingsResponse represents the response for bookings list
type BookingsResponse struct {
	Items []Booking `json:"items"`
}

// BookingItemResponse represents the response for a single booking
type BookingItemResponse struct {
	Item Booking `json:"item"`
}
