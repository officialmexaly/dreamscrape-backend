package public

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/models"
	"dreamscape-backend/backend/handlers/common"
)

// CompleteBookingHandler handles complete booking CRUD operations
type CompleteBookingHandler struct {
}

// NewCompleteBookingHandler creates a new complete booking handler
func NewCompleteBookingHandler() *CompleteBookingHandler {
	return &CompleteBookingHandler{}
}

// GetBookings retrieves all bookings (admin only)
// @Summary      Get all bookings
// @Description  Retrieve all bookings (admin only)
// @Tags         admin-bookings
// @Accept       json
// @Produce      json
// @Success      200  {object}  models.BookingsResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/bookings [get]
func (h *CompleteBookingHandler) GetBookings(c *gin.Context) {
	if database.GetClient() != nil {
		h.getBookingsViaSupabase(c)
		return
	}

	if h.pool != nil {
		h.getBookingsViaPostgreSQL(c)
		return
	}

	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *CompleteBookingHandler) getBookingsViaSupabase(c *gin.Context) {
	startTime := time.Now()

	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	// Query all bookings using Supabase REST API
	filters := map[string]string{
		"order": "created_at.desc",
	}

	bookingsData, err := supabaseClient.Select("bookings", filters)
	if err != nil {
		log.Printf("Error querying bookings via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve bookings"})
		return
	}

	log.Printf("✅ Retrieved %d bookings via Supabase in %v", len(bookingsData), time.Since(startTime))

	c.JSON(http.StatusOK, map[string]interface{}{
		"items": bookingsData,
	})
}

func (h *CompleteBookingHandler) getBookingsViaPostgreSQL(c *gin.Context) {
	startTime := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT id, first_name, last_name, email, phone, event_date, event_location,
		       event_types, budget, guests, how_did_you_hear, additional_details,
		       consultation_date, consultation_time, file_urls, file_names, created_at, updated_at
		FROM bookings
		ORDER BY created_at DESC`

	rows, err := h.pool.Query(ctx, query)
	if err != nil {
		log.Printf("Error querying bookings: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve bookings"})
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
			log.Printf("Error scanning booking row: %v", err)
			continue
		}
		bookings = append(bookings, booking)
	}

	log.Printf("✅ Retrieved %d bookings via PostgreSQL in %v", len(bookings), time.Since(startTime))
	c.JSON(http.StatusOK, models.BookingsResponse{Items: bookings})
}

// GetBookingByID retrieves a single booking by ID (admin only)
// @Summary      Get booking by ID
// @Description  Retrieve a single booking by its ID (admin only)
// @Tags         admin-bookings
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Booking ID"
// @Success      200  {object}  models.BookingItemResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/bookings/:id [get]
func (h *CompleteBookingHandler) GetBookingByID(c *gin.Context) {
	id := c.Param("id")

	if database.GetClient() != nil {
		h.getBookingByIDViaSupabase(c, id)
		return
	}

	if h.pool != nil {
		h.getBookingByIDViaPostgreSQL(c, id)
		return
	}

	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *CompleteBookingHandler) getBookingByIDViaSupabase(c *gin.Context, id string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	filters := map[string]string{
		"id": "eq." + id,
	}

	bookingsData, err := supabaseClient.Select("bookings", filters)
	if err != nil {
		log.Printf("Error querying booking by ID via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve booking"})
		return
	}

	if len(bookingsData) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Booking not found"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"item": bookingsData[0],
	})
}

func (h *CompleteBookingHandler) getBookingByIDViaPostgreSQL(c *gin.Context, id string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT id, first_name, last_name, email, phone, event_date, event_location,
		       event_types, budget, guests, how_did_you_hear, additional_details,
		       consultation_date, consultation_time, file_urls, file_names, created_at, updated_at
		FROM bookings
		WHERE id = $1`

	var booking models.Booking
	err := h.pool.QueryRow(ctx, query, id).Scan(
		&booking.ID, &booking.FirstName, &booking.LastName, &booking.Email, &booking.Phone,
		&booking.EventDate, &booking.EventLocation, &booking.EventTypes, &booking.Budget,
		&booking.Guests, &booking.HowDidYouHear, &booking.AdditionalDetails,
		&booking.ConsultationDate, &booking.ConsultationTime, &booking.FileURLs,
		&booking.FileNames, &booking.CreatedAt, &booking.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error querying booking by ID: %v", err)
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Booking not found"})
		return
	}

	c.JSON(http.StatusOK, models.BookingItemResponse{Item: booking})
}

