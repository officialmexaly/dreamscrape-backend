package public

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/models"
)

// EventHandler handles public event operations
type EventHandler struct {
}

func NewEventHandler() *EventHandler {
	return &EventHandler{}
}

func (h *EventHandler) GetEvents(c *gin.Context) {
	h.getEventsViaSupabase(c)
}

func (h *EventHandler) getEventsViaSupabase(c *gin.Context) {
	startTime := time.Now()
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	filters := map[string]string{
		"status": "eq.published",
		"order":  "display_order.asc,created_at.desc",
	}

	eventsData, err := supabaseClient.Select("events", filters)
	if err != nil {
		log.Printf("Error querying events via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve events"})
		return
	}

	log.Printf("✅ Retrieved %d events via Supabase in %v", len(eventsData), time.Since(startTime))
	c.JSON(http.StatusOK, map[string]interface{}{"items": eventsData})
}


func (h *EventHandler) getEventsViaPostgreSQL(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
}

func (h *EventHandler) GetEventByID(c *gin.Context) {
	id := c.Param("id")
	if database.GetClient() != nil {
		h.getEventByIDViaSupabase(c, id)
		return
	}
	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *EventHandler) getEventByIDViaSupabase(c *gin.Context, id string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	filters := map[string]string{
		"id":     "eq." + id,
		"status": "eq.published",
	}

	eventsData, err := supabaseClient.Select("events", filters)
	if err != nil {
		log.Printf("Error querying event by ID via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve event"})
		return
	}
	if len(eventsData) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Event not found"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{"item": eventsData[0]})
}

func (h *EventHandler) getEventByIDViaPostgreSQL(c *gin.Context, id string) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
}

func (h *EventHandler) GetEventBySlug(c *gin.Context) {
	slug := c.Param("slug")
	if database.GetClient() != nil {
		h.getEventBySlugViaSupabase(c, slug)
		return
	}
	if false {
		h.getEventBySlugViaPostgreSQL(c, slug)
		return
	}
	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *EventHandler) getEventBySlugViaSupabase(c *gin.Context, slug string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	filters := map[string]string{
		"slug":   "eq." + slug,
		"status": "eq.published",
	}

	eventsData, err := supabaseClient.Select("events", filters)
	if err != nil {
		log.Printf("Error querying event by slug via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve event"})
		return
	}
	if len(eventsData) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Event not found"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{"item": eventsData[0]})
}

func (h *EventHandler) getEventBySlugViaPostgreSQL(c *gin.Context, slug string) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
}

func (h *EventHandler) CreateEvent(c *gin.Context) {
	h.createEventViaSupabase(c)
}

func (h *EventHandler) createEventViaSupabase(c *gin.Context) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	eventData := map[string]interface{}{
		"slug":            req.Slug,
		"title":           req.Title,
		"client_name":     req.ClientName,
		"event_date":      req.EventDate,
		"event_type":      req.EventType,
		"location":        req.Location,
		"description":     req.Description,
		"images":          req.Images,
		"featured_image":  req.FeaturedImage,
		"gallery_images":  req.GalleryImages,
		"budget":          req.Budget,
		"guest_count":     req.GuestCount,
		"vendors":         req.Vendors,
		"testimonial":     req.Testimonial,
		"meta_title":      req.MetaTitle,
		"meta_description": req.MetaDescription,
		"status":          req.Status,
		"display_order":   req.DisplayOrder,
	}

	result, err := supabaseClient.Insert("events", eventData)
	if err != nil {
		log.Printf("Error creating event via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create event"})
		return
	}

	c.JSON(http.StatusCreated, map[string]interface{}{"item": result, "message": "Event created successfully"})
}

func (h *EventHandler) createEventViaPostgreSQL(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Direct database access removed, using Supabase REST API"})
}

func (h *EventHandler) UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	h.updateEventViaSupabase(c, id)
}

func (h *EventHandler) updateEventViaSupabase(c *gin.Context, id string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	var req models.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	eventData := map[string]interface{}{}
	if req.Slug != nil {
		eventData["slug"] = *req.Slug
	}
	if req.Title != nil {
		eventData["title"] = *req.Title
	}
	if req.ClientName != nil {
		eventData["client_name"] = *req.ClientName
	}
	if req.EventDate != nil {
		eventData["event_date"] = *req.EventDate
	}
	if req.EventType != nil {
		eventData["event_type"] = *req.EventType
	}
	if req.Location != nil {
		eventData["location"] = *req.Location
	}
	if req.Description != nil {
		eventData["description"] = *req.Description
	}
	if req.Images != nil {
		eventData["images"] = *req.Images
	}
	if req.FeaturedImage != nil {
		eventData["featured_image"] = *req.FeaturedImage
	}
	if req.GalleryImages != nil {
		eventData["gallery_images"] = *req.GalleryImages
	}
	if req.Budget != nil {
		eventData["budget"] = *req.Budget
	}
	if req.GuestCount != nil {
		eventData["guest_count"] = *req.GuestCount
	}
	if req.Vendors != nil {
		eventData["vendors"] = *req.Vendors
	}
	if req.Testimonial != nil {
		eventData["testimonial"] = *req.Testimonial
	}
	if req.MetaTitle != nil {
		eventData["meta_title"] = *req.MetaTitle
	}
	if req.MetaDescription != nil {
		eventData["meta_description"] = *req.MetaDescription
	}
	if req.Status != nil {
		eventData["status"] = *req.Status
	}
	if req.DisplayOrder != nil {
		eventData["display_order"] = *req.DisplayOrder
	}

	result, err := supabaseClient.Update("events", id, eventData)
	if err != nil {
		log.Printf("Error updating event via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update event"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{"item": result, "message": "Event updated successfully"})
}

func (h *EventHandler) updateEventViaPostgreSQL(c *gin.Context, id string) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Direct database access removed, using Supabase REST API"})
}

func (h *EventHandler) DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	h.deleteEventViaSupabase(c, id)
}

func (h *EventHandler) deleteEventViaSupabase(c *gin.Context, id string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	if err := supabaseClient.Delete("events", id); err != nil {
		log.Printf("Error deleting event via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete event"})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{Success: true, Message: "Event deleted successfully"})
}

func (h *EventHandler) deleteEventViaPostgreSQL(c *gin.Context, id string) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Direct database access removed, using Supabase REST API"})
}
