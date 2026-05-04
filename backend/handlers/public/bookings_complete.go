package public

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/models"
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

	if false {
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
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to the new booking system"})
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

	if false {
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
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to the new booking system"})
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

	if false {
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
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to the new booking system"})
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

	if false {
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
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to the new booking system"})
}

// UpdateBookingStatus is not supported by the current schema.
func (h *CompleteBookingHandler) UpdateBookingStatus(c *gin.Context) {
	c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Booking status is not stored in the current schema"})
}