// UpdateBooking updates an existing booking (admin only)
// @Summary      Update booking
// @Description  Update an existing booking (admin only)
// @Tags         admin-bookings
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Booking ID"
// @Param        booking   body      models.UpdateBookingRequest  true  "Booking data"
// @Success      200  {object}  models.BookingItemResponse
// @Failure      400  {object}  models.ErrorResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/bookings/:id [put]
func (h *CompleteBookingHandler) UpdateBooking(c *gin.Context) {
	id := c.Param("id")

	if database.GetClient() != nil {
		h.updateBookingViaSupabase(c, id)
		return
	}

	if h.pool != nil {
		h.updateBookingViaPostgreSQL(c, id)
		return
	}

	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *CompleteBookingHandler) updateBookingViaSupabase(c *gin.Context, id string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	var req models.UpdateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	bookingData := map[string]interface{}{}

	if req.FirstName != nil {
		bookingData["first_name"] = *req.FirstName
	}
	if req.LastName != nil {
		bookingData["last_name"] = *req.LastName
	}
	if req.Email != nil {
		bookingData["email"] = *req.Email
	}
	if req.Phone != nil {
		bookingData["phone"] = *req.Phone
	}
	if req.EventDate != nil {
		bookingData["event_date"] = *req.EventDate
	}
	if req.EventLocation != nil {
		bookingData["event_location"] = *req.EventLocation
	}
	if req.EventTypes != nil {
		bookingData["event_types"] = *req.EventTypes
	}
	if req.Budget != nil {
		bookingData["budget"] = *req.Budget
	}
	if req.Guests != nil {
		bookingData["guests"] = *req.Guests
	}
	if req.HowDidYouHear != nil {
		bookingData["how_did_you_hear"] = *req.HowDidYouHear
	}
	if req.AdditionalDetails != nil {
		bookingData["additional_details"] = *req.AdditionalDetails
	}
	if req.ConsultationDate != nil {
		bookingData["consultation_date"] = *req.ConsultationDate
	}
	if req.ConsultationTime != nil {
		bookingData["consultation_time"] = *req.ConsultationTime
	}
	if req.FileURLs != nil {
		bookingData["file_urls"] = *req.FileURLs
	}
	if req.FileNames != nil {
		bookingData["file_names"] = *req.FileNames
	}

	result, err := supabaseClient.Update("bookings", id, bookingData)
	if err != nil {
		log.Printf("Error updating booking via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update booking"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"item":    result,
		"message": "Booking updated successfully",
	})
}

