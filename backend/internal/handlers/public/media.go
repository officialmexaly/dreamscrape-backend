package public

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"dreamscape-backend/internal/models"
	"dreamscape-backend/internal/handlers/common"
	"dreamscape-backend/pkg/errors"
)

// MediaHandler handles media endpoints
type MediaHandler struct {
	db *pgxpool.Pool
}

// NewMediaHandler creates a new media handler
func NewMediaHandler(db *pgxpool.Pool) *MediaHandler {
	return &MediaHandler{db: db}
}

// UploadFile handles file upload
func (h *MediaHandler) UploadFile(c *gin.Context) {
	// TODO: Implement file upload logic
	// This will need to:
	// 1. Parse multipart form
	// 2. Validate file size and type
	// 3. Upload to Supabase Storage
	// 4. Generate thumbnail for images
	// 5. Store metadata in database

	common.MessageResponse(c, http.StatusNotImplemented, "File upload not yet implemented")
}

// GetMediaLibrary retrieves all media files
func (h *MediaHandler) GetMediaLibrary(c *gin.Context) {
	ctx := context.Background()

	// Get query parameters
	mediaType := c.Query("type")
	search := c.Query("search")
	limit := 100

	// Build query
	query := `
		SELECT id, name, url, type, mime_type, size, width, height,
		       alt_text, folder, tags, created_at
		FROM media_library
		WHERE 1=1
	`

	args := []interface{}{}
	argCount := 1

	if mediaType != "" {
		query += " AND type = $" + common.SqlParam(argCount)
		args = append(args, mediaType)
		argCount++
	}

	if search != "" {
		query += " AND (name ILIKE $" + common.SqlParam(argCount) + " OR alt_text ILIKE $" + common.SqlParam(argCount) + ")"
		args = append(args, "%"+search+"%", "%"+search+"%")
		argCount += 2
	}

	query += " ORDER BY created_at DESC LIMIT $" + common.SqlParam(argCount)
	args = append(args, limit)

	rows, err := h.db.Query(ctx, query, args...)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}
	defer rows.Close()

	var mediaItems []models.Media
	for rows.Next() {
		var media models.Media
		err := rows.Scan(
			&media.ID, &media.Name, &media.URL, &media.Type,
			&media.MimeType, &media.Size, &media.Width, &media.Height, &media.AltText,
			&media.Folder, &media.Tags, &media.CreatedAt,
		)
		if err != nil {
			common.ErrorResponse(c, err)
			return
		}
		mediaItems = append(mediaItems, media)
	}

	if err := rows.Err(); err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusOK, mediaItems)
}

// CreateMedia creates a new media entry
func (h *MediaHandler) CreateMedia(c *gin.Context) {
	var req models.CreateMediaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()

	// Create media entry
	var media models.Media
	err := h.db.QueryRow(ctx,
		`INSERT INTO media_library (id, name, url, type, mime_type, size,
		         width, height, alt_text, folder, tags, created_at)
		 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
		 RETURNING id, name, url, type, mime_type, size, width, height,
		         alt_text, folder, tags, created_at`,
		req.Name, req.URL, req.Type, req.MimeType, req.Size,
		req.Width, req.Height, req.AltText, req.Folder, req.Tags).Scan(
		&media.ID, &media.Name, &media.URL, &media.Type,
		&media.MimeType, &media.Size, &media.Width, &media.Height, &media.AltText,
		&media.Folder, &media.Tags, &media.CreatedAt)

	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.SuccessResponse(c, http.StatusCreated, media)
}

// UpdateMedia updates media metadata
func (h *MediaHandler) UpdateMedia(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateMediaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()

	// Build dynamic update query
	query := "UPDATE media_library SET "
	args := []interface{}{}
	argCount := 1

	sets := []string{}

	if req.Name != nil {
		sets = append(sets, "name = $"+common.SqlParam(argCount))
		args = append(args, *req.Name)
		argCount++
	}
	if req.URL != nil {
		sets = append(sets, "url = $"+common.SqlParam(argCount))
		args = append(args, *req.URL)
		argCount++
	}
	if req.Type != nil {
		sets = append(sets, "type = $"+common.SqlParam(argCount))
		args = append(args, *req.Type)
		argCount++
	}
	if req.MimeType != nil {
		sets = append(sets, "mime_type = $"+common.SqlParam(argCount))
		args = append(args, *req.MimeType)
		argCount++
	}
	if req.Size != nil {
		sets = append(sets, "size = $"+common.SqlParam(argCount))
		args = append(args, *req.Size)
		argCount++
	}
	if req.Width != nil {
		sets = append(sets, "width = $"+common.SqlParam(argCount))
		args = append(args, *req.Width)
		argCount++
	}
	if req.Height != nil {
		sets = append(sets, "height = $"+common.SqlParam(argCount))
		args = append(args, *req.Height)
		argCount++
	}
	if req.AltText != nil {
		sets = append(sets, "alt_text = $"+common.SqlParam(argCount))
		args = append(args, *req.AltText)
		argCount++
	}
	if req.Folder != nil {
		sets = append(sets, "folder = $"+common.SqlParam(argCount))
		args = append(args, *req.Folder)
		argCount++
	}
	if req.Tags != nil {
		sets = append(sets, "tags = $"+common.SqlParam(argCount))
		args = append(args, *req.Tags)
		argCount++
	}

	if len(sets) == 0 {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "No fields provided for update",
			Fields:  map[string]string{"error": "at least one field must be provided"},
		})
		return
	}

	query += strings.Join(sets, ", ")
	query += " WHERE id = $" + common.SqlParam(argCount)
	args = append(args, id)

	_, err := h.db.Exec(ctx, query, args...)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Fetch updated media
	var media models.Media
	err = h.db.QueryRow(ctx,
		`SELECT id, name, url, type, mime_type, size, width, height,
		       alt_text, folder, tags, created_at
		 FROM media_library WHERE id = $1`, id).Scan(
		&media.ID, &media.Name, &media.URL, &media.Type,
		&media.MimeType, &media.Size, &media.Width, &media.Height, &media.AltText,
		&media.Folder, &media.Tags, &media.CreatedAt)

	if err != nil {
		common.ErrorResponse(c, errors.NotFound("Media not found"))
		return
	}

	common.SuccessResponse(c, http.StatusOK, media)
}

// DeleteMedia deletes a media file
func (h *MediaHandler) DeleteMedia(c *gin.Context) {
	id := c.Param("id")
	ctx := context.Background()

	// TODO: Delete from Supabase Storage

	_, err := h.db.Exec(ctx, "DELETE FROM media_library WHERE id = $1", id)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Media deleted successfully")
}
