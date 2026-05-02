package public

import (
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"dreamscape-backend/backend/supabase"
	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/backend/storage"
	"dreamscape-backend/pkg/config"
	"dreamscape-backend/pkg/errors"
)

// MediaStorageHandler handles media endpoints with Supabase Storage integration
type MediaStorageHandler struct {
	dbClient  *supabase.Client
	storage   *storage.SupabaseStorageClient
}

// NewMediaStorageHandler creates a new media handler with Supabase Storage
func NewMediaStorageHandler() *MediaStorageHandler {
	// Try to determine which bucket to use
	bucketName := "dreamscape" // Use the main bucket
	if config.AppConfig.SupabaseBucket != "" {
		bucketName = config.AppConfig.SupabaseBucket
	}

	storageClient := storage.NewSupabaseStorageClient(
		config.AppConfig.SupabaseURL,
		config.AppConfig.SupabaseServiceRoleKey,
		bucketName,
	)

	return &MediaStorageHandler{
		dbClient: database.SupabaseClient,
		storage:  storageClient,
	}
}

// GetMediaLibrary retrieves all media files directly from Supabase Storage
func (h *MediaStorageHandler) GetMediaLibrary(c *gin.Context) {
	if h.storage == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Media library unavailable - storage client not initialized",
		})
		return
	}

	// Get query parameters
	folder := c.Query("folder")
	mediaType := c.Query("type")
	search := c.Query("search")
	limit := 100
	if limitParam := c.Query("limit"); limitParam != "" {
		if l, err := strconv.Atoi(limitParam); err == nil && l > 0 && l <= 1000 {
			limit = l
		}
	}

	// List files from Supabase Storage
	files, err := h.storage.ListFiles(folder, limit)
	if err != nil {
		log.Printf("Error listing files from storage: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve files from storage",
			"details": err.Error(),
		})
		return
	}

	// Filter by media type and search if specified
	items := make([]map[string]interface{}, 0, len(files))
	for _, file := range files {
		name, _ := file["name"].(string)
		publicURL, _ := file["public_url"].(string)

		// Skip if not matching search criteria
		if search != "" && !strings.Contains(strings.ToLower(name), strings.ToLower(search)) {
			continue
		}

		// Determine media type from file extension
		fileMediaType := determineMediaType(name)
		if mediaType != "" && fileMediaType != mediaType {
			continue
		}

		// Extract file metadata
		var sizeValue interface{}
		if size, ok := file["metadata"].(map[string]interface{})["size"]; ok {
			sizeValue = size
		}

		items = append(items, map[string]interface{}{
			"name":       name,
			"url":        publicURL,
			"type":       fileMediaType,
			"size":       sizeValue,
			"folder":     folder,
			"created_at": file["updated_at"],
			"source":     "supabase_storage",
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"items": items,
		"count": len(items),
		"source": "supabase_storage",
	})
}

