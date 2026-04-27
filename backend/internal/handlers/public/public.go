package public

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"dreamscape-backend/internal/models"
	"dreamscape-backend/internal/handlers/common"
	"dreamscape-backend/pkg/errors"
)

// PublicHandler handles public API endpoints
type PublicHandler struct {
	db *pgxpool.Pool
}

func NewPublicHandler(db *pgxpool.Pool) *PublicHandler {
	return &PublicHandler{db: db}
}

func (h *PublicHandler) GetEvents(c *gin.Context) {
	if h == nil || h.db == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	ctx := context.Background()
	limit := 100

	query := `
		SELECT id, slug, title, client_name, event_date, event_type, location,
		       description, images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status, display_order,
		       created_at, updated_at
		FROM events
		WHERE status = 'published'
		ORDER BY display_order ASC, created_at DESC
		LIMIT $1
	`

	rows, err := h.db.Query(ctx, query, limit)
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

func (h *PublicHandler) GetEventBySlug(c *gin.Context) {
	if h == nil || h.db == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	slug := c.Param("slug")
	ctx := context.Background()

	var event models.Event
	err := h.db.QueryRow(ctx,
		`SELECT id, slug, title, client_name, event_date, event_type, location,
		       description, images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status, display_order,
		       created_at, updated_at
		 FROM events WHERE slug = $1 AND status = 'published'`, slug).Scan(
		&event.ID, &event.Slug, &event.Title, &event.ClientName, &event.EventDate,
		&event.EventType, &event.Location, &event.Description, &event.Images,
		&event.FeaturedImage, &event.GalleryImages, &event.Budget, &event.GuestCount,
		&event.Vendors, &event.Testimonial, &event.MetaTitle, &event.MetaDescription,
		&event.Status, &event.DisplayOrder, &event.CreatedAt, &event.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		common.ErrorResponse(c, errors.NotFound("Event not found"))
		return
	}
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, event)
}

func (h *PublicHandler) GetServices(c *gin.Context) {
	if h == nil || h.db == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	ctx := context.Background()
	limit := 100

	query := `
		SELECT id, slug, category, title, subtitle, description, image, list_items,
		       cta_text, cta_link, status, display_order, created_at, updated_at
		FROM services
		WHERE status = 'published'
		ORDER BY display_order ASC, created_at DESC
		LIMIT $1
	`

	rows, err := h.db.Query(ctx, query, limit)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer rows.Close()

	var services []models.Service
	for rows.Next() {
		var service models.Service
		err := rows.Scan(
			&service.ID, &service.Slug, &service.Category, &service.Title, &service.Subtitle,
			&service.Description, &service.Image, &service.ListItems, &service.CTAText,
			&service.CTALink, &service.Status, &service.DisplayOrder, &service.CreatedAt,
			&service.UpdatedAt,
		)
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}
		services = append(services, service)
	}

	if err := rows.Err(); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, services)
}

func (h *PublicHandler) GetServiceBySlug(c *gin.Context) {
	if h == nil || h.db == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	slug := c.Param("slug")
	ctx := context.Background()

	var service models.Service
	err := h.db.QueryRow(ctx,
		`SELECT id, slug, category, title, subtitle, description, image, list_items,
		       cta_text, cta_link, status, display_order, created_at, updated_at
		 FROM services WHERE slug = $1 AND status = 'published'`, slug).Scan(
		&service.ID, &service.Slug, &service.Category, &service.Title, &service.Subtitle,
		&service.Description, &service.Image, &service.ListItems, &service.CTAText,
		&service.CTALink, &service.Status, &service.DisplayOrder, &service.CreatedAt,
		&service.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		common.ErrorResponse(c, errors.NotFound("Service not found"))
		return
	}
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, service)
}
