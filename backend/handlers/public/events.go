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
	startTime := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT id, slug, title, client_name, event_date, event_type, location,
		       description, images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status, display_order,
		       created_at, updated_at
		FROM events
		WHERE status = 'published'
		ORDER BY display_order ASC, created_at DESC`

	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
		return
	if err != nil {
		log.Printf("Error querying events: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve events"})
		return
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var event models.Event
		err := rows.Scan(
			&event.ID, &event.Slug, &event.Title, &event.ClientName, &event.EventDate,
			&event.EventType, &event.Location, &event.Description, &event.Images,
			&event.FeaturedImage, &event.GalleryImages, &event.Budget, &event.GuestCount,
			&event.Vendors, &event.Testimonial, &event.MetaTitle, &event.MetaDescription,
			&event.Status, &event.DisplayOrder, &event.CreatedAt, &event.UpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning event row: %v", err)
			continue
		}
		events = append(events, event)
	}

	log.Printf("✅ Retrieved %d events via PostgreSQL in %v", len(events), time.Since(startTime))
	c.JSON(http.StatusOK, models.EventsResponse{Items: events})
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
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	query := `INSERT INTO events (id, slug, title, client_name, event_date, event_type, location,
		                   description, images, featured_image, gallery_images, budget,
		                   guest_count, vendors, testimonial, meta_title, meta_description,
		                   status, display_order)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
		RETURNING id, slug, title, client_name, event_date, event_type, location, description,
		          images, featured_image, gallery_images, budget, guest_count, vendors,
		          testimonial, meta_title, meta_description, status, display_order,
		          created_at, updated_at`

	var event models.Event
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Direct database access removed, using Supabase REST API"})
		return
		req.Slug, req.Title, req.ClientName, req.EventDate, req.EventType, req.Location,
		req.Description, req.Images, req.FeaturedImage, req.GalleryImages, req.Budget,
		req.GuestCount, req.Vendors, req.Testimonial, req.MetaTitle, req.MetaDescription,
		req.Status, req.DisplayOrder,
	).Scan(
		&event.ID, &event.Slug, &event.Title, &event.ClientName, &event.EventDate,
		&event.EventType, &event.Location, &event.Description, &event.Images,
		&event.FeaturedImage, &event.GalleryImages, &event.Budget, &event.GuestCount,
		&event.Vendors, &event.Testimonial, &event.MetaTitle, &event.MetaDescription,
		&event.Status, &event.DisplayOrder, &event.CreatedAt, &event.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error creating event: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create event"})
		return
	}

	c.JSON(http.StatusCreated, models.EventItemResponse{Item: event})
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
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var req models.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	query := "UPDATE events SET updated_at = NOW()"
	args := []interface{}{}
	argCount := 1

	if req.Slug != nil {
		query += ", slug = $" + common.SqlParam(argCount)
		args = append(args, *req.Slug)
		argCount++
	}
	if req.Title != nil {
		query += ", title = $" + common.SqlParam(argCount)
		args = append(args, *req.Title)
		argCount++
	}
	if req.ClientName != nil {
		query += ", client_name = $" + common.SqlParam(argCount)
		args = append(args, *req.ClientName)
		argCount++
	}
	if req.EventDate != nil {
		query += ", event_date = $" + common.SqlParam(argCount)
		args = append(args, *req.EventDate)
		argCount++
	}
	if req.EventType != nil {
		query += ", event_type = $" + common.SqlParam(argCount)
		args = append(args, *req.EventType)
		argCount++
	}
	if req.Location != nil {
		query += ", location = $" + common.SqlParam(argCount)
		args = append(args, *req.Location)
		argCount++
	}
	if req.Description != nil {
		query += ", description = $" + common.SqlParam(argCount)
		args = append(args, *req.Description)
		argCount++
	}
	if req.Images != nil {
		query += ", images = $" + common.SqlParam(argCount)
		args = append(args, *req.Images)
		argCount++
	}
	if req.FeaturedImage != nil {
		query += ", featured_image = $" + common.SqlParam(argCount)
		args = append(args, *req.FeaturedImage)
		argCount++
	}
	if req.GalleryImages != nil {
		query += ", gallery_images = $" + common.SqlParam(argCount)
		args = append(args, *req.GalleryImages)
		argCount++
	}
	if req.Budget != nil {
		query += ", budget = $" + common.SqlParam(argCount)
		args = append(args, *req.Budget)
		argCount++
	}
	if req.GuestCount != nil {
		query += ", guest_count = $" + common.SqlParam(argCount)
		args = append(args, *req.GuestCount)
		argCount++
	}
	if req.Vendors != nil {
		query += ", vendors = $" + common.SqlParam(argCount)
		args = append(args, *req.Vendors)
		argCount++
	}
	if req.Testimonial != nil {
		query += ", testimonial = $" + common.SqlParam(argCount)
		args = append(args, *req.Testimonial)
		argCount++
	}
	if req.MetaTitle != nil {
		query += ", meta_title = $" + common.SqlParam(argCount)
		args = append(args, *req.MetaTitle)
		argCount++
	}
	if req.MetaDescription != nil {
		query += ", meta_description = $" + common.SqlParam(argCount)
		args = append(args, *req.MetaDescription)
		argCount++
	}
	if req.Status != nil {
		query += ", status = $" + common.SqlParam(argCount)
		args = append(args, *req.Status)
		argCount++
	}
	if req.DisplayOrder != nil {
		query += ", display_order = $" + common.SqlParam(argCount)
		args = append(args, *req.DisplayOrder)
		argCount++
	}

	query += " WHERE id = $" + common.SqlParam(argCount)
	args = append(args, id)

	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
		return
	if err != nil {
		log.Printf("Error updating event: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update event"})
		return
	}

	var event models.Event
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Direct database access removed, using Supabase REST API"})
		return
		`SELECT id, slug, title, client_name, event_date, event_type, location,
		       description, images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status, display_order,
		       created_at, updated_at
		 FROM events WHERE id = $1`, id).Scan(
		&event.ID, &event.Slug, &event.Title, &event.ClientName, &event.EventDate,
		&event.EventType, &event.Location, &event.Description, &event.Images,
		&event.FeaturedImage, &event.GalleryImages, &event.Budget, &event.GuestCount,
		&event.Vendors, &event.Testimonial, &event.MetaTitle, &event.MetaDescription,
		&event.Status, &event.DisplayOrder, &event.CreatedAt, &event.UpdatedAt)

	if err != nil {
		log.Printf("Error querying updated event: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve event"})
		return
	}

	c.JSON(http.StatusOK, models.EventItemResponse{Item: event})
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
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	c.JSON(http.StatusNotImplemented, gin.H{"error": "Direct database access removed, using Supabase REST API"})
		return
	if err != nil {
		log.Printf("Error deleting event: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete event"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Event not found"})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{Success: true, Message: "Event deleted successfully"})
}