// UploadMedia handles file upload to Supabase Storage
func (h *MediaStorageHandler) UploadMedia(c *gin.Context) {
	if h.storage == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Storage service unavailable",
		})
		return
	}

	// Parse multipart form
	fileHeader, err := c.FormFile("file")
	if err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid file upload",
			Fields:  map[string]string{"file": "File is required"},
		})
		return
	}

	// Validate file size (max 10MB)
	const maxFileSize = 10 * 1024 * 1024
	if fileHeader.Size > maxFileSize {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "File too large",
			Fields:  map[string]string{"file": "File size must be less than 10MB"},
		})
		return
	}

	// Get additional form data
	folder := c.PostForm("folder")
	altText := c.PostForm("alt_text")
	mediaType := c.PostForm("type")
	if mediaType == "" {
		mediaType = determineMediaType(fileHeader.Filename)
	}

	// Upload file to Supabase Storage
	fileURL, err := h.storage.UploadFile(fileHeader, folder)
	if err != nil {
		log.Printf("Error uploading file to storage: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to upload file to storage",
			"details": err.Error(),
		})
		return
	}

	// Store metadata in database
	mediaData := map[string]interface{}{
		"id":         uuid.NewString(),
		"name":       fileHeader.Filename,
		"url":        fileURL,
		"type":       mediaType,
		"mime_type":  fileHeader.Header.Get("Content-Type"),
		"size":       fileHeader.Size,
		"alt_text":   altText,
		"folder":     folder,
		"created_at": "NOW()",
	}

	if h.dbClient != nil {
		result, err := h.dbClient.Insert("media_library", mediaData)
		if err != nil {
			log.Printf("Warning: failed to save media metadata: %v", err)
			// Don't fail the request, but include a warning
		} else {
			c.JSON(http.StatusCreated, result)
			return
		}
	}

	// Return upload result even if database save failed
	c.JSON(http.StatusCreated, gin.H{
		"id":       mediaData["id"],
		"name":     mediaData["name"],
		"url":      fileURL,
		"type":     mediaType,
		"mime_type": mediaData["mime_type"],
		"size":     mediaData["size"],
		"folder":   mediaData["folder"],
		"message":  "File uploaded successfully to storage",
		"warning":  "Metadata storage failed",
	})
}

// CreateMedia creates a new media entry (metadata only, for external URLs)
func (h *MediaStorageHandler) CreateMedia(c *gin.Context) {
	if h.dbClient == nil {
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

	result, err := h.dbClient.Insert("media_library", mediaData)
	if err != nil {
		log.Printf("Error creating media: %v", err)
		common.ErrorResponse(c, err)
		return
	}

	c.JSON(http.StatusCreated, result)
}

// UpdateMedia updates media metadata
func (h *MediaStorageHandler) UpdateMedia(c *gin.Context) {
	if h.dbClient == nil {
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
	if altText, ok := req["alt_text"].(string); ok {
		updateData["alt_text"] = altText
	}
	if folder, ok := req["folder"].(string); ok {
		updateData["folder"] = folder
	}

	result, err := h.dbClient.UpdateByID("media_library", id, updateData)
	if err != nil {
		log.Printf("Error updating media: %v", err)
		common.ErrorResponse(c, err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// DeleteMedia deletes a media file from both database and storage
func (h *MediaStorageHandler) DeleteMedia(c *gin.Context) {
	if h.dbClient == nil && h.storage == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Media library unavailable - service not initialized",
		})
		return
	}

	id := c.Param("id")
	var fileURL string

	// Get the media record first to find the file URL
	if h.dbClient != nil {
		params := map[string]string{"id": "eq." + id}
		mediaRecords, err := h.dbClient.Select("media_library", params)
		if err == nil && len(mediaRecords) > 0 {
			fileURL, _ = mediaRecords[0]["url"].(string)

			// Delete from database first
			err = h.dbClient.DeleteByID("media_library", id)
			if err != nil {
				log.Printf("Error deleting media from database: %v", err)
				common.ErrorResponse(c, err)
				return
			}
		}
	}

	// Then delete from storage if URL was found
	if h.storage != nil && fileURL != "" {
		if err := h.storage.DeleteFile(fileURL); err != nil {
			log.Printf("Warning: failed to delete file from storage: %v", err)
			// Don't fail the request if storage deletion fails
		}
	}

	common.MessageResponse(c, http.StatusOK, "Media deleted successfully")
}

// Helper functions
func determineMediaType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg":
		return "image"
	case ".mp4", ".mov", ".avi", ".webm", ".mkv":
		return "video"
	case ".pdf", ".doc", ".docx", ".txt", ".xls", ".xlsx":
		return "document"
	default:
		return "other"
	}
}

func getMimeType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".svg":
		return "image/svg+xml"
	case ".mp4":
		return "video/mp4"
	case ".mov":
		return "video/quicktime"
	case ".pdf":
		return "application/pdf"
	default:
		return "application/octet-stream"
	}
}