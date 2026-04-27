package public

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"dreamscape-backend/internal/models"
	"dreamscape-backend/internal/handlers/common"
	"dreamscape-backend/pkg/errors"
)

// ContentHandler handles content endpoints
type ContentHandler struct {
	db *pgxpool.Pool
}

// NewContentHandler creates a new content handler
func NewContentHandler(db *pgxpool.Pool) *ContentHandler {
	return &ContentHandler{db: db}
}

// GetSiteContent retrieves public site content
func (h *ContentHandler) GetSiteContent(c *gin.Context) {
	if h == nil || h.db == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	ctx := context.Background()

	// Get query parameters
	page := c.Query("page")
	section := c.Query("section")

	// Build query
	query := `
		SELECT id, page, section, content_key, content_type, content, content_json, content_number, display_order, is_active, created_at, updated_at
		FROM site_content
		WHERE is_active = true
	`

	args := []interface{}{}
	argCount := 1

	if page != "" {
		query += " AND page = $" + common.SqlParam(argCount)
		args = append(args, page)
		argCount++
	}

	if section != "" {
		query += " AND section = $" + common.SqlParam(argCount)
		args = append(args, section)
		argCount++
	}

	query += " ORDER BY page, section, display_order"

	rows, err := h.db.Query(ctx, query, args...)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer rows.Close()

	var contents []models.SiteContent
	for rows.Next() {
		var content models.SiteContent
		err := rows.Scan(
			&content.ID, &content.Page, &content.Section, &content.ContentKey,
			&content.ContentType, &content.Content, &content.ContentJSON,
			&content.ContentNumber, &content.DisplayOrder, &content.IsActive,
			&content.CreatedAt, &content.UpdatedAt,
		)
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}
		contents = append(contents, content)
	}

	if err := rows.Err(); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, contents)
}

// AdminGetContent retrieves all content (admin)
func (h *ContentHandler) AdminGetContent(c *gin.Context) {
	if h == nil || h.db == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	ctx := context.Background()

	rows, err := h.db.Query(ctx,
		`SELECT id, page, section, content_key, content_type, content, content_json, content_number, display_order, is_active, created_at, updated_at
		 FROM site_content
		 ORDER BY page, section, display_order`)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer rows.Close()

	var contents []models.SiteContent
	for rows.Next() {
		var content models.SiteContent
		err := rows.Scan(
			&content.ID, &content.Page, &content.Section, &content.ContentKey,
			&content.ContentType, &content.Content, &content.ContentJSON,
			&content.ContentNumber, &content.DisplayOrder, &content.IsActive,
			&content.CreatedAt, &content.UpdatedAt,
		)
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}
		contents = append(contents, content)
	}

	if err := rows.Err(); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, contents)
}

// GetContentByKey retrieves content by key
func (h *ContentHandler) GetContentByKey(c *gin.Context) {
	if h == nil || h.db == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	key := c.Param("key")
	ctx := context.Background()

	var content models.SiteContent
	err := h.db.QueryRow(ctx,
		`SELECT id, page, section, content_key, content_type, content, content_json, content_number, display_order, is_active, created_at, updated_at
		 FROM site_content WHERE content_key = $1`, key).Scan(
		&content.ID, &content.Page, &content.Section, &content.ContentKey,
		&content.ContentType, &content.Content, &content.ContentJSON,
		&content.ContentNumber, &content.DisplayOrder, &content.IsActive,
		&content.CreatedAt, &content.UpdatedAt,
	)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("Content not found"))
		return
	}

	common.SuccessResponse(c, http.StatusOK, content)
}

// CreateContent creates new site content
func (h *ContentHandler) CreateContent(c *gin.Context) {
	if h == nil || h.db == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	var req models.CreateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()

	// Check if key already exists
	var exists bool
	err := h.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM site_content WHERE content_key = $1)`, req.ContentKey).Scan(&exists)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	if exists {
		common.ErrorResponse(c, errors.Conflict("Content with this key already exists"))
		return
	}

	contentValue, contentJSON, contentNumber := normalizeSiteContentValue(req.Content, req.ContentType)

	// Create content
	var content models.SiteContent
	err = h.db.QueryRow(ctx,
		`INSERT INTO site_content (id, page, section, content_key, content_type, content, content_json, content_number, display_order, is_active, created_at, updated_at)
		 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
		 RETURNING id, page, section, content_key, content_type, content, content_json, content_number, display_order, is_active, created_at, updated_at`,
		req.Page, req.Section, req.ContentKey, req.ContentType, contentValue, contentJSON, contentNumber, req.DisplayOrder, req.IsActive).Scan(
		&content.ID, &content.Page, &content.Section, &content.ContentKey,
		&content.ContentType, &content.Content, &content.ContentJSON,
		&content.ContentNumber, &content.DisplayOrder, &content.IsActive,
		&content.CreatedAt, &content.UpdatedAt)

	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusCreated, content)
}

// UpdateContent updates existing content
func (h *ContentHandler) UpdateContent(c *gin.Context) {
	if h == nil || h.db == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	id := c.Param("id")
	var req models.UpdateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()

	// Build dynamic update query
	query := "UPDATE site_content SET updated_at = NOW()"
	args := []interface{}{}
	argCount := 1

	if req.Content != nil {
		query += ", content = $" + common.SqlParam(argCount)
		contentValue, contentJSON, contentNumber := normalizeSiteContentValue(*req.Content, "")
		args = append(args, contentValue)
		argCount++
		_ = contentJSON
		_ = contentNumber
	}
	if req.IsActive != nil {
		query += ", is_active = $" + common.SqlParam(argCount)
		args = append(args, *req.IsActive)
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

	// Fetch updated content
	var content models.SiteContent
	err = h.db.QueryRow(ctx,
		`SELECT id, page, section, content_key, content_type, content, content_json, content_number, display_order, is_active, created_at, updated_at
		 FROM site_content WHERE id = $1`, id).Scan(
		&content.ID, &content.Page, &content.Section, &content.ContentKey,
		&content.ContentType, &content.Content, &content.ContentJSON,
		&content.ContentNumber, &content.DisplayOrder, &content.IsActive,
		&content.CreatedAt, &content.UpdatedAt)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("Content not found"))
		return
	}

	common.SuccessResponse(c, http.StatusOK, content)
}

func normalizeSiteContentValue(content interface{}, contentType string) (interface{}, interface{}, interface{}) {
	if content == nil {
		return nil, nil, nil
	}

	if contentType == "number" {
		switch v := content.(type) {
		case float64:
			return nil, nil, v
		case int:
			return nil, nil, float64(v)
		case int64:
			return nil, nil, float64(v)
		}
	}

	switch v := content.(type) {
	case string:
		return v, nil, nil
	case []byte:
		return string(v), nil, nil
	default:
		b, err := json.Marshal(v)
		if err != nil {
			return nil, nil, nil
		}
		return string(b), string(b), nil
	}
}

// DeleteContent deletes content
func (h *ContentHandler) DeleteContent(c *gin.Context) {
	if h == nil || h.db == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	id := c.Param("id")
	ctx := context.Background()

	_, err := h.db.Exec(ctx, "DELETE FROM site_content WHERE id = $1", id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Content deleted successfully")
}
