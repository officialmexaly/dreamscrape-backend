package public

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"dreamscape-backend/db"
	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/pkg/errors"
)

// MediaHandlerREST handles media endpoints using Supabase REST API
type MediaHandlerREST struct {
	client *db.Client
}

// NewMediaHandlerREST creates a new media handler using Supabase REST API
func NewMediaHandlerREST() *MediaHandlerREST {
	return &MediaHandlerREST{
		client: database.SupabaseClient,
	}
}

// GetMediaLibrary retrieves all media files using Supabase REST API
func (h *MediaHandlerREST) GetMediaLibrary(c *gin.Context) {
	if h.client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Media library unavailable - database client not initialized",
		})
		return
	}

	mediaType := c.Query("type")
	search := c.Query("search")

	params := map[string]string{
		"order": "created_at.desc",
	}
	if mediaType != "" {
		params["type"] = "eq." + mediaType
	}
	if search != "" {
		params["or"] = "(name.ilike.*" + search + "*,alt_text.ilike.*" + search + "*)"
	}

	mediaRows, err := h.client.Select("media_library", params)
	if err != nil {
		log.Printf("Error querying media library: %v", err)
		common.ErrorResponse(c, err)
		return
	}

	items := make([]map[string]interface{}, 0, len(mediaRows))
	for _, row := range mediaRows {
		id, _ := row["id"].(string)
		name, _ := row["name"].(string)
		url, _ := row["url"].(string)
		mimeType, _ := row["mime_type"].(string)
		altText, _ := row["alt_text"].(string)
		folder, _ := row["folder"].(string)
		mediaTypeValue, _ := row["type"].(string)
		createdAt := row["created_at"]

		var sizeValue interface{}
		if v, ok := row["size"]; ok {
			sizeValue = v
		}

		items = append(items, map[string]interface{}{
			"id":         id,
			"name":       name,
			"url":        url,
			"mime_type":  mimeType,
			"size":       sizeValue,
			"alt_text":   altText,
			"folder":     folder,
			"type":       mediaTypeValue,
			"created_at": createdAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"items": items,
		"count": len(items),
	})
}

// CreateMedia creates a new media entry using Supabase REST API
func (h *MediaHandlerREST) CreateMedia(c *gin.Context) {
	if h.client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Media library unavailable - database client not initialized",
		})
		return
	}

	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	mediaData := map[string]interface{}{}
	if name, ok := req["name"].(string); ok {
		mediaData["name"] = name
	}
	if url, ok := req["url"].(string); ok {
		mediaData["url"] = url
	}
	if typeVal, ok := req["type"].(string); ok {
		mediaData["type"] = typeVal
	}
	if mimeType, ok := req["mime_type"].(string); ok {
		mediaData["mime_type"] = mimeType
	}
	if altText, ok := req["alt_text"].(string); ok {
		mediaData["alt_text"] = altText
	}
	if folder, ok := req["folder"].(string); ok {
		mediaData["folder"] = folder
	}

	result, err := h.client.Insert("media_library", mediaData)
	if err != nil {
		log.Printf("Error creating media: %v", err)
		common.ErrorResponse(c, err)
		return
	}

	c.JSON(http.StatusCreated, result)
}

// UpdateMedia updates media metadata using Supabase REST API
func (h *MediaHandlerREST) UpdateMedia(c *gin.Context) {
	if h.client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Media library unavailable - database client not initialized",
		})
		return
	}

	id := c.Param("id")
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	updateData := map[string]interface{}{}
	if name, ok := req["name"].(string); ok {
		updateData["name"] = name
	}
	if url, ok := req["url"].(string); ok {
		updateData["url"] = url
	}
	if typeVal, ok := req["type"].(string); ok {
		updateData["type"] = typeVal
	}
	if mimeType, ok := req["mime_type"].(string); ok {
		updateData["mime_type"] = mimeType
	}
	if altText, ok := req["alt_text"].(string); ok {
		updateData["alt_text"] = altText
	}
	if folder, ok := req["folder"].(string); ok {
		updateData["folder"] = folder
	}

	result, err := h.client.UpdateByID("media_library", id, updateData)
	if err != nil {
		log.Printf("Error updating media: %v", err)
		common.ErrorResponse(c, err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// DeleteMedia deletes a media file using Supabase REST API
func (h *MediaHandlerREST) DeleteMedia(c *gin.Context) {
	if h.client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Media library unavailable - database client not initialized",
		})
		return
	}

	id := c.Param("id")

	err := h.client.DeleteByID("media_library", id)
	if err != nil {
		log.Printf("Error deleting media: %v", err)
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Media deleted successfully")
}