package public

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"dreamscape-backend/backend/database"
	"dreamscape-backend/backend/models"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/pkg/errors"
)

// SettingsHandler handles settings endpoints
type SettingsHandler struct {
}

// NewSettingsHandler creates a new settings handler
func NewSettingsHandler(supabaseClient interface{}) *SettingsHandler {
	return &SettingsHandler{}
}

// GetSiteSettings retrieves site settings
func (h *SettingsHandler) GetSiteSettings(c *gin.Context) {
	if h == nil || database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	// Fetch settings from Supabase
	data, err := database.SupabaseClient.Select("site_settings", nil)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Convert to model format - create default settings first
	settings := models.SiteSettings{
		SocialLinks:   make(map[string]string),
		SEOSettings:   make(map[string]string),
		BusinessHours: make(map[string]string),
	}

	for _, item := range data {
		settingBytes, _ := json.Marshal(item)
		var setting map[string]interface{}
		if err := json.Unmarshal(settingBytes, &setting); err == nil {
			if key, ok := setting["setting_key"].(string); ok {
				if value, ok := setting["setting_value"].(string); ok {
					switch key {
					case "site_name":
						settings.SiteName = value
					case "site_description":
						settings.SiteDescription = value
					case "logo_url":
						settings.LogoURL = value
					case "favicon_url":
						settings.FaviconURL = value
					case "contact_email":
						settings.ContactEmail = value
					case "contact_phone":
						settings.ContactPhone = value
					case "contact_address":
						settings.ContactAddress = value
					case "whatsapp_number":
						settings.WhatsAppNumber = value
					}
				}
			}
		}
	}

	common.SuccessResponse(c, http.StatusOK, settings)
}

// UpdateSiteSettings updates site settings (admin)
func (h *SettingsHandler) UpdateSiteSettings(c *gin.Context) {
	if h == nil || database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	var req models.UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErr := errors.NewValidationError("Invalid request body")
		validationErr.AddField("error", err.Error())
		common.ValidationErrorResponse(c, validationErr)
		return
	}

	// Handle simple string fields
	stringFields := map[string]*string{
		"site_name":        req.SiteName,
		"site_description": req.SiteDescription,
		"logo_url":         req.LogoURL,
		"favicon_url":      req.FaviconURL,
		"contact_email":    req.ContactEmail,
		"contact_phone":    req.ContactPhone,
		"contact_address":  req.ContactAddress,
		"whatsapp_number":  req.WhatsAppNumber,
	}

	for key, value := range stringFields {
		if value != nil {
			// Fetch existing setting
			filters := map[string]string{
				"setting_key": key,
			}
			data, err := database.SupabaseClient.Select("site_settings", filters)

			updateData := map[string]interface{}{
				"setting_key":   key,
				"setting_value": *value,
			}

			if len(data) > 0 {
				// Update existing setting
				if id, ok := data[0]["id"].(string); ok {
					_, err = database.SupabaseClient.Update("site_settings", id, updateData)
					if err != nil {
						common.ErrorResponse(c, err)
						return
					}
				}
			} else {
				// Create new setting
				_, err = database.SupabaseClient.Insert("site_settings", updateData)
				if err != nil {
					common.ErrorResponse(c, err)
					return
				}
			}
		}
	}

	// Handle complex fields (maps) - store as JSON
	if req.SocialLinks != nil {
		socialJSON, _ := json.Marshal(req.SocialLinks)
		updateSetting(h, "social_links", string(socialJSON))
	}

	if req.SEOSettings != nil {
		seoJSON, _ := json.Marshal(req.SEOSettings)
		updateSetting(h, "seo_settings", string(seoJSON))
	}

	if req.BusinessHours != nil {
		hoursJSON, _ := json.Marshal(req.BusinessHours)
		updateSetting(h, "business_hours", string(hoursJSON))
	}

	common.MessageResponse(c, http.StatusOK, "Settings updated successfully")
}

// GetSettingByKey retrieves a setting by key
func (h *SettingsHandler) GetSettingByKey(c *gin.Context) {
	if h == nil || database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	key := c.Param("key")

	// Fetch from Supabase
	filters := map[string]string{
		"setting_key": key,
	}

	data, err := database.SupabaseClient.Select("site_settings", filters)
	if err != nil {
		common.ErrorResponse(c, errors.NotFound("setting not found"))
		return
	}

	if len(data) == 0 {
		common.ErrorResponse(c, errors.NotFound("setting not found"))
		return
	}

	common.SuccessResponse(c, http.StatusOK, data[0])
}

// UpdateSetting updates a single setting (admin)
func (h *SettingsHandler) UpdateSetting(c *gin.Context) {
	if h == nil || database.SupabaseClient == nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse{Error: "Database connection unavailable"})
		return
	}

	key := c.Param("key")
	var req struct {
		Value interface{} `json:"value"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErr := errors.NewValidationError("Invalid request body")
		validationErr.AddField("error", err.Error())
		common.ValidationErrorResponse(c, validationErr)
		return
	}

	// Convert value to string for storage
	var valueStr string
	switch v := req.Value.(type) {
	case string:
		valueStr = v
	case float64, bool:
		valueStr = fmt.Sprintf("%v", v)
	case map[string]interface{}:
		jsonBytes, _ := json.Marshal(v)
		valueStr = string(jsonBytes)
	default:
		jsonBytes, _ := json.Marshal(req.Value)
		valueStr = string(jsonBytes)
	}

	// Fetch existing setting
	filters := map[string]string{
		"setting_key": key,
	}
	data, err := database.SupabaseClient.Select("site_settings", filters)

	updateData := map[string]interface{}{
		"setting_key":   key,
		"setting_value": valueStr,
	}

	if len(data) > 0 {
		// Update existing setting
		if id, ok := data[0]["id"].(string); ok {
			_, err = database.SupabaseClient.Update("site_settings", id, updateData)
		}
	} else {
		// Create new setting
		_, err = database.SupabaseClient.Insert("site_settings", updateData)
	}

	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	common.MessageResponse(c, http.StatusOK, "Setting updated successfully")
}

// Helper function to update a single setting
func updateSetting(h *SettingsHandler, key string, value string) {
	filters := map[string]string{
		"setting_key": key,
	}
	data, err := database.SupabaseClient.Select("site_settings", filters)

	updateData := map[string]interface{}{
		"setting_key":   key,
		"setting_value": value,
	}

	if len(data) > 0 {
		if id, ok := data[0]["id"].(string); ok {
			_, err = database.SupabaseClient.Update("site_settings", id, updateData)
		}
	} else {
		_, err = database.SupabaseClient.Insert("site_settings", updateData)
	}

	if err != nil {
		return
	}
}
