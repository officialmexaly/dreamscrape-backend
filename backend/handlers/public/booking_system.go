package public

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"

	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/backend/models"
	"dreamscape-backend/pkg/config"
	"dreamscape-backend/pkg/errors"
)

// BookingSystemHandler handles complete booking operations with Calendly integration
type BookingSystemHandler struct {
	calendlyToken string
}

// NewBookingSystemHandler creates a new booking system handler
func NewBookingSystemHandler() *BookingSystemHandler {
	return &BookingSystemHandler{
		calendlyToken: config.AppConfig.CalendlyToken,
	}
}

// CalendlyAvailability represents Calendly availability response
type CalendlyAvailability struct {
	Days []struct {
		Date  string `json:"date"`
		Slots []struct {
			Start string `json:"start"`
			End   string `json:"end"`
		} `json:"slots"`
	} `json:"days"`
}

// CreateBooking creates a new consultation booking with Calendly integration
func (h *BookingSystemHandler) CreateBooking(c *gin.Context) {
	if database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	var req models.CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErr := errors.NewValidationError("Invalid request body")
		validationErr.AddField("error", err.Error())
		common.ValidationErrorResponse(c, validationErr)
		return
	}

	// Validate required fields
	if req.FirstName == "" || req.LastName == "" || req.Email == "" || req.ConsultationTime == "" {
		common.ErrorResponse(c, errors.BadRequest("first_name, last_name, email, and consultation_time are required"))
		return
	}

	// Format consultation date
	consultationDateStr := req.ConsultationDate.Format("2006-01-02")
	bookingDateTime, err := time.Parse("2006-01-02 15:04", fmt.Sprintf("%s %s", consultationDateStr, req.ConsultationTime))
	if err != nil {
		common.ErrorResponse(c, errors.BadRequest("Invalid consultation time format"))
		return
	}

	// Check database conflicts first
	filters := map[string]string{
		"consultation_date": consultationDateStr,
		"consultation_time": req.ConsultationTime,
	}

	existing, _ := database.SupabaseClient.Select("bookings", filters)
	if len(existing) > 0 {
		common.ErrorResponse(c, errors.Conflict("This time slot is already booked"))
		return
	}

	// Check Calendly availability if token is configured
	var calendlyEventURI string
	if h.calendlyToken != "" {
		available, err := h.checkCalendlyAvailability(consultationDateStr, req.ConsultationTime)
		if err != nil {
			log.Printf("Warning: Could not check Calendly availability: %v", err)
		} else if !available {
			common.ErrorResponse(c, errors.Conflict("This time slot is not available in Calendly"))
			return
		}

		// Create Calendly booking
		eventURI, err := h.createCalendlyBooking(req, bookingDateTime)
		if err != nil {
			log.Printf("Warning: Could not create Calendly booking: %v", err)
		} else {
			calendlyEventURI = eventURI
		}
	}

	// Create booking data
	bookingData := map[string]interface{}{
		"first_name":           req.FirstName,
		"last_name":            req.LastName,
		"email":                req.Email,
		"phone":                req.Phone,
		"consultation_date":    consultationDateStr,
		"consultation_time":    req.ConsultationTime,
		"status":               "confirmed",
		"calendly_event_uri":   calendlyEventURI,
		"additional_details":   req.AdditionalDetails,
		"event_location":       req.EventLocation,
		"event_date":           req.EventDate,
		"event_types":          req.EventTypes,
		"budget":               req.Budget,
		"guests":               req.Guests,
		"how_did_you_hear":     req.HowDidYouHear,
		"file_urls":            req.FileURLs,
		"file_names":           req.FileNames,
		"created_at":           time.Now().Format(time.RFC3339),
		"updated_at":           time.Now().Format(time.RFC3339),
	}

	// Insert via Supabase
	result, err := database.SupabaseClient.Insert("bookings", bookingData)
	if err != nil {
		log.Printf("Error creating booking: %v", err)
		common.ErrorResponse(c, errors.InternalServerError("Failed to create booking"))
		return
	}

	// Send confirmation email (in background)
	go h.sendConfirmationEmail(req, bookingDateTime)

	// Add to Google Calendar (in background)
	go h.addToGoogleCalendar(req, bookingDateTime)

	c.JSON(http.StatusCreated, map[string]interface{}{
		"success":            true,
		"message":            "Booking created successfully",
		"booking":            result,
		"calendly_created":   calendlyEventURI != "",
	})
}



