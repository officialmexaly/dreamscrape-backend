package admin

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"dreamscape-backend/internal/models"
	"dreamscape-backend/internal/handlers/common"
	"dreamscape-backend/pkg/errors"
)

type AdminEventHandler struct {
	db *pgxpool.Pool
}

func NewAdminEventHandler(db *pgxpool.Pool) *AdminEventHandler {
	return &AdminEventHandler{db: db}
}

func (h *AdminEventHandler) GetEvents(c *gin.Context) {
	ctx := context.Background()
	status := c.Query("status")
	limit := 100

	query := `
		SELECT id, slug, title, client_name, event_date, event_type, location,
		       description, images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status, display_order,
		       created_at, updated_at
		FROM events
		WHERE 1=1
	`

	args := []interface{}{}
	argCount := 1

	if status != "" {
		query += " AND status = $" + common.SqlParam(argCount)
		args = append(args, status)
		argCount++
	}

	query += " ORDER BY display_order ASC, created_at DESC LIMIT $" + common.SqlParam(argCount)
	args = append(args, limit)

	rows, err := h.db.Query(ctx, query, args...)
	if err != nil {
		common.ErrorResponse(c, err)
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
			common.ErrorResponse(c, err)
			return
		}
		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, events)
}

func (h *AdminEventHandler) GetEventByID(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()

	var event models.Event
	err := h.db.QueryRow(ctx,
		`SELECT id, slug, title, client_name, event_date, event_type, location,
		       description, images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status, display_order,
		       created_at, updated_at
		 FROM events WHERE id = $1`, id).Scan(
		&event.ID, &event.Slug, &event.Title, &event.ClientName, &event.EventDate,
		&event.EventType, &event.Location, &event.Description, &event.Images,
		&event.FeaturedImage, &event.GalleryImages, &event.Budget, &event.GuestCount,
		&event.Vendors, &event.Testimonial, &event.MetaTitle, &event.MetaDescription,
		&event.Status, &event.DisplayOrder, &event.CreatedAt, &event.UpdatedAt,
	)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("Event not found"))
		return
	}

	common.SuccessResponse(c, http.StatusOK, event)
}

func (h *AdminEventHandler) CreateEvent(c *gin.Context) {
	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()

	var exists bool
	err := h.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM events WHERE slug = $1)`, req.Slug).Scan(&exists)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	if exists {
		common.ErrorResponse(c, errors.Conflict("Event with this slug already exists"))
		return
	}

	var event models.Event
	err = h.db.QueryRow(ctx,
		`INSERT INTO events (id, slug, title, client_name, event_date, event_type, location,
		       description, images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status, display_order,
		       created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
		 RETURNING id, slug, title, client_name, event_date, event_type, location,
		           description, images, featured_image, gallery_images, budget, guest_count,
		           vendors, testimonial, meta_title, meta_description, status, display_order,
		           created_at, updated_at`,
		uuid.New().String(), req.Slug, req.Title, req.ClientName, req.EventDate, req.EventType,
		req.Location, req.Description, req.Images, req.FeaturedImage, req.GalleryImages,
		req.Budget, req.GuestCount, req.Vendors, req.Testimonial, req.MetaTitle,
		req.MetaDescription, req.Status, req.DisplayOrder).Scan(
		&event.ID, &event.Slug, &event.Title, &event.ClientName, &event.EventDate,
		&event.EventType, &event.Location, &event.Description, &event.Images,
		&event.FeaturedImage, &event.GalleryImages, &event.Budget, &event.GuestCount,
		&event.Vendors, &event.Testimonial, &event.MetaTitle, &event.MetaDescription,
		&event.Status, &event.DisplayOrder, &event.CreatedAt, &event.UpdatedAt)

	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusCreated, event)
}

func (h *AdminEventHandler) UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()
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

	_, err := h.db.Exec(ctx, query, args...)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	var event models.Event
	err = h.db.QueryRow(ctx,
		`SELECT id, slug, title, client_name, event_date, event_type, location,
		       description, images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status, display_order,
		       created_at, updated_at
		 FROM events WHERE id = $1`, id).Scan(
		&event.ID, &event.Slug, &event.Title, &event.ClientName, &event.EventDate,
		&event.EventType, &event.Location, &event.Description, &event.Images,
		&event.FeaturedImage, &event.GalleryImages, &event.Budget, &event.GuestCount,
		&event.Vendors, &event.Testimonial, &event.MetaTitle, &event.MetaDescription,
		&event.Status, &event.DisplayOrder, &event.CreatedAt, &event.UpdatedAt,
	)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("Event not found"))
		return
	}

	common.SuccessResponse(c, http.StatusOK, event)
}

func (h *AdminEventHandler) DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()

	_, err := h.db.Exec(ctx, "DELETE FROM events WHERE id = $1", id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Event deleted successfully")
}

func (h *AdminEventHandler) ReorderEvents(c *gin.Context) {
	var req models.ReorderEventsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()
	tx, err := h.db.Begin(ctx)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer tx.Rollback(ctx)

	for _, event := range req.Events {
		_, err := tx.Exec(ctx, "UPDATE events SET display_order = $1, updated_at = NOW() WHERE id = $2", event.DisplayOrder, event.ID)
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}
	}

	if err := tx.Commit(ctx); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Events reordered successfully")
}
