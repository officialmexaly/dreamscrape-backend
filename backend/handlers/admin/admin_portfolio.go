package admin

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/models"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/pkg/errors"
)

// AdminPortfolioHandler handles admin portfolio/blog endpoints
type AdminPortfolioHandler struct {
	db *pgxpool.Pool
}

// NewAdminPortfolioHandler creates a new admin portfolio handler
func NewAdminPortfolioHandler(db *pgxpool.Pool) *AdminPortfolioHandler {
	return &AdminPortfolioHandler{db: db}
}

// GetPortfolioItems retrieves all portfolio items
func (h *AdminPortfolioHandler) GetPortfolioItems(c *gin.Context) {
	if client := database.GetClient(); client != nil {
		items, err := client.Select("portfolio_items", map[string]string{
			"order": "display_order.asc,created_at.desc",
		})
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}
		common.SuccessResponse(c, http.StatusOK, items)
		return
	}

	if h.db == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database connection unavailable"})
		return
	}

	ctx := context.Background()

	rows, err := h.db.Query(ctx,
		`SELECT id, slug, title, excerpt, author, content, client_name, event_date,
		         event_type, location, description, images, featured_image, gallery_images,
		         budget, guest_count, vendors, testimonial, categories, tags, meta_title,
		         meta_description, status, display_order, created_at, updated_at
		 FROM portfolio_items
		 ORDER BY display_order ASC, created_at DESC`)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer rows.Close()

	var items []models.PortfolioItem
	for rows.Next() {
		var item models.PortfolioItem
		err := rows.Scan(
			&item.ID, &item.Slug, &item.Title, &item.Excerpt, &item.Author,
			&item.Content, &item.ClientName, &item.EventDate, &item.EventType,
			&item.Location, &item.Description, &item.Images, &item.FeaturedImage,
			&item.GalleryImages, &item.Budget, &item.GuestCount, &item.Vendors,
			&item.Testimonial, &item.Categories, &item.Tags, &item.MetaTitle,
			&item.MetaDescription, &item.Status, &item.DisplayOrder,
			&item.CreatedAt, &item.UpdatedAt,
		)
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
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
	}

	eventDate, err := common.ParseOptionalDate(req.EventDate)
	if err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"event_date": err.Error()},
		})
		return
	}

	ctx := context.Background()

	// Check if slug already exists
	var exists bool
	err = h.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM portfolio_items WHERE slug = $1)`, req.Slug).Scan(&exists)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	if exists {
		common.ErrorResponse(c, errors.Conflict("Portfolio item with this slug already exists"))
		return
	}

	// Create portfolio item
	var item models.PortfolioItem
	err = h.db.QueryRow(ctx,
		`INSERT INTO portfolio_items (id, slug, title, excerpt, author, content, client_name,
		         event_date, event_type, location, description, images, featured_image,
		         gallery_images, budget, guest_count, vendors, testimonial, categories,
		         tags, meta_title, meta_description, status, display_order, created_at, updated_at)
		 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW())
		 RETURNING id, slug, title, excerpt, author, content, client_name, event_date,
		         event_type, location, description, images, featured_image, gallery_images,
		         budget, guest_count, vendors, testimonial, categories, tags, meta_title,
		         meta_description, status, display_order, created_at, updated_at`,
		req.Slug, req.Title, req.Excerpt, req.Author, req.Content, req.ClientName,
		eventDate, req.EventType, req.Location, req.Description, req.Images,
		req.FeaturedImage, req.GalleryImages, req.Budget, req.GuestCount, req.Vendors,
		req.Testimonial, req.Categories, req.Tags, req.MetaTitle, req.MetaDescription,
		req.Status, req.DisplayOrder).Scan(
		&item.ID, &item.Slug, &item.Title, &item.Excerpt, &item.Author,
		&item.Content, &item.ClientName, &item.EventDate, &item.EventType,
		&item.Location, &item.Description, &item.Images, &item.FeaturedImage,
		&item.GalleryImages, &item.Budget, &item.GuestCount, &item.Vendors,
		&item.Testimonial, &item.Categories, &item.Tags, &item.MetaTitle,
		&item.MetaDescription, &item.Status, &item.DisplayOrder,
		&item.CreatedAt, &item.UpdatedAt)

	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusCreated, item)
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
	if req.Images != nil {
		updateData["images"] = *req.Images
	}
	if req.FeaturedImage != nil {
		updateData["featured_image"] = *req.FeaturedImage
	}
	if req.GalleryImages != nil {
		updateData["gallery_images"] = *req.GalleryImages
	}
	if req.Budget != nil {
		updateData["budget"] = *req.Budget
	}
	if req.GuestCount != nil {
		updateData["guest_count"] = *req.GuestCount
	}
	if req.Vendors != nil {
		updateData["vendors"] = *req.Vendors
	}
	if req.Testimonial != nil {
		updateData["testimonial"] = *req.Testimonial
	}
	if req.Categories != nil {
		updateData["categories"] = *req.Categories
	}
	if req.Tags != nil {
		updateData["tags"] = *req.Tags
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
	query := "UPDATE portfolio_items SET updated_at = NOW()"
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
	if req.Excerpt != nil {
		query += ", excerpt = $" + common.SqlParam(argCount)
		args = append(args, *req.Excerpt)
		argCount++
	}
	if req.Author != nil {
		query += ", author = $" + common.SqlParam(argCount)
		args = append(args, *req.Author)
		argCount++
	}
	if req.Content != nil {
		query += ", content = $" + common.SqlParam(argCount)
		args = append(args, *req.Content)
		argCount++
	}
	if req.ClientName != nil {
		query += ", client_name = $" + common.SqlParam(argCount)
		args = append(args, *req.ClientName)
		argCount++
	}
	if req.EventDate != nil {
		query += ", event_date = $" + common.SqlParam(argCount)
		args = append(args, eventDate)
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
	if len(req.Images) > 0 {
		query += ", images = $" + common.SqlParam(argCount)
		args = append(args, req.Images)
		argCount++
	}
	if req.FeaturedImage != nil {
		query += ", featured_image = $" + common.SqlParam(argCount)
		args = append(args, *req.FeaturedImage)
		argCount++
	}
	if len(req.GalleryImages) > 0 {
		query += ", gallery_images = $" + common.SqlParam(argCount)
		args = append(args, req.GalleryImages)
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
	if len(req.Vendors) > 0 {
		query += ", vendors = $" + common.SqlParam(argCount)
		args = append(args, req.Vendors)
		argCount++
	}
	if req.Testimonial != nil {
		query += ", testimonial = $" + common.SqlParam(argCount)
		args = append(args, *req.Testimonial)
		argCount++
	}
	if len(req.Categories) > 0 {
		query += ", categories = $" + common.SqlParam(argCount)
		args = append(args, req.Categories)
		argCount++
	}
	if len(req.Tags) > 0 {
		query += ", tags = $" + common.SqlParam(argCount)
		args = append(args, req.Tags)
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

	_, err = h.db.Exec(ctx, query, args...)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Fetch updated item
	var item models.PortfolioItem
	err = h.db.QueryRow(ctx,
		`SELECT id, slug, title, excerpt, author, content, client_name, event_date,
		         event_type, location, description, images, featured_image, gallery_images,
		         budget, guest_count, vendors, testimonial, categories, tags, meta_title,
		         meta_description, status, display_order, created_at, updated_at
		 FROM portfolio_items WHERE id = $1`, id).Scan(
		&item.ID, &item.Slug, &item.Title, &item.Excerpt, &item.Author,
		&item.Content, &item.ClientName, &item.EventDate, &item.EventType,
		&item.Location, &item.Description, &item.Images, &item.FeaturedImage,
		&item.GalleryImages, &item.Budget, &item.GuestCount, &item.Vendors,
		&item.Testimonial, &item.Categories, &item.Tags, &item.MetaTitle,
		&item.MetaDescription, &item.Status, &item.DisplayOrder,
		&item.CreatedAt, &item.UpdatedAt)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("Portfolio item not found"))
		return
	}

	common.SuccessResponse(c, http.StatusOK, item)
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
