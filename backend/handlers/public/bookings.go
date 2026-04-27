package public

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"dreamscape-backend/backend/models"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/pkg/errors"
)

// BookingHandler handles booking endpoints
type BookingHandler struct {
	db *pgxpool.Pool
}

// NewBookingHandler creates a new booking handler
func NewBookingHandler(db *pgxpool.Pool) *BookingHandler {
	return &BookingHandler{db: db}
}

// CreateBooking creates a new booking consultation
func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var req models.CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	// Check if the consultation slot is available
	var slotCount int
	err := h.db.QueryRow(context.Background(),
		`SELECT COUNT(*) FROM bookings WHERE consultation_date = $1 AND consultation_time = $2`,
		req.ConsultationDate, req.ConsultationTime).Scan(&slotCount)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	if slotCount > 0 {
		common.ErrorResponse(c, errors.Conflict("This time slot is already booked"))
		return
	}

	ctx := context.Background()

	// Create booking
	var booking models.Booking
	err = h.db.QueryRow(ctx,
		`INSERT INTO bookings (first_name, last_name, email, phone, event_date, event_location,
		       event_types, budget, guests, how_did_you_hear, additional_details,
		       consultation_date, consultation_time, file_urls, file_names, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
		 RETURNING id, first_name, last_name, email, phone, event_date, event_location,
		         event_types, budget, guests, how_did_you_hear, additional_details,
		         consultation_date, consultation_time, file_urls, file_names, created_at, updated_at`,
		req.FirstName, req.LastName, req.Email, req.Phone, req.EventDate, req.EventLocation,
		req.EventTypes, req.Budget, req.Guests, req.HowDidYouHear, req.AdditionalDetails,
		req.ConsultationDate, req.ConsultationTime, req.FileURLs, req.FileNames).Scan(
		&booking.ID, &booking.FirstName, &booking.LastName, &booking.Email, &booking.Phone,
		&booking.EventDate, &booking.EventLocation, &booking.EventTypes, &booking.Budget,
		&booking.Guests, &booking.HowDidYouHear, &booking.AdditionalDetails,
		&booking.ConsultationDate, &booking.ConsultationTime, &booking.FileURLs,
		&booking.FileNames, &booking.CreatedAt, &booking.UpdatedAt)

	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// TODO: Send confirmation email
	// TODO: Create Google Calendar event

	common.SuccessResponse(c, http.StatusCreated, booking)
}

// GetAvailability checks booking availability for a specific date
func (h *BookingHandler) GetAvailability(c *gin.Context) {
	dateStr := c.Query("date")
	if dateStr == "" {
		common.ErrorResponse(c, errors.BadRequest("Date parameter required"))
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		common.ErrorResponse(c, errors.BadRequest("Invalid date format"))
		return
	}

	ctx := context.Background()

	// Get all booked slots for this date
	rows, err := h.db.Query(ctx,
		`SELECT consultation_time FROM bookings WHERE consultation_date = $1`, date)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer rows.Close()

	bookedSlots := make(map[string]bool)
	for rows.Next() {
		var slot string
		if err := rows.Scan(&slot); err != nil {
			common.ErrorResponse(c, err)
			return
		}
		bookedSlots[slot] = true
	}

	// Define available time slots (9 AM - 5 PM)
	availableSlots := []models.TimeSlot{
		{Time: "09:00", Available: true},
		{Time: "10:00", Available: true},
		{Time: "11:00", Available: true},
		{Time: "12:00", Available: true},
		{Time: "13:00", Available: true},
		{Time: "14:00", Available: true},
		{Time: "15:00", Available: true},
		{Time: "16:00", Available: true},
		{Time: "17:00", Available: true},
	}

	// Mark booked slots as unavailable
	for i := range availableSlots {
		if bookedSlots[availableSlots[i].Time] {
			availableSlots[i].Available = false
		}
	}

	response := models.AvailabilityResponse{
		Date:  dateStr,
		Slots: availableSlots,
	}

	common.SuccessResponse(c, http.StatusOK, response)
}

// GetTakenSlots retrieves all taken time slots for a specific date
func (h *BookingHandler) GetTakenSlots(c *gin.Context) {
	dateStr := c.Query("date")
	if dateStr == "" {
		common.ErrorResponse(c, errors.BadRequest("Date parameter required"))
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		common.ErrorResponse(c, errors.BadRequest("Invalid date format"))
		return
	}

	ctx := context.Background()

	// Get all booked slots for this date
	rows, err := h.db.Query(ctx,
		`SELECT consultation_time FROM bookings WHERE consultation_date = $1`, date)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer rows.Close()

	var slots []string
	for rows.Next() {
		var slot string
		if err := rows.Scan(&slot); err != nil {
			common.ErrorResponse(c, err)
			return
		}
		slots = append(slots, slot)
	}

	response := models.TakenSlotsResponse{
		Date:  dateStr,
		Slots: slots,
	}

	common.SuccessResponse(c, http.StatusOK, response)
}

// GetRealTimeAvailability provides real-time availability checking
func (h *BookingHandler) GetRealTimeAvailability(c *gin.Context) {
	dateStr := c.Query("date")
	if dateStr == "" {
		common.ErrorResponse(c, errors.BadRequest("Date parameter required"))
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		common.ErrorResponse(c, errors.BadRequest("Invalid date format"))
		return
	}

	ctx := context.Background()

	// Get all booked slots for this date with row-level locking
	rows, err := h.db.Query(ctx,
		`SELECT consultation_time FROM bookings WHERE consultation_date = $1 FOR UPDATE`, date)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer rows.Close()

	bookedSlots := make(map[string]bool)
	for rows.Next() {
		var slot string
		if err := rows.Scan(&slot); err != nil {
			common.ErrorResponse(c, err)
			return
		}
		bookedSlots[slot] = true
	}

	// Define available time slots
	availableSlots := []models.TimeSlot{
		{Time: "09:00", Available: true},
		{Time: "10:00", Available: true},
		{Time: "11:00", Available: true},
		{Time: "12:00", Available: true},
		{Time: "13:00", Available: true},
		{Time: "14:00", Available: true},
		{Time: "15:00", Available: true},
		{Time: "16:00", Available: true},
		{Time: "17:00", Available: true},
	}

	// Mark booked slots as unavailable
	for i := range availableSlots {
		if bookedSlots[availableSlots[i].Time] {
			availableSlots[i].Available = false
		}
	}

	response := models.AvailabilityResponse{
		Date:  dateStr,
		Slots: availableSlots,
	}

	common.SuccessResponse(c, http.StatusOK, response)
}
