package public

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"dreamscape-backend/internal/database"
	"dreamscape-backend/internal/models"
	"dreamscape-backend/internal/handlers/common"
)

// ServiceHandler handles public service operations
type ServiceHandler struct {
	pool *pgxpool.Pool
}

// NewServiceHandler creates a new service handler
func NewServiceHandler() *ServiceHandler {
	return &ServiceHandler{
		pool: database.GetPool(),
	}
}

// GetServices retrieves all public services
// @Summary      Get all services
// @Description  Retrieve all public services with optional filtering
// @Tags         services
// @Accept       json
// @Produce      json
// @Success      200  {object}  models.ServicesResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/services [get]
func (h *ServiceHandler) GetServices(c *gin.Context) {
	// Check if Supabase client is available (preferred method)
	if database.GetClient() != nil {
		h.getServicesViaSupabase(c)
		return
	}

	// Fall back to PostgreSQL if available
	if h.pool != nil {
		h.getServicesViaPostgreSQL(c)
		return
	}

	// No database connection available
	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *ServiceHandler) getServicesViaSupabase(c *gin.Context) {
	startTime := time.Now()

	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	// Query services using Supabase REST API
	filters := map[string]string{
		"status": "eq.published",
		"order":  "display_order.asc,created_at.desc",
	}

	servicesData, err := supabaseClient.Select("services", filters)
	if err != nil {
		log.Printf("Error querying services via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve services"})
		return
	}

	log.Printf("✅ Retrieved %d services via Supabase in %v", len(servicesData), time.Since(startTime))

	c.JSON(http.StatusOK, map[string]interface{}{
		"items": servicesData,
	})
}

func (h *ServiceHandler) getServicesViaPostgreSQL(c *gin.Context) {
	startTime := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT id, slug, category, title, subtitle, description, image, list_items,
		       cta_text, cta_link, status, display_order, created_at, updated_at
		FROM services
		WHERE status = 'published'
		ORDER BY display_order ASC, created_at DESC`

	rows, err := h.pool.Query(ctx, query)
	if err != nil {
		log.Printf("Error querying services: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve services"})
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
			log.Printf("Error scanning service row: %v", err)
			continue
		}
		services = append(services, service)
	}

	log.Printf("✅ Retrieved %d services via PostgreSQL in %v", len(services), time.Since(startTime))
	c.JSON(http.StatusOK, models.ServicesResponse{Items: services})
}

// GetServiceByID retrieves a single service by ID
// @Summary      Get service by ID
// @Description  Retrieve a single service by its ID
// @Tags         services
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Service ID"
// @Success      200  {object}  models.ServiceItemResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/services/:id [get]
func (h *ServiceHandler) GetServiceByID(c *gin.Context) {
	id := c.Param("id")

	if database.GetClient() != nil {
		h.getServiceByIDViaSupabase(c, id)
		return
	}

	if h.pool != nil {
		h.getServiceByIDViaPostgreSQL(c, id)
		return
	}

	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *ServiceHandler) getServiceByIDViaSupabase(c *gin.Context, id string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	filters := map[string]string{
		"id":     "eq." + id,
		"status": "eq.published",
	}

	servicesData, err := supabaseClient.Select("services", filters)
	if err != nil {
		log.Printf("Error querying service by ID via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve service"})
		return
	}

	if len(servicesData) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Service not found"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"item": servicesData[0],
	})
}

func (h *ServiceHandler) getServiceByIDViaPostgreSQL(c *gin.Context, id string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT id, slug, category, title, subtitle, description, image, list_items,
		       cta_text, cta_link, status, display_order, created_at, updated_at
		FROM services
		WHERE id = $1 AND status = 'published'`

	var service models.Service
	err := h.pool.QueryRow(ctx, query, id).Scan(
		&service.ID, &service.Slug, &service.Category, &service.Title, &service.Subtitle,
		&service.Description, &service.Image, &service.ListItems, &service.CTAText,
		&service.CTALink, &service.Status, &service.DisplayOrder, &service.CreatedAt,
		&service.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error querying service by ID: %v", err)
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Service not found"})
		return
	}

	c.JSON(http.StatusOK, models.ServiceItemResponse{Item: service})
}

