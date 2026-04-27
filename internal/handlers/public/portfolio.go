package public

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"dreamscape-backend/internal/database"
	"dreamscape-backend/internal/models"
)

// PortfolioHandler handles portfolio item operations
type PortfolioHandler struct {
	pool           *pgxpool.Pool
	supabaseClient interface{} // Will be *supabase.Client
}

// NewPortfolioHandler creates a new portfolio handler
func NewPortfolioHandler() *PortfolioHandler {
	return &PortfolioHandler{
		pool:           database.GetPool(),
		supabaseClient: database.GetClient(),
	}
}

// GetPortfolioItems retrieves all portfolio items
// @Summary      Get all portfolio items
// @Description  Retrieve all portfolio items with optional filtering
// @Tags         portfolio
// @Accept       json
// @Produce      json
// @Success      200  {object}  models.PortfolioItemsResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/portfolio-items [get]
func (h *PortfolioHandler) GetPortfolioItems(c *gin.Context) {
	// Check if Supabase client is available (preferred method)
	if database.GetClient() != nil {
		log.Println("Using Supabase REST API for portfolio items")
		h.getPortfolioItemsViaSupabase(c)
		return
	}

	// Fall back to PostgreSQL if available
	if h.pool != nil {
		log.Println("Using PostgreSQL for portfolio items")
		h.getPortfolioItemsViaPostgreSQL(c)
		return
	}

	// No database connection available
	log.Println("No database connection available")
	c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
}

func (h *PortfolioHandler) getPortfolioItemsViaSupabase(c *gin.Context) {
	startTime := time.Now()

	// Use the Supabase client from the database package
	supabaseClient := database.GetClient()
	if supabaseClient == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Supabase client not available"})
		return
	}

	// Query portfolio items using Supabase REST API
	itemsData, err := supabaseClient.Select("portfolio_items", nil)
	if err != nil {
		log.Printf("Error querying portfolio items via Supabase: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve portfolio items"})
		return
	}

	log.Printf("✅ Retrieved %d portfolio items via Supabase in %v", len(itemsData), time.Since(startTime))

	// Return the raw data for now - the frontend can work with generic JSON
	c.JSON(http.StatusOK, map[string]interface{}{
		"items": itemsData,
	})
}

