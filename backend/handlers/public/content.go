package public

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"

	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/backend/models"
	"dreamscape-backend/pkg/errors"
)

// ContentHandler handles content endpoints
type ContentHandler struct {
}

// NewContentHandler creates a new content handler
func NewContentHandler(supabaseClient interface{}) *ContentHandler {
	return &ContentHandler{}
}

// GetSiteContent retrieves public site content
func (h *ContentHandler) GetSiteContent(c *gin.Context) {
	if h == nil || database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	// Get query parameters
	page := c.Query("page")
	section := c.Query("section")

	// Build filters for Supabase query
	filters := map[string]string{
		"is_active": "true",
	}
	if page != "" {
		filters["page"] = page
	}
	if section != "" {
		filters["section"] = section
	}

	// Fetch from Supabase
	data, err := database.SupabaseClient.Select("site_content", filters)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Convert to model format
	var contents []models.SiteContent
	for _, item := range data {
		contentBytes, _ := json.Marshal(item)
		var content models.SiteContent
		if err := json.Unmarshal(contentBytes, &content); err == nil {
			contents = append(contents, content)
		}
	}

	common.SuccessResponse(c, http.StatusOK, contents)
}

// AdminGetContent retrieves all content (admin)
func (h *ContentHandler) AdminGetContent(c *gin.Context) {
	if h == nil || database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	// Fetch all content from Supabase
	data, err := database.SupabaseClient.Select("site_content", nil)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Convert to model format
	var contents []models.SiteContent
	for _, item := range data {
		contentBytes, _ := json.Marshal(item)
		var content models.SiteContent
		if err := json.Unmarshal(contentBytes, &content); err == nil {
			contents = append(contents, content)
		}
	}

	common.SuccessResponse(c, http.StatusOK, contents)
}

// GetContentByKey retrieves content by key
func (h *ContentHandler) GetContentByKey(c *gin.Context) {
	if h == nil || database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	key := c.Param("key")

	// Fetch from Supabase with filter
	filters := map[string]string{
		"content_key": key,
		"is_active":   "true",
	}

	data, err := database.SupabaseClient.Select("site_content", filters)
	if err != nil {
		common.ErrorResponse(c, errors.NotFound("content not found"))
		return
	}

	if len(data) == 0 {
		common.ErrorResponse(c, errors.NotFound("content not found"))
		return
	}

	// Convert first result
	contentBytes, _ := json.Marshal(data[0])
	var content models.SiteContent
	if err := json.Unmarshal(contentBytes, &content); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, content)
}

// CreateContent creates new site content
func (h *ContentHandler) CreateContent(c *gin.Context) {
	if h == nil || database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	var req models.CreateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErr := errors.NewValidationError("Invalid request body")
		validationErr.AddField("error", err.Error())
		common.ValidationErrorResponse(c, validationErr)
		return
	}

	// Check if key already exists
	filters := map[string]string{
		"content_key": req.ContentKey,
	}
	existing, _ := database.SupabaseClient.Select("site_content", filters)
	if len(existing) > 0 {
		common.ErrorResponse(c, errors.Conflict("content with this key already exists"))
		return
	}

	// Create content data
	contentData := map[string]interface{}{
		"page":          req.Page,
		"section":       req.Section,
		"content_key":   req.ContentKey,
		"content_type":  req.ContentType,
		"display_order": req.DisplayOrder,
		"is_active":     req.IsActive,
	}

	// Normalize content value
	if req.Content != nil {
		contentValue, contentJSON, contentNumber := normalizeSiteContentValue(req.Content, req.ContentType)
		if contentValue != nil {
			contentData["content"] = contentValue
		}
		if contentJSON != nil {
			contentData["content_json"] = contentJSON
		}
		if contentNumber != nil {
			contentData["content_number"] = contentNumber
		}
	}

	// Insert via Supabase
	_, err := database.SupabaseClient.Insert("site_content", contentData)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Fetch the created content
	filters = map[string]string{
		"content_key": req.ContentKey,
	}
	data, err := database.SupabaseClient.Select("site_content", filters)
	if err != nil || len(data) == 0 {
		common.ErrorResponse(c, errors.InternalServerError("failed to retrieve created content"))
		return
	}

	contentBytes, _ := json.Marshal(data[0])
	var content models.SiteContent
	json.Unmarshal(contentBytes, &content)

	common.SuccessResponse(c, http.StatusCreated, content)
}

// UpdateContent updates existing content
func (h *ContentHandler) UpdateContent(c *gin.Context) {
	if h == nil || database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	id := c.Param("id")
	var req models.UpdateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErr := errors.NewValidationError("Invalid request body")
		validationErr.AddField("error", err.Error())
		common.ValidationErrorResponse(c, validationErr)
		return
	}

	// Build update data
	updateData := map[string]interface{}{}

	if req.Content != nil {
		contentValue, contentJSON, contentNumber := normalizeSiteContentValue(*req.Content, "")
		if contentValue != nil {
			updateData["content"] = contentValue
		}
		if contentJSON != nil {
			updateData["content_json"] = contentJSON
		}
		if contentNumber != nil {
			updateData["content_number"] = contentNumber
		}
	}
	if req.IsActive != nil {
		updateData["is_active"] = *req.IsActive
	}
	if req.DisplayOrder != nil {
		updateData["display_order"] = *req.DisplayOrder
	}

	// Update via Supabase
	_, err := database.SupabaseClient.Update("site_content", id, updateData)
	if err != nil {
		common.ErrorResponse(c, errors.NotFound("content not found"))
		return
	}

	// Fetch updated content
	filters := map[string]string{
		"id": id,
	}
	data, err := database.SupabaseClient.Select("site_content", filters)
	if err != nil || len(data) == 0 {
		common.ErrorResponse(c, errors.InternalServerError("failed to retrieve updated content"))
		return
	}

	contentBytes, _ := json.Marshal(data[0])
	var content models.SiteContent
	json.Unmarshal(contentBytes, &content)

	common.SuccessResponse(c, http.StatusOK, content)
}

// DeleteContent deletes content
func (h *ContentHandler) DeleteContent(c *gin.Context) {
	if h == nil || database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	id := c.Param("id")

	err := database.SupabaseClient.Delete("site_content", id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Content deleted successfully")
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
