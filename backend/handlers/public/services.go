package public

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/models"
)

// ServiceHandler handles public service operations
type ServiceHandler struct {
}

// NewServiceHandler creates a new service handler
func NewServiceHandler() *ServiceHandler {
	return &ServiceHandler{}
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
		"status": "published",
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
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
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
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
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
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
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
	h.createServiceViaSupabase(c)
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
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
}
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
	h.updateServiceViaSupabase(c, id)
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
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
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
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is being migrated to Supabase REST API"})
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
	h.deleteServiceViaSupabase(c, id)
}