func (h *CompleteBookingHandler) updateBookingViaPostgreSQL(c *gin.Context, id string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var req models.UpdateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	query := "UPDATE bookings SET updated_at = NOW()"
	args := []interface{}{}
	argCount := 1

	if req.FirstName != nil {
		query += ", first_name = $" + common.SqlParam(argCount)
		args = append(args, *req.FirstName)
		argCount++
	}
	if req.LastName != nil {
		query += ", last_name = $" + common.SqlParam(argCount)
		args = append(args, *req.LastName)
		argCount++
	}
	if req.Email != nil {
		query += ", email = $" + common.SqlParam(argCount)
		args = append(args, *req.Email)
		argCount++
	}
	if req.Phone != nil {
		query += ", phone = $" + common.SqlParam(argCount)
		args = append(args, *req.Phone)
		argCount++
	}
	if req.EventDate != nil {
		query += ", event_date = $" + common.SqlParam(argCount)
		args = append(args, *req.EventDate)
		argCount++
	}
	if req.EventLocation != nil {
		query += ", event_location = $" + common.SqlParam(argCount)
		args = append(args, *req.EventLocation)
		argCount++
	}
	if req.Budget != nil {
		query += ", budget = $" + common.SqlParam(argCount)
		args = append(args, *req.Budget)
		argCount++
	}
	if req.Guests != nil {
		query += ", guests = $" + common.SqlParam(argCount)
		args = append(args, *req.Guests)
		argCount++
	}
	if req.HowDidYouHear != nil {
		query += ", how_did_you_hear = $" + common.SqlParam(argCount)
		args = append(args, *req.HowDidYouHear)
		argCount++
	}
	if req.AdditionalDetails != nil {
		query += ", additional_details = $" + common.SqlParam(argCount)
		args = append(args, *req.AdditionalDetails)
		argCount++
	}
	if req.ConsultationDate != nil {
		query += ", consultation_date = $" + common.SqlParam(argCount)
		args = append(args, *req.ConsultationDate)
		argCount++
	}
	if req.ConsultationTime != nil {
		query += ", consultation_time = $" + common.SqlParam(argCount)
		args = append(args, *req.ConsultationTime)
		argCount++
	}
	if req.FileURLs != nil {
		query += ", file_urls = $" + common.SqlParam(argCount)
		args = append(args, *req.FileURLs)
		argCount++
	}
	if req.FileNames != nil {
		query += ", file_names = $" + common.SqlParam(argCount)
		args = append(args, *req.FileNames)
		argCount++
	}

	query += " WHERE id = $" + common.SqlParam(argCount) + " RETURNING *"
	args = append(args, id)

	var booking models.Booking
	err := h.pool.QueryRow(ctx, query, args...).Scan(
		&booking.ID, &booking.FirstName, &booking.LastName, &booking.Email, &booking.Phone,
		&booking.EventDate, &booking.EventLocation, &booking.EventTypes, &booking.Budget,
		&booking.Guests, &booking.HowDidYouHear, &booking.AdditionalDetails,
		&booking.ConsultationDate, &booking.ConsultationTime, &booking.FileURLs,
		&booking.FileNames, &booking.CreatedAt, &booking.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error updating booking: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update booking"})
		return
	}

	c.JSON(http.StatusOK, models.BookingItemResponse{Item: booking})
}

// DeleteBooking deletes a booking (admin only)
// @Summary      Delete booking
// @Description  Delete a booking (admin only)
// @Tags         admin-bookings
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Booking ID"
// @Success      200  {object}  models.SuccessResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/bookings/:id [delete]
func (h *CompleteBookingHandler) DeleteBooking(c *gin.Context) {
	id := c.Param("id")

	if database.GetClient() != nil {
		h.deleteBookingViaSupabase(c, id)
		return
	}

	if h.pool != nil {
		h.deleteBookingViaPostgreSQL(c, id)
		return
	}

	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *CompleteBookingHandler) deleteBookingViaSupabase(c *gin.Context, id string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	err := supabaseClient.Delete("bookings", id)
	if err != nil {
		log.Printf("Error deleting booking via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete booking"})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Message: "Booking deleted successfully",
	})
}

func (h *CompleteBookingHandler) deleteBookingViaPostgreSQL(c *gin.Context, id string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := "DELETE FROM bookings WHERE id = $1"
	result, err := h.pool.Exec(ctx, query, id)
	if err != nil {
		log.Printf("Error deleting booking: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete booking"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Booking not found"})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Message: "Booking deleted successfully",
	})
}

// UpdateBookingStatus is not supported by the current schema.
func (h *CompleteBookingHandler) UpdateBookingStatus(c *gin.Context) {
	c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Booking status is not stored in the current schema"})
}