func (h *BookingSystemHandler) getCalendlyAvailability(startDate, endDate string) (map[string][]string, error) {
	// Get the event type URI from environment
	eventTypeURI := os.Getenv("CALENDLY_EVENT_TYPE_URI")
	if eventTypeURI == "" {
		return nil, fmt.Errorf("CALENDLY_EVENT_TYPE_URI not configured")
	}

	// Parse dates
	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return nil, err
	}

	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		return nil, err
	}

	// Add one day to end to include the full end date
	end = end.AddDate(0, 0, 1)

	// Call Calendly's event_type_available_times API
	url := fmt.Sprintf("https://api.calendly.com/event_type_available_times?event_type=%s&start_time=%s&end_time=%s",
		eventTypeURI,
		start.Format(time.RFC3339),
		end.Format(time.RFC3339))

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", h.calendlyToken))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Calendly API returned status %d: %s", resp.StatusCode, string(body))
	}

	// Parse the response - returns available slots
	var result struct {
		Collection []struct {
			StartTime string `json:"start_time"`
			Status    string `json:"status"`
		} `json:"collection"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	// Group slots by date
	availability := make(map[string][]string)
	loc, _ := time.LoadLocation("America/New_York")

	for _, slot := range result.Collection {
		if slot.Status != "available" {
			continue
		}

		// Parse the start time
		slotTime, err := time.Parse(time.RFC3339, slot.StartTime)
		if err != nil {
			continue
		}

		// Convert to local timezone and extract date and time
		localTime := slotTime.In(loc)
		dateStr := localTime.Format("2006-01-02")
		timeStr := localTime.Format("15:04")

		if availability[dateStr] == nil {
			availability[dateStr] = []string{}
		}
		availability[dateStr] = append(availability[dateStr], timeStr)
	}

	log.Printf("Calendly actual availability for %s to %s: %+v", startDate, endDate, availability)

	return availability, nil
}

// GetAvailability checks availability for a date range
func (h *BookingSystemHandler) GetAvailability(c *gin.Context) {
	if database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate == "" || endDate == "" {
		common.ErrorResponse(c, errors.BadRequest("start_date and end_date are required"))
		return
	}

	// Parse dates
	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		common.ErrorResponse(c, errors.BadRequest("Invalid start_date format. Use YYYY-MM-DD"))
		return
	}

	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		common.ErrorResponse(c, errors.BadRequest("Invalid end_date format. Use YYYY-MM-DD"))
		return
	}

	// Get existing bookings for the date range
	filters := map[string]string{
		"consultation_date": fmt.Sprintf("gte.%s", startDate),
	}

	bookingsData, err := database.SupabaseClient.Select("bookings", filters)
	if err != nil {
		log.Printf("Error querying bookings: %v", err)
		common.ErrorResponse(c, errors.InternalServerError("Failed to check availability"))
		return
	}

	// Get Calendly availability if token is configured
	var calendlyAvailable map[string][]string
	if h.calendlyToken != "" {
		calendlyAvailable, err = h.getCalendlyAvailability(startDate, endDate)
		if err != nil {
			log.Printf("Warning: Could not get Calendly availability: %v", err)
		}
	}

	// Define available time slots (9 AM - 5 PM, 1-hour slots)
	availableSlots := make(map[string][]map[string]string)

	currentDate := start
	for currentDate.Before(end) || currentDate.Equal(end) {
		dateStr := currentDate.Format("2006-01-02")
		slots := []map[string]string{}

		// Use Calendly time slots directly if available, otherwise no slots
		var timeSlotsToCheck []string
		if h.calendlyToken != "" && len(calendlyAvailable) > 0 {
			if dateSlots, exists := calendlyAvailable[dateStr]; exists {
				timeSlotsToCheck = dateSlots
			}
			// If no Calendly availability for this day, timeSlotsToCheck remains empty (no slots available)
		} else {
			// Fallback to default time slots if no Calendly integration
			for hour := 9; hour < 17; hour++ {
				timeSlotsToCheck = append(timeSlotsToCheck, fmt.Sprintf("%02d:00", hour))
			}
		}

		// Process each time slot
		for _, timeSlot := range timeSlotsToCheck {
			available := true

			// Check database conflicts (mark as unavailable if already booked)
			for _, booking := range bookingsData {
				if bookingDate, ok := booking["consultation_date"].(string); ok {
					if bookingDate == dateStr {
						if bookingTime, ok := booking["consultation_time"].(string); ok {
							if bookingTime == timeSlot {
								available = false
								break
							}
						}
					}
				}
			}

			slots = append(slots, map[string]string{
				"time":      timeSlot,
				"available": fmt.Sprintf("%t", available),
				"date":      dateStr,
			})
		}

		availableSlots[dateStr] = slots
		currentDate = currentDate.AddDate(0, 0, 1)
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"start_date":      startDate,
		"end_date":        endDate,
		"available_slots": availableSlots,
		"total_days":      len(availableSlots),
		"calendly_sync":   h.calendlyToken != "",
	})
}

// GetTakenSlots gets already booked slots for a specific date
func (h *BookingSystemHandler) GetTakenSlots(c *gin.Context) {
	if database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	date := c.Query("date")
	if date == "" {
		common.ErrorResponse(c, errors.BadRequest("date parameter is required"))
		return
	}

	// Validate date format
	_, err := time.Parse("2006-01-02", date)
	if err != nil {
		common.ErrorResponse(c, errors.BadRequest("Invalid date format. Use YYYY-MM-DD"))
		return
	}

	// Get bookings for this date
	filters := map[string]string{
		"consultation_date": date,
	}

	bookingsData, err := database.SupabaseClient.Select("bookings", filters)
	if err != nil {
		log.Printf("Error querying bookings: %v", err)
		common.ErrorResponse(c, errors.InternalServerError("Failed to get taken slots"))
		return
	}

	takenSlots := []map[string]string{}
	for _, booking := range bookingsData {
		if bookingTime, ok := booking["consultation_time"].(string); ok {
			takenSlots = append(takenSlots, map[string]string{
				"time":  bookingTime,
				"date":  date,
				"status": "booked",
			})
		}
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"date":        date,
		"taken_slots": takenSlots,
		"total_taken": len(takenSlots),
	})
}

// GetBookings retrieves all bookings (admin)
func (h *BookingSystemHandler) GetBookings(c *gin.Context) {
	if database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	// Get query parameters for filtering
	status := c.Query("status")
	date := c.Query("date")

	filters := map[string]string{}
	if status != "" {
		filters["status"] = status
	}
	if date != "" {
		filters["consultation_date"] = date
	}

	bookingsData, err := database.SupabaseClient.Select("bookings", filters)
	if err != nil {
		log.Printf("Error querying bookings: %v", err)
		common.ErrorResponse(c, errors.InternalServerError("Failed to retrieve bookings"))
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"success":  true,
		"bookings": bookingsData,
		"total":    len(bookingsData),
	})
}

// GetBookingByID retrieves a booking by ID (admin)
func (h *BookingSystemHandler) GetBookingByID(c *gin.Context) {
	if database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	id := c.Param("id")

	filters := map[string]string{
		"id": id,
	}

	bookingsData, err := database.SupabaseClient.Select("bookings", filters)
	if err != nil {
		log.Printf("Error querying booking: %v", err)
		common.ErrorResponse(c, errors.InternalServerError("Failed to retrieve booking"))
		return
	}

	if len(bookingsData) == 0 {
		common.ErrorResponse(c, errors.NotFound("Booking not found"))
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"booking": bookingsData[0],
	})
}

// UpdateBooking updates a booking (admin)
func (h *BookingSystemHandler) UpdateBooking(c *gin.Context) {
	if database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	id := c.Param("id")
	var req models.UpdateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErr := errors.NewValidationError("Invalid request body")
		validationErr.AddField("error", err.Error())
		common.ValidationErrorResponse(c, validationErr)
		return
	}

	// Build update data
	updateData := map[string]interface{}{
		"updated_at": time.Now().Format(time.RFC3339),
	}

	if req.FirstName != nil {
		updateData["first_name"] = *req.FirstName
	}
	if req.LastName != nil {
		updateData["last_name"] = *req.LastName
	}
	if req.Email != nil {
		updateData["email"] = *req.Email
	}
	if req.Phone != nil {
		updateData["phone"] = *req.Phone
	}
	if req.ConsultationDate != nil {
		updateData["consultation_date"] = req.ConsultationDate.Format("2006-01-02")
	}
	if req.ConsultationTime != nil {
		updateData["consultation_time"] = *req.ConsultationTime
	}
	if req.EventLocation != nil {
		updateData["event_location"] = *req.EventLocation
	}
	if req.EventTypes != nil {
		updateData["event_types"] = *req.EventTypes
	}
	if req.Budget != nil {
		updateData["budget"] = *req.Budget
	}
	if req.Guests != nil {
		updateData["guests"] = *req.Guests
	}
	if req.HowDidYouHear != nil {
		updateData["how_did_you_hear"] = *req.HowDidYouHear
	}
	if req.AdditionalDetails != nil {
		updateData["additional_details"] = *req.AdditionalDetails
	}
	if req.FileURLs != nil {
		updateData["file_urls"] = *req.FileURLs
	}
	if req.FileNames != nil {
		updateData["file_names"] = *req.FileNames
	}

	// Update via Supabase
	result, err := database.SupabaseClient.Update("bookings", id, updateData)
	if err != nil {
		log.Printf("Error updating booking: %v", err)
		common.ErrorResponse(c, errors.NotFound("Booking not found"))
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Booking updated successfully",
		"booking": result,
	})
}

// DeleteBooking deletes a booking (admin)
func (h *BookingSystemHandler) DeleteBooking(c *gin.Context) {
	if database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	id := c.Param("id")

	// Get booking details first to cancel Calendly event if exists
	filters := map[string]string{"id": id}
	bookingsData, _ := database.SupabaseClient.Select("bookings", filters)
	if len(bookingsData) > 0 {
		if eventURI, ok := bookingsData[0]["calendly_event_uri"].(string); ok && eventURI != "" {
			h.cancelCalendlyBooking(eventURI)
		}
	}

	err := database.SupabaseClient.Delete("bookings", id)
	if err != nil {
		log.Printf("Error deleting booking: %v", err)
		common.ErrorResponse(c, errors.NotFound("Booking not found"))
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Booking deleted successfully",
	})
}

// Calendly integration methods

func (h *BookingSystemHandler) checkCalendlyAvailability(date, timeStr string) (bool, error) {
	// Get the user's availability schedule for the specific date
	availability, err := h.getCalendlyAvailability(date, date)
	if err != nil {
		return false, err
	}

	// Check if the requested time slot is available for this date
	if slots, exists := availability[date]; exists {
		for _, slot := range slots {
			if slot == timeStr {
				log.Printf("Calendly availability check for %s %s: available (found in schedule)", date, timeStr)
				return true, nil
			}
		}
		log.Printf("Calendly availability check for %s %s: not available (not in schedule)", date, timeStr)
		return false, nil
	}

	log.Printf("Calendly availability check for %s %s: not available (no schedule for this date)", date, timeStr)
	return false, nil
}

func (h *BookingSystemHandler) createCalendlyBooking(req models.CreateBookingRequest, bookingTime time.Time) (string, error) {
	// Get current user's Calendly event types
	eventTypes, err := h.getCalendlyEventTypes()
	if err != nil {
		return "", err
	}

	if len(eventTypes) == 0 {
		return "", fmt.Errorf("no Calendly event types found")
	}

	// Create booking using first event type
	eventType := eventTypes[0]

	// Use URI or ID from event type
	var eventTypeID string
	if uri, ok := eventType["uri"].(string); ok && uri != "" {
		eventTypeID = uri
	} else if id, ok := eventType["id"].(string); ok && id != "" {
		eventTypeID = id
	} else {
		return "", fmt.Errorf("event type URI/ID not found")
	}

	// Build name from first_name and last_name
	name := fmt.Sprintf("%s %s", req.FirstName, req.LastName)

	bookingData := map[string]interface{}{
		"event_type_id": eventTypeID,
		"start_time":    bookingTime.Format(time.RFC3339),
		"email":         req.Email,
		"name":          name,
		"phone":         req.Phone,
		"notes":         req.AdditionalDetails,
	}

	jsonData, err := json.Marshal(bookingData)
	if err != nil {
		return "", err
	}

	httpReq, err := http.NewRequest("POST", "https://api.calendly.com/scheduled_events", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", h.calendlyToken))
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Calendly API returned status %d: %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if uri, ok := result["uri"].(string); ok {
		return uri, nil
	}

	return "", fmt.Errorf("no URI in Calendly response")
}

func (h *BookingSystemHandler) getCalendlyEventTypes() ([]map[string]interface{}, error) {
	// First get the current user's URI
	userReq, err := http.NewRequest("GET", "https://api.calendly.com/users/me", nil)
	if err != nil {
		return nil, err
	}

	userReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", h.calendlyToken))
	userReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	userResp, err := client.Do(userReq)
	if err != nil {
		return nil, err
	}
	defer userResp.Body.Close()

	if userResp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(userResp.Body)
		return nil, fmt.Errorf("Calendly user API returned status %d: %s", userResp.StatusCode, string(body))
	}

	var userResult map[string]interface{}
	if err := json.NewDecoder(userResp.Body).Decode(&userResult); err != nil {
		return nil, err
	}

	userURI, ok := userResult["resource"].(map[string]interface{})["uri"].(string)
	if !ok {
		return nil, fmt.Errorf("could not get user URI from Calendly response")
	}

	log.Printf("Calendly user URI: %s", userURI)

	// Now get event types with the user parameter
	url := fmt.Sprintf("https://api.calendly.com/event_types?user=%s", userURI)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", h.calendlyToken))
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("Calendly event types API returned status %d: %s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("Calendly API returned status %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	log.Printf("Calendly event types response: %+v", result)

	if collection, ok := result["collection"].([]interface{}); ok {
		eventTypes := []map[string]interface{}{}
		for _, item := range collection {
			if eventType, ok := item.(map[string]interface{}); ok {
				eventTypes = append(eventTypes, eventType)
			}
		}
		log.Printf("Found %d Calendly event types", len(eventTypes))
		return eventTypes, nil
	}

	return nil, fmt.Errorf("no event types found")
}

func (h *BookingSystemHandler) cancelCalendlyBooking(eventURI string) error {
	req, err := http.NewRequest("DELETE", eventURI, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", h.calendlyToken))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Calendly API returned status %d", resp.StatusCode)
	}

	return nil
}

func (h *BookingSystemHandler) sendConfirmationEmail(req models.CreateBookingRequest, bookingTime time.Time) {
	// TODO: Implement email sending logic
	// This would integrate with your email service (Resend, SendGrid, etc.)
	name := fmt.Sprintf("%s %s", req.FirstName, req.LastName)
	log.Printf("Sending confirmation email to %s (%s) for booking at %s", req.Email, name, bookingTime.Format("2006-01-02 15:04"))
}

func (h *BookingSystemHandler) addToGoogleCalendar(req models.CreateBookingRequest, bookingTime time.Time) {
	// TODO: Implement Google Calendar integration
	// This would use Google Calendar API to add the booking
	name := fmt.Sprintf("%s %s", req.FirstName, req.LastName)
	log.Printf("Adding to Google Calendar: %s (%s) at %s", name, req.Email, bookingTime.Format("2006-01-02 15:04"))
}

func incrementHour(timeStr string) string {
	t, err := time.Parse("15:04", timeStr)
	if err != nil {
		return timeStr
	}
	t = t.Add(time.Hour)
	return t.Format("15:04")
}