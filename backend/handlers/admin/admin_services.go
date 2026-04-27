package admin

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"dreamscape-backend/backend/models"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/pkg/errors"
)

// AdminServiceHandler handles admin service endpoints
type AdminServiceHandler struct {
	db *pgxpool.Pool
}

// NewAdminServiceHandler creates a new admin service handler
func NewAdminServiceHandler(db *pgxpool.Pool) *AdminServiceHandler {
	return &AdminServiceHandler{db: db}
}

// GetServices retrieves all services (including drafts)
func (h *AdminServiceHandler) GetServices(c *gin.Context) {
	ctx := context.Background()
	status := c.Query("status")
	limit := 100

	query := `
		SELECT id, slug, category, title, subtitle, description, image, list_items,
		       cta_text, cta_link, status, display_order, created_at, updated_at
		FROM services
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

// GetServiceByID retrieves a single service by ID
func (h *AdminServiceHandler) GetServiceByID(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()

	var service models.Service
	err := h.db.QueryRow(ctx,
		`SELECT id, slug, category, title, subtitle, description, image, list_items,
		       cta_text, cta_link, status, display_order, created_at, updated_at
		 FROM services WHERE id = $1`, id).Scan(
		&service.ID, &service.Slug, &service.Category, &service.Title, &service.Subtitle,
		&service.Description, &service.Image, &service.ListItems, &service.CTAText,
		&service.CTALink, &service.Status, &service.DisplayOrder,
		&service.CreatedAt, &service.UpdatedAt,
	)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("Service not found"))
		return
	}

	common.SuccessResponse(c, http.StatusOK, service)
}

// CreateService creates a new service
func (h *AdminServiceHandler) CreateService(c *gin.Context) {
	var req models.CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()

	var exists bool
	err := h.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM services WHERE slug = $1)`, req.Slug).Scan(&exists)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	if exists {
		common.ErrorResponse(c, errors.Conflict("Service with this slug already exists"))
		return
	}

	var service models.Service
	err = h.db.QueryRow(ctx,
		`INSERT INTO services (id, slug, category, title, subtitle, description, image, list_items,
		       cta_text, cta_link, status, display_order, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
		 RETURNING id, slug, category, title, subtitle, description, image, list_items,
		         cta_text, cta_link, status, display_order, created_at, updated_at`,
		uuid.New().String(), req.Slug, req.Category, req.Title, req.Subtitle, req.Description,
		req.Image, req.ListItems, req.CTAText, req.CTALink, req.Status, req.DisplayOrder).Scan(
		&service.ID, &service.Slug, &service.Category, &service.Title, &service.Subtitle,
		&service.Description, &service.Image, &service.ListItems, &service.CTAText,
		&service.CTALink, &service.Status, &service.DisplayOrder, &service.CreatedAt,
		&service.UpdatedAt)

	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusCreated, service)
}

// UpdateService updates an existing service
func (h *AdminServiceHandler) UpdateService(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()
	query := "UPDATE services SET updated_at = NOW()"
	args := []interface{}{}
	argCount := 1

	if req.Slug != nil {
		query += ", slug = $" + common.SqlParam(argCount)
		args = append(args, *req.Slug)
		argCount++
	}
	if req.Category != nil {
		query += ", category = $" + common.SqlParam(argCount)
		args = append(args, *req.Category)
		argCount++
	}
	if req.Title != nil {
		query += ", title = $" + common.SqlParam(argCount)
		args = append(args, *req.Title)
		argCount++
	}
	if req.Subtitle != nil {
		query += ", subtitle = $" + common.SqlParam(argCount)
		args = append(args, *req.Subtitle)
		argCount++
	}
	if req.Description != nil {
		query += ", description = $" + common.SqlParam(argCount)
		args = append(args, *req.Description)
		argCount++
	}
	if req.Image != nil {
		query += ", image = $" + common.SqlParam(argCount)
		args = append(args, *req.Image)
		argCount++
	}
	if req.ListItems != nil {
		query += ", list_items = $" + common.SqlParam(argCount)
		args = append(args, *req.ListItems)
		argCount++
	}
	if req.CTAText != nil {
		query += ", cta_text = $" + common.SqlParam(argCount)
		args = append(args, *req.CTAText)
		argCount++
	}
	if req.CTALink != nil {
		query += ", cta_link = $" + common.SqlParam(argCount)
		args = append(args, *req.CTALink)
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

	var service models.Service
	err = h.db.QueryRow(ctx,
		`SELECT id, slug, category, title, subtitle, description, image, list_items,
		       cta_text, cta_link, status, display_order, created_at, updated_at
		 FROM services WHERE id = $1`, id).Scan(
		&service.ID, &service.Slug, &service.Category, &service.Title, &service.Subtitle,
		&service.Description, &service.Image, &service.ListItems, &service.CTAText,
		&service.CTALink, &service.Status, &service.DisplayOrder,
		&service.CreatedAt, &service.UpdatedAt)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("Service not found"))
		return
	}

	common.SuccessResponse(c, http.StatusOK, service)
}

// DeleteService deletes a service
func (h *AdminServiceHandler) DeleteService(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()

	_, err := h.db.Exec(ctx, "DELETE FROM services WHERE id = $1", id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Service deleted successfully")
}

// ReorderServices reorders services
func (h *AdminServiceHandler) ReorderServices(c *gin.Context) {
	var req models.ReorderServicesRequest
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

	for _, service := range req.Services {
		_, err := tx.Exec(ctx,
			"UPDATE services SET display_order = $1, updated_at = NOW() WHERE id = $2",
			service.DisplayOrder, service.ID)
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}
	}

	if err := tx.Commit(ctx); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Services reordered successfully")
}
