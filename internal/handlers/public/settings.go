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

// SettingsHandler handles settings endpoints
type SettingsHandler struct {
	db *pgxpool.Pool
}

// NewSettingsHandler creates a new settings handler
func NewSettingsHandler(db *pgxpool.Pool) *SettingsHandler {
	return &SettingsHandler{db: db}
}

// GetSiteSettings retrieves site settings
func (h *SettingsHandler) GetSiteSettings(c *gin.Context) {
	ctx := context.Background()

	var settings models.SiteSettings
	var socialLinksJSON, seoSettingsJSON, businessHoursJSON []byte

	err := h.db.QueryRow(ctx,
		`SELECT id, site_name, site_description, logo_url, favicon_url, contact_email, contact_phone,
		       contact_address, whatsapp_number, social_links, seo_settings, business_hours, updated_at
		 FROM site_settings
		 ORDER BY updated_at DESC
		 LIMIT 1`).Scan(
		&settings.ID, &settings.SiteName, &settings.SiteDescription, &settings.LogoURL,
		&settings.FaviconURL, &settings.ContactEmail, &settings.ContactPhone,
		&settings.ContactAddress, &settings.WhatsAppNumber, &socialLinksJSON,
		&seoSettingsJSON, &businessHoursJSON, &settings.UpdatedAt,
	)

	if err != nil {
		// Return default settings if none exist
		settings = models.SiteSettings{
			SiteName:        "Dreamscape Curated Events",
			SiteDescription: "Creating unforgettable experiences",
			LogoURL:         "",
			FaviconURL:      "",
			ContactEmail:    "info@dreamscape-events.com",
			ContactPhone:    "",
			ContactAddress:  "",
			WhatsAppNumber:  "",
			SocialLinks:     make(map[string]string),
			SEOSettings:     make(map[string]string),
			BusinessHours:   make(map[string]string),
		}
	} else {
		// Parse JSON fields
		json.Unmarshal(socialLinksJSON, &settings.SocialLinks)
		json.Unmarshal(seoSettingsJSON, &settings.SEOSettings)
		json.Unmarshal(businessHoursJSON, &settings.BusinessHours)
	}

	common.SuccessResponse(c, http.StatusOK, settings)
}

// UpdateSiteSettings updates site settings
func (h *SettingsHandler) UpdateSiteSettings(c *gin.Context) {
	var req models.UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationErrorResponse(c, &errors.ValidationError{
			Message: "Invalid request body",
			Fields:  map[string]string{"error": err.Error()},
		})
		return
	}

	ctx := context.Background()

	// Get current settings
	var currentSettings models.SiteSettings
	var socialLinksJSON, seoSettingsJSON, businessHoursJSON []byte

	err := h.db.QueryRow(ctx,
		`SELECT id, site_name, site_description, logo_url, favicon_url, contact_email, contact_phone,
		       contact_address, whatsapp_number, social_links, seo_settings, business_hours, updated_at
		 FROM site_settings
		 ORDER BY updated_at DESC
		 LIMIT 1`).Scan(
		&currentSettings.ID, &currentSettings.SiteName, &currentSettings.SiteDescription,
		&currentSettings.LogoURL, &currentSettings.FaviconURL, &currentSettings.ContactEmail,
		&currentSettings.ContactPhone, &currentSettings.ContactAddress, &currentSettings.WhatsAppNumber,
		&socialLinksJSON, &seoSettingsJSON, &businessHoursJSON, &currentSettings.UpdatedAt,
	)

	socialLinks := make(map[string]string)
	seoSettings := make(map[string]string)
	businessHours := make(map[string]string)

	if err == nil {
		json.Unmarshal(socialLinksJSON, &socialLinks)
		json.Unmarshal(seoSettingsJSON, &seoSettings)
		json.Unmarshal(businessHoursJSON, &businessHours)
	}

	// Update fields with provided values
	if req.SiteName != nil {
		currentSettings.SiteName = *req.SiteName
	}
	if req.SiteDescription != nil {
		currentSettings.SiteDescription = *req.SiteDescription
	}
	if req.LogoURL != nil {
		currentSettings.LogoURL = *req.LogoURL
	}
	if req.FaviconURL != nil {
		currentSettings.FaviconURL = *req.FaviconURL
	}
	if req.ContactEmail != nil {
		currentSettings.ContactEmail = *req.ContactEmail
	}
	if req.ContactPhone != nil {
		currentSettings.ContactPhone = *req.ContactPhone
	}
	if req.ContactAddress != nil {
		currentSettings.ContactAddress = *req.ContactAddress
	}
	if req.WhatsAppNumber != nil {
		currentSettings.WhatsAppNumber = *req.WhatsAppNumber
	}
	if req.SocialLinks != nil {
		socialLinks = req.SocialLinks
	}
	if req.SEOSettings != nil {
		seoSettings = req.SEOSettings
	}
	if req.BusinessHours != nil {
		businessHours = req.BusinessHours
	}

	// Convert maps to JSON
	socialLinksNewJSON, _ := json.Marshal(socialLinks)
	seoSettingsNewJSON, _ := json.Marshal(seoSettings)
	businessHoursNewJSON, _ := json.Marshal(businessHours)

	// Update or insert settings
	if currentSettings.ID != "" {
		// Update existing
		_, err = h.db.Exec(ctx,
			`UPDATE site_settings
			 SET site_name = $1, site_description = $2, logo_url = $3, favicon_url = $4, contact_email = $5,
			     contact_phone = $6, contact_address = $7, whatsapp_number = $8, social_links = $9,
			     seo_settings = $10, business_hours = $11, updated_at = NOW()
			 WHERE id = $12`,
			currentSettings.SiteName, currentSettings.SiteDescription, currentSettings.LogoURL,
			currentSettings.FaviconURL, currentSettings.ContactEmail, currentSettings.ContactPhone,
			currentSettings.ContactAddress, currentSettings.WhatsAppNumber, socialLinksNewJSON,
			seoSettingsNewJSON, businessHoursNewJSON, currentSettings.ID)
	} else {
		// Create new
		err = h.db.QueryRow(ctx,
			`INSERT INTO site_settings (site_name, site_description, logo_url, favicon_url, contact_email,
			     contact_phone, contact_address, whatsapp_number, social_links, seo_settings, business_hours, updated_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
			 RETURNING id, updated_at`,
			currentSettings.SiteName, currentSettings.SiteDescription, currentSettings.LogoURL,
			currentSettings.FaviconURL, currentSettings.ContactEmail, currentSettings.ContactPhone,
			currentSettings.ContactAddress, currentSettings.WhatsAppNumber, socialLinksNewJSON,
			seoSettingsNewJSON, businessHoursNewJSON).Scan(
			&currentSettings.ID, &currentSettings.UpdatedAt)
	}

	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Return updated settings
	currentSettings.SocialLinks = socialLinks
	currentSettings.SEOSettings = seoSettings
	currentSettings.BusinessHours = businessHours

	common.SuccessResponse(c, http.StatusOK, currentSettings)
}