// GetServiceBySlug retrieves a single service by slug
// @Summary      Get service by slug
// @Description  Retrieve a single service by its slug
// @Tags         services
// @Accept       json
// @Produce      json
// @Param        slug   path      string  true  "Service slug"
// @Success      200  {object}  models.ServiceItemResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/services/slug/:slug [get]
func (h *ServiceHandler) GetServiceBySlug(c *gin.Context) {
	slug := c.Param("slug")

	if database.GetClient() != nil {
		h.getServiceBySlugViaSupabase(c, slug)
		return
	}

	if h.pool != nil {
		h.getServiceBySlugViaPostgreSQL(c, slug)
		return
	}

	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *ServiceHandler) getServiceBySlugViaSupabase(c *gin.Context, slug string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	filters := map[string]string{
		"slug":   "eq." + slug,
		"status": "eq.published",
	}

	servicesData, err := supabaseClient.Select("services", filters)
	if err != nil {
		log.Printf("Error querying service by slug via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve service"})
		return
	}

	if len(servicesData) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Service not found"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"item": servicesData[0],
	})
}

func (h *ServiceHandler) getServiceBySlugViaPostgreSQL(c *gin.Context, slug string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT id, slug, category, title, subtitle, description, image, list_items,
		       cta_text, cta_link, status, display_order, created_at, updated_at
		FROM services
		WHERE slug = $1 AND status = 'published'`

	var service models.Service
	err := h.pool.QueryRow(ctx, query, slug).Scan(
		&service.ID, &service.Slug, &service.Category, &service.Title, &service.Subtitle,
		&service.Description, &service.Image, &service.ListItems, &service.CTAText,
		&service.CTALink, &service.Status, &service.DisplayOrder, &service.CreatedAt,
		&service.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error querying service by slug: %v", err)
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Service not found"})
		return
	}

	c.JSON(http.StatusOK, models.ServiceItemResponse{Item: service})
}

// CreateService creates a new service (admin only)
// @Summary      Create service
// @Description  Create a new service (admin only)
// @Tags         admin-services
// @Accept       json
// @Produce      json
// @Param        service   body      models.CreateServiceRequest  true  "Service data"
// @Success      201  {object}  models.ServiceItemResponse
// @Failure      400  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/services [post]
func (h *ServiceHandler) CreateService(c *gin.Context) {
	if database.GetClient() != nil {
		h.createServiceViaSupabase(c)
		return
	}

	if h.pool != nil {
		h.createServiceViaPostgreSQL(c)
		return
	}

	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *ServiceHandler) createServiceViaSupabase(c *gin.Context) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	var req models.CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	serviceData := map[string]interface{}{
		"slug":          req.Slug,
		"category":      req.Category,
		"title":         req.Title,
		"subtitle":      req.Subtitle,
		"description":   req.Description,
		"image":         req.Image,
		"list_items":    req.ListItems,
		"cta_text":      req.CTAText,
		"cta_link":      req.CTALink,
		"status":        req.Status,
		"display_order": req.DisplayOrder,
	}

	result, err := supabaseClient.Insert("services", serviceData)
	if err != nil {
		log.Printf("Error creating service via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create service"})
		return
	}

	c.JSON(http.StatusCreated, map[string]interface{}{
		"item":    result,
		"message": "Service created successfully",
	})
}

func (h *ServiceHandler) createServiceViaPostgreSQL(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var req models.CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	query := `INSERT INTO services (id, slug, category, title, subtitle, description, image, list_items,
		                   cta_text, cta_link, status, display_order)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, slug, category, title, subtitle, description, image, list_items,
		          cta_text, cta_link, status, display_order, created_at, updated_at`

	var service models.Service
	err := h.pool.QueryRow(ctx, query,
		req.Slug, req.Category, req.Title, req.Subtitle, req.Description, req.Image, req.ListItems,
		req.CTAText, req.CTALink, req.Status, req.DisplayOrder,
	).Scan(
		&service.ID, &service.Slug, &service.Category, &service.Title, &service.Subtitle,
		&service.Description, &service.Image, &service.ListItems, &service.CTAText,
		&service.CTALink, &service.Status, &service.DisplayOrder, &service.CreatedAt,
		&service.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error creating service: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create service"})
		return
	}

	c.JSON(http.StatusCreated, models.ServiceItemResponse{Item: service})
}

// UpdateService updates an existing service (admin only)
// @Summary      Update service
// @Description  Update an existing service (admin only)
// @Tags         admin-services
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Service ID"
// @Param        service   body      models.UpdateServiceRequest  true  "Service data"
// @Success      200  {object}  models.ServiceItemResponse
// @Failure      400  {object}  models.ErrorResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/services/:id [put]
func (h *ServiceHandler) UpdateService(c *gin.Context) {
	id := c.Param("id")

	if database.GetClient() != nil {
		h.updateServiceViaSupabase(c, id)
		return
	}

	if h.pool != nil {
		h.updateServiceViaPostgreSQL(c, id)
		return
	}

	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *ServiceHandler) updateServiceViaSupabase(c *gin.Context, id string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	var req models.UpdateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	serviceData := map[string]interface{}{}

	if req.Slug != nil {
		serviceData["slug"] = *req.Slug
	}
	if req.Category != nil {
		serviceData["category"] = *req.Category
	}
	if req.Title != nil {
		serviceData["title"] = *req.Title
	}
	if req.Subtitle != nil {
		serviceData["subtitle"] = *req.Subtitle
	}
	if req.Description != nil {
		serviceData["description"] = *req.Description
	}
	if req.Image != nil {
		serviceData["image"] = *req.Image
	}
	if req.ListItems != nil {
		serviceData["list_items"] = *req.ListItems
	}
	if req.CTAText != nil {
		serviceData["cta_text"] = *req.CTAText
	}
	if req.CTALink != nil {
		serviceData["cta_link"] = *req.CTALink
	}
	if req.Status != nil {
		serviceData["status"] = *req.Status
	}
	if req.DisplayOrder != nil {
		serviceData["display_order"] = *req.DisplayOrder
	}

	result, err := supabaseClient.Update("services", id, serviceData)
	if err != nil {
		log.Printf("Error updating service via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update service"})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"item":    result,
		"message": "Service updated successfully",
	})
}

func (h *ServiceHandler) updateServiceViaPostgreSQL(c *gin.Context, id string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var req models.UpdateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

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

	query += " WHERE id = $" + common.SqlParam(argCount) + " RETURNING *"
	args = append(args, id)

	var service models.Service
	err := h.pool.QueryRow(ctx, query, args...).Scan(
		&service.ID, &service.Slug, &service.Category, &service.Title, &service.Subtitle,
		&service.Description, &service.Image, &service.ListItems, &service.CTAText,
		&service.CTALink, &service.Status, &service.DisplayOrder, &service.CreatedAt,
		&service.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error updating service: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update service"})
		return
	}

	c.JSON(http.StatusOK, models.ServiceItemResponse{Item: service})
}

// DeleteService deletes a service (admin only)
// @Summary      Delete service
// @Description  Delete a service (admin only)
// @Tags         admin-services
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Service ID"
// @Success      200  {object}  models.SuccessResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/admin/services/:id [delete]
func (h *ServiceHandler) DeleteService(c *gin.Context) {
	id := c.Param("id")

	if database.GetClient() != nil {
		h.deleteServiceViaSupabase(c, id)
		return
	}

	if h.pool != nil {
		h.deleteServiceViaPostgreSQL(c, id)
		return
	}

	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *ServiceHandler) deleteServiceViaSupabase(c *gin.Context, id string) {
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	err := supabaseClient.Delete("services", id)
	if err != nil {
		log.Printf("Error deleting service via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete service"})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Message: "Service deleted successfully",
	})
}

func (h *ServiceHandler) deleteServiceViaPostgreSQL(c *gin.Context, id string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := "DELETE FROM services WHERE id = $1"
	result, err := h.pool.Exec(ctx, query, id)
	if err != nil {
		log.Printf("Error deleting service: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete service"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Service not found"})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Message: "Service deleted successfully",
	})
}
