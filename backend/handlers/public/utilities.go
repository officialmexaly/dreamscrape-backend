package public

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"

	"dreamscape-backend/db"
	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/pkg/errors"
)

// UtilitiesHandler handles utility endpoints
type UtilitiesHandler struct {
	client *db.Client
}

// NewUtilitiesHandler creates a new utilities handler
func NewUtilitiesHandler(client *db.Client) *UtilitiesHandler {
	return &UtilitiesHandler{client: client}
}

// HealthCheck performs a system health check
// @Summary      Health check
// @Description  Check if the API and database connections are healthy
// @Tags         health
// @Accept       json
// @Produce      json
// @Success      200  {object}  map[string]interface{} "status: healthy/unhealthy"
// @Failure      503  {object}  map[string]interface{} "status: unhealthy with error details"
// @Router       /api/health [get]
func (h *UtilitiesHandler) HealthCheck(c *gin.Context) {
	ctx := context.Background()

	status := gin.H{
		"status": "healthy",
		"components": gin.H{
			"database": "healthy",
		},
	}

	// Check database health
	if err := database.HealthCheck(ctx); err != nil {
		status["status"] = "unhealthy"
		status["components"].(gin.H)["database"] = "unhealthy"
		status["components"].(gin.H)["database_error"] = err.Error()
		c.JSON(503, status)
		return
	}

	c.JSON(200, status)
}

// RevalidateCache handles cache revalidation
func (h *UtilitiesHandler) RevalidateCache(c *gin.Context) {
	var req struct {
		Path string `json:"path" binding:"required"`
		Tags string `json:"tags"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	// TODO: Implement cache revalidation logic
	// This would typically:
	// 1. Invalidate Next.js cache for specific paths
	// 2. Clear CDN cache if applicable
	// 3. Update any internal cache systems

	common.MessageResponse(c, http.StatusOK, "Cache revalidation triggered")
}

// GetDatabaseTables retrieves database table information
// @Summary      Get database tables
// @Description  Retrieve information about database tables and row counts
// @Tags         admin
// @Accept       json
// @Produce      json
// @Success      200  {object}  map[string]interface{} "tables: array of table information"
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/db/tables [get]
func (h *UtilitiesHandler) GetDatabaseTables(c *gin.Context) {
	if h == nil || h.client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database client unavailable"})
		return
	}

	// List of known tables in our application
	tables := []gin.H{
		{"name": "users", "type": "base table"},
		{"name": "bookings", "type": "base table"},
		{"name": "events", "type": "base table"},
		{"name": "services", "type": "base table"},
		{"name": "portfolio_items", "type": "base table"},
		{"name": "site_content", "type": "base table"},
		{"name": "site_settings", "type": "base table"},
		{"name": "media", "type": "base table"},
		{"name": "refresh_tokens", "type": "base table"},
	}

	// Get row counts for each table
	for i, table := range tables {
		tableName := table["name"].(string)
		result, err := h.client.Select(tableName, map[string]string{"select": "count"})
		if err != nil {
			tables[i]["row_count"] = 0
			tables[i]["error"] = "Unable to count rows"
		} else if len(result) > 0 {
			// Try to get count from result
			if count, ok := result[0]["count"]; ok {
				tables[i]["row_count"] = count
			} else {
				tables[i]["row_count"] = len(result)
			}
		} else {
			tables[i]["row_count"] = 0
		}
	}

	c.JSON(200, gin.H{
		"tables": tables,
		"total":  len(tables),
	})
}

// GetDatabaseStats retrieves database statistics
// @Summary      Get database statistics
// @Description  Retrieve statistics about database tables
// @Tags         admin
// @Accept       json
// @Produce      json
// @Success      200  {object}  map[string]interface{} "stats: table statistics"
// @Failure      500  {object}  models.ErrorResponse
// @Router       /api/db/stats [get]
func (h *UtilitiesHandler) GetDatabaseStats(c *gin.Context) {
	if h == nil || h.client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database client unavailable"})
		return
	}

	stats := gin.H{
		"tables": gin.H{},
		"status": "connected",
	}

	// Get stats for each table
	tables := []string{
		"users", "bookings", "events", "services", "portfolio_items",
		"site_content", "site_settings", "media", "refresh_tokens",
	}

	for _, table := range tables {
		result, err := h.client.Select(table, map[string]string{"select": "count"})
		if err == nil && len(result) > 0 {
			stats["tables"].(gin.H)[table] = result
		} else {
			stats["tables"].(gin.H)[table] = "error"
		}
	}

	c.JSON(200, stats)
}
