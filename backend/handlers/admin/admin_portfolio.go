package admin

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/models"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/pkg/errors"
)

// AdminPortfolioHandler handles admin portfolio/blog endpoints
type AdminPortfolioHandler struct{}

// NewAdminPortfolioHandler creates a new admin portfolio handler
func NewAdminPortfolioHandler() *AdminPortfolioHandler {
	return &AdminPortfolioHandler{}
}

// GetPortfolioItems retrieves all portfolio items
func (h *AdminPortfolioHandler) GetPortfolioItems(c *gin.Context) {
	client := database.GetClient()
	if client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database client unavailable"})
		return
	}

	items, err := client.Select("portfolio_items", map[string]string{
		"order": "display_order.asc,created_at.desc",
	})
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	common.SuccessResponse(c, http.StatusOK, items)
}

// CreatePortfolioItem creates a new portfolio item
func (h *AdminPortfolioHandler) CreatePortfolioItem(c *gin.Context) {
	client := database.GetClient()
	if client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database client unavailable"})
		return
	}

	var req models.CreatePortfolioItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	// Create portfolio item data
	itemData := map[string]interface{}{
		"title":       req.Title,
		"slug":        req.Slug,
		"excerpt":     req.Excerpt,
		"author":      req.Author,
		"content":     req.Content,
		"client_name": req.ClientName,
		"event_date":  req.EventDate,
		"event_type":  req.EventType,
		"location":    req.Location,
		"description": req.Description,
		"images":      req.Images,
		"featured_image": req.FeaturedImage,
		"gallery_images": req.GalleryImages,
		"budget":      req.Budget,
		"guest_count": req.GuestCount,
		"vendors":     req.Vendors,
		"testimonial": req.Testimonial,
		"categories":  req.Categories,
		"tags":        req.Tags,
		"meta_title":       req.MetaTitle,
		"meta_description": req.MetaDescription,
		"status":      "published",
		"display_order": 0,
	}

	result, err := client.Insert("portfolio_items", itemData)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusCreated, result)
}

// UpdatePortfolioItem updates an existing portfolio item
func (h *AdminPortfolioHandler) UpdatePortfolioItem(c *gin.Context) {
	id := c.Param("id")
	client := database.GetClient()
	if client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database client unavailable"})
		return
	}

	var req models.UpdatePortfolioItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	// Build update data dynamically
	updateData := make(map[string]interface{})
	if req.Title != nil {
		updateData["title"] = *req.Title
	}
	if req.Slug != nil {
		updateData["slug"] = *req.Slug
	}
	if req.Excerpt != nil {
		updateData["excerpt"] = *req.Excerpt
	}
	if req.Author != nil {
		updateData["author"] = *req.Author
	}
	if req.Content != nil {
		updateData["content"] = *req.Content
	}
	if req.ClientName != nil {
		updateData["client_name"] = *req.ClientName
	}
	if req.EventDate != nil {
		updateData["event_date"] = *req.EventDate
	}
	if req.EventType != nil {
		updateData["event_type"] = *req.EventType
	}
	if req.Location != nil {
		updateData["location"] = *req.Location
	}
	if req.Description != nil {
		updateData["description"] = *req.Description
	}
	if len(req.Images) > 0 {
		updateData["images"] = req.Images
	}
	if req.FeaturedImage != nil {
		updateData["featured_image"] = *req.FeaturedImage
	}
	if len(req.GalleryImages) > 0 {
		updateData["gallery_images"] = req.GalleryImages
	}
	if req.Budget != nil {
		updateData["budget"] = *req.Budget
	}
	if req.GuestCount != nil {
		updateData["guest_count"] = *req.GuestCount
	}
	if len(req.Vendors) > 0 {
		updateData["vendors"] = req.Vendors
	}
	if req.Testimonial != nil {
		updateData["testimonial"] = *req.Testimonial
	}
	if len(req.Categories) > 0 {
		updateData["categories"] = req.Categories
	}
	if len(req.Tags) > 0 {
		updateData["tags"] = req.Tags
	}
	if req.MetaTitle != nil {
		updateData["meta_title"] = *req.MetaTitle
	}
	if req.MetaDescription != nil {
		updateData["meta_description"] = *req.MetaDescription
	}
	if req.Status != nil {
		updateData["status"] = *req.Status
	}
	if req.DisplayOrder != nil {
		updateData["display_order"] = *req.DisplayOrder
	}

	result, err := client.UpdateByID("portfolio_items", id, updateData)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, result)
}

// DeletePortfolioItem deletes a portfolio item
func (h *AdminPortfolioHandler) DeletePortfolioItem(c *gin.Context) {
	id := c.Param("id")
	client := database.GetClient()
	if client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database client unavailable"})
		return
	}

	err := client.DeleteByID("portfolio_items", id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Portfolio item deleted successfully")
}
