package admin

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"dreamscape-backend/internal/handlers/common"
	"dreamscape-backend/internal/models"
	"dreamscape-backend/pkg/errors"
)

// AdminBookingHandler handles admin booking endpoints
type AdminBookingHandler struct {
	db *pgxpool.Pool
}

// NewAdminBookingHandler creates a new admin booking handler
func NewAdminBookingHandler(db *pgxpool.Pool) *AdminBookingHandler {
	return &AdminBookingHandler{db: db}
}

// GetBookings retrieves all bookings
func (h *AdminBookingHandler) GetBookings(c *gin.Context) {
	ctx := context.Background()
	limit := 100

	// Build query
	query := `
		SELECT id, first_name, last_name, email, phone, event_date, event_location,
		       event_types, budget, guests, how_did_you_hear, additional_details,
		       consultation_date, consultation_time, file_urls, file_names, created_at, updated_at
		FROM bookings
		WHERE 1=1
	`

	args := []interface{}{}
	argCount := 1

	query += " ORDER BY created_at DESC LIMIT $" + common.SqlParam(argCount)
	args = append(args, limit)

	rows, err := h.db.Query(ctx, query, args...)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer rows.Close()

	var bookings []models.Booking
	for rows.Next() {
		var booking models.Booking
		err := rows.Scan(
			&booking.ID, &booking.FirstName, &booking.LastName, &booking.Email, &booking.Phone,
			&booking.EventDate, &booking.EventLocation, &booking.EventTypes, &booking.Budget,
			&booking.Guests, &booking.HowDidYouHear, &booking.AdditionalDetails,
			&booking.ConsultationDate, &booking.ConsultationTime, &booking.FileURLs,
			&booking.FileNames, &booking.CreatedAt, &booking.UpdatedAt,
		)
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}
		bookings = append(bookings, booking)
	}

	if err := rows.Err(); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, bookings)
}

// GetBookingByID retrieves a single booking by ID
func (h *AdminBookingHandler) GetBookingByID(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()

	var booking models.Booking
	err := h.db.QueryRow(ctx,
		`SELECT id, first_name, last_name, email, phone, event_date, event_location,
		       event_types, budget, guests, how_did_you_hear, additional_details,
		       consultation_date, consultation_time, file_urls, file_names, created_at, updated_at
		 FROM bookings WHERE id = $1`, id).Scan(
		&booking.ID, &booking.FirstName, &booking.LastName, &booking.Email, &booking.Phone,
		&booking.EventDate, &booking.EventLocation, &booking.EventTypes, &booking.Budget,
		&booking.Guests, &booking.HowDidYouHear, &booking.AdditionalDetails,
		&booking.ConsultationDate, &booking.ConsultationTime, &booking.FileURLs,
		&booking.FileNames, &booking.CreatedAt, &booking.UpdatedAt,
	)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("Booking not found"))
		return
	}

	common.SuccessResponse(c, http.StatusOK, booking)
}

// UpdateBookingStatus is not supported because the current bookings schema does not store a status column.
func (h *AdminBookingHandler) UpdateBookingStatus(c *gin.Context) {
	c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Booking status is not stored in the current schema"})
}

// DeleteBooking deletes a booking
func (h *AdminBookingHandler) DeleteBooking(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()

	_, err := h.db.Exec(ctx, "DELETE FROM bookings WHERE id = $1", id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Booking deleted successfully")
}

// CancelBooking is not supported by the current schema.
func (h *AdminBookingHandler) CancelBooking(c *gin.Context) {
	c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Booking status is not stored in the current schema"})
}

// ConfirmBooking is not supported by the current schema.
func (h *AdminBookingHandler) ConfirmBooking(c *gin.Context) {
	c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Booking status is not stored in the current schema"})
}