func (h *PortfolioHandler) getPortfolioItemsViaPostgreSQL(c *gin.Context) {
	startTime := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		SELECT id, slug, title, excerpt, author, categories, tags, content,
		       client_name, event_date, event_type, location, description,
		       images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status,
		       display_order, created_at, updated_at
		FROM portfolio_items
		ORDER BY display_order ASC, created_at DESC`

	rows, err := h.pool.Query(ctx, query)
	if err != nil {
		log.Printf("Error querying portfolio items: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve portfolio items"})
		return
	}
	defer rows.Close()

	items, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (map[string]interface{}, error) {
		var id, slug, title, excerpt, author, clientName, eventType, location string
		var description, content, testimonial, metaTitle, metaDescription, status sql.NullString
		var eventDate time.Time
		var categories, tags, images, galleryImages, vendors []string
		var featuredImage sql.NullString
		var budget sql.NullFloat64
		var guestCount sql.NullInt64
		var displayOrder int
		var createdAt, updatedAt time.Time

		err := row.Scan(
			&id, &slug, &title, &excerpt, &author, &categories, &tags, &content,
			&clientName, &eventDate, &eventType, &location, &description,
			&images, &featuredImage, &galleryImages, &budget, &guestCount,
			&vendors, &testimonial, &metaTitle, &metaDescription, &status,
			&displayOrder, &createdAt, &updatedAt,
		)
		if err != nil {
			return nil, err
		}

		return map[string]interface{}{
			"id":             id,
			"slug":           slug,
			"title":          title,
			"excerpt":        excerpt,
			"author":         author,
			"categories":     categories,
			"tags":           tags,
			"content":        content,
			"client_name":    clientName,
			"event_date":     eventDate,
			"event_type":     eventType,
			"location":       location,
			"description":    description.String,
			"images":         images,
			"featured_image": featuredImage.String,
			"gallery_images": galleryImages,
			"budget":         budget.Float64,
			"guest_count":    guestCount.Int64,
			"vendors":        vendors,
			"testimonial":    testimonial.String,
			"meta_title":     metaTitle.String,
			"meta_description": metaDescription.String,
			"status":         status.String,
			"display_order":  displayOrder,
			"created_at":     createdAt,
			"updated_at":     updatedAt,
		}, nil
	})

	if err != nil {
		log.Printf("Error scanning portfolio items: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to parse portfolio items"})
		return
	}

	log.Printf("✅ Retrieved %d portfolio items in %v", len(items), time.Since(startTime))
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func parseOptionalDate(value *string) (*time.Time, error) {
	if value == nil {
		return nil, nil
	}

	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil, nil
	}

	parsed, err := time.Parse("2006-01-02", trimmed)
	if err != nil {
		return nil, fmt.Errorf("invalid event_date format: expected YYYY-MM-DD")
	}

	return &parsed, nil
}

// GetPortfolioItem retrieves a single portfolio item by ID or slug
// @Summary      Get a portfolio item
// @Description  Retrieve a single portfolio item by ID or slug
// @Tags         portfolio
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Portfolio item ID or slug"
// @Success      200  {object}  models.PortfolioItemResponse
// @Failure      404  {object}  models.ErrorResponse
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/portfolio-items/{id} [get]
func (h *PortfolioHandler) GetPortfolioItem(c *gin.Context) {
	id := c.Param("id")

	// Check if ID is a valid UUID
	if _, err := uuid.Parse(id); err == nil {
		// It's a UUID, query by ID
		h.getItemByID(c, id)
		return
	}

	// It's a slug, query by slug
	h.getItemBySlug(c, id)
}

func (h *PortfolioHandler) getItemByID(c *gin.Context, id string) {
	supabaseClient := database.GetClient()
	if supabaseClient != nil {
		items, err := supabaseClient.Select("portfolio_items", map[string]string{
			"id":    "eq." + id,
			"limit": "1",
		})
		if err != nil {
			log.Printf("Error querying portfolio item via Supabase: %v", err)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve portfolio item"})
			return
		}
		if len(items) == 0 {
			log.Printf("Portfolio item not found: %s", id)
			c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Portfolio item not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"item": items[0]})
		return
	}

	if h.pool == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, slug, title, excerpt, author, categories, tags, content,
		       client_name, event_date, event_type, location, description,
		       images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status,
		       display_order, created_at, updated_at
		FROM portfolio_items
		WHERE id = $1`

	row := h.pool.QueryRow(ctx, query, id)

	item, err := scanPortfolioItem(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			log.Printf("Portfolio item not found: %s", id)
			c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Portfolio item not found"})
		} else {
			log.Printf("Error querying portfolio item: %v", err)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve portfolio item"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"item": item})
}

func (h *PortfolioHandler) getItemBySlug(c *gin.Context, slug string) {
	supabaseClient := database.GetClient()
	if supabaseClient != nil {
		items, err := supabaseClient.Select("portfolio_items", map[string]string{
			"slug":  "eq." + slug,
			"limit": "1",
		})
		if err != nil {
			log.Printf("Error querying portfolio item via Supabase: %v", err)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve portfolio item"})
			return
		}
		if len(items) == 0 {
			log.Printf("Portfolio item not found: %s", slug)
			c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Portfolio item not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"item": items[0]})
		return
	}

	if h.pool == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "No database connection available"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, slug, title, excerpt, author, categories, tags, content,
		       client_name, event_date, event_type, location, description,
		       images, featured_image, gallery_images, budget, guest_count,
		       vendors, testimonial, meta_title, meta_description, status,
		       display_order, created_at, updated_at
		FROM portfolio_items
		WHERE slug = $1`

	row := h.pool.QueryRow(ctx, query, slug)

	item, err := scanPortfolioItem(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			log.Printf("Portfolio item not found: %s", slug)
			c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "Portfolio item not found"})
		} else {
			log.Printf("Error querying portfolio item: %v", err)
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve portfolio item"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"item": item})
}

// scanPortfolioItem scans a portfolio item from a database row
func scanPortfolioItem(row pgx.Row) (map[string]interface{}, error) {
	var id, slug, title, excerpt, author, clientName, eventType, location string
	var description, content, testimonial, metaTitle, metaDescription, status sql.NullString
	var eventDate time.Time
	var categories, tags, images, galleryImages, vendors []string
	var featuredImage sql.NullString
	var budget sql.NullFloat64
	var guestCount sql.NullInt64
	var displayOrder int
	var createdAt, updatedAt time.Time

	err := row.Scan(
		&id, &slug, &title, &excerpt, &author, &categories, &tags, &content,
		&clientName, &eventDate, &eventType, &location, &description,
		&images, &featuredImage, &galleryImages, &budget, &guestCount,
		&vendors, &testimonial, &metaTitle, &metaDescription, &status,
		&displayOrder, &createdAt, &updatedAt,
	)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"id":             id,
		"slug":           slug,
		"title":          title,
		"excerpt":        excerpt,
		"author":         author,
		"categories":     categories,
		"tags":           tags,
		"content":        content,
		"client_name":    clientName,
		"event_date":     eventDate,
		"event_type":     eventType,
		"location":       location,
		"description":    description.String,
		"images":         images,
		"featured_image": featuredImage.String,
		"gallery_images": galleryImages,
		"budget":         budget.Float64,
		"guest_count":    guestCount.Int64,
		"vendors":        vendors,
		"testimonial":    testimonial.String,
		"meta_title":     metaTitle.String,
		"meta_description": metaDescription.String,
		"status":         status.String,
		"display_order":  displayOrder,
		"created_at":     createdAt,
		"updated_at":     updatedAt,
	}, nil
}

// CreatePortfolioItem creates a new portfolio item
// @Summary      Create a portfolio item
// @Description  Create a new portfolio item
// @Tags         portfolio
// @Accept       json
// @Produce      json
// @Param        request  body      models.CreatePortfolioItemRequest  true  "Portfolio item data"
// @Success      201      {object}  models.PortfolioItemResponse
// @Failure      400      {object}  models.ErrorResponse
// @Failure      500      {object}  models.ErrorResponse
// @Router       /api/portfolio-items [post]
func (h *PortfolioHandler) CreatePortfolioItem(c *gin.Context) {
	var req models.CreatePortfolioItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Error binding request: %v", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request format"})
		return
	}

	// Use Supabase client for write operations
	client := database.GetClient()
	if client == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database client unavailable"})
		return
	}

	status := "draft"
	if req.Status != nil {
		status = *req.Status
	}

	displayOrder := 0
	if req.DisplayOrder != nil {
		displayOrder = *req.DisplayOrder
	}

	// Build portfolio item data
	itemData := map[string]interface{}{
		"slug":            req.Slug,
		"title":           req.Title,
		"excerpt":         req.Excerpt,
		"author":          req.Author,
		"categories":      req.Categories,
		"tags":            req.Tags,
		"content":         req.Content,
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
		"status":          status,
		"display_order":   displayOrder,
	}

	result, err := client.Insert("portfolio_items", itemData)
	if err != nil {
		log.Printf("Error creating portfolio item: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create portfolio item"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"item": result})
}

// UpdatePortfolioItem updates an existing portfolio item
// @Summary      Update a portfolio item
// @Description  Update an existing portfolio item by ID or slug
// @Tags         portfolio
// @Accept       json
// @Produce      json
// @Param        id       path      string                          true  "Portfolio item ID or slug"
// @Param        request  body      models.UpdatePortfolioItemRequest  true  "Portfolio item data"
// @Success      200      {object}  models.PortfolioItemResponse
// @Failure      400      {object}  models.ErrorResponse
// @Failure      404      {object}  models.ErrorResponse
// @Failure      500      {object}  models.ErrorResponse
// @Router       /api/portfolio-items/{id} [put]
func (h *PortfolioHandler) UpdatePortfolioItem(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdatePortfolioItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Error binding request: %v", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request format"})
		return
	}

	client := database.GetClient()
	if client == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database client unavailable"})
		return
	}

	// Build update data dynamically
	updateData := make(map[string]interface{})
	if req.Slug != nil {
		updateData["slug"] = *req.Slug
	}
	if req.Title != nil {
		updateData["title"] = *req.Title
	}
	if req.Excerpt != nil {
		updateData["excerpt"] = *req.Excerpt
	}
	if req.Author != nil {
		updateData["author"] = *req.Author
	}
	if req.Categories != nil {
		updateData["categories"] = req.Categories
	}
	if req.Tags != nil {
		updateData["tags"] = req.Tags
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
		updateData["images"] = req.Images
	}
	if req.FeaturedImage != nil {
		updateData["featured_image"] = *req.FeaturedImage
	}
	if req.GalleryImages != nil {
		updateData["gallery_images"] = req.GalleryImages
	}
	if req.Budget != nil {
		updateData["budget"] = *req.Budget
	}
	if req.GuestCount != nil {
		updateData["guest_count"] = *req.GuestCount
	}
	if req.Vendors != nil {
		updateData["vendors"] = req.Vendors
	}
	if req.Testimonial != nil {
		updateData["testimonial"] = *req.Testimonial
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

	if len(updateData) == 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "No fields to update"})
		return
	}

	result, err := client.UpdateByID("portfolio_items", id, updateData)
	if err != nil {
		log.Printf("Error updating portfolio item: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update portfolio item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"item": result})
}


// DeletePortfolioItem deletes a portfolio item
func (h *PortfolioHandler) DeletePortfolioItem(c *gin.Context) {
	id := c.Param("id")

	client := database.GetClient()
	if client == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database client unavailable"})
		return
	}

	err := client.DeleteByID("portfolio_items", id)
	if err != nil {
		log.Printf("Error deleting portfolio item: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to delete portfolio item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Portfolio item deleted successfully"})
}
