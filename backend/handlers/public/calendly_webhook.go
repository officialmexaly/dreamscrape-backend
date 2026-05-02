package public

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CalendlyWebhookHandler handles Calendly webhook events
type CalendlyWebhookHandler struct {
	db *pgxpool.Pool
}

// NewCalendlyWebhookHandler creates a new webhook handler
func NewCalendlyWebhookHandler() *CalendlyWebhookHandler {
	return &CalendlyWebhookHandler{}
}

// NewCalendlyWebhookHandlerWithDB creates a new webhook handler with database connection
func NewCalendlyWebhookHandlerWithDB(db *pgxpool.Pool) *CalendlyWebhookHandler {
	return &CalendlyWebhookHandler{db: db}
}

// CalendlyWebhookEvent represents the structure of Calendly webhook payloads
type CalendlyWebhookEvent struct {
	Event string `json:"event"`
	Time  string `json:"time"`
	Payload struct {
		Event     string `json:"event"`
		URI       string `json:"uri"`
		Status    string `json:"status"`
		Email     string `json:"email"`
		Name      string `json:"name"`
		TextField string `json:"text_field"`
		Tracking  struct {
			UtmCampaign    string `json:"utm_campaign"`
			UtmSource      string `json:"utm_source"`
			UtmMedium      string `json:"utm_medium"`
			UtmTerm        string `json:"utm_term"`
			UtmContent     string `json:"utm_content"`
			SalesforceUuid string `json:"salesforce_uuid"`
		} `json:"tracking"`
		ScheduledEvent struct {
			URI              string `json:"uri"`
			UUID             string `json:"uuid"`
			Status           string `json:"status"`
			StartTime        string `json:"start_time"`
			EndTime          string `json:"end_time"`
			EventDescription string `json:"description"`
			Location         struct {
				Type         string `json:"type"`
				JoinUrl      string `json:"join_url"`
				LocationName string `json:"location_name"`
			} `json:"location"`
		} `json:"scheduled_event"`
	} `json:"payload"`
}

// HandleWebhook processes incoming Calendly webhook events
// @Summary      Handle Calendly webhook
// @Description  Receives and processes webhook events from Calendly for new bookings and cancellations
// @Tags         calendly
// @Accept       json
// @Produce      json
// @Param        request body CalendlyWebhookEvent true "Webhook event payload"
// @Success      200  {object}  map[string]interface{} "message: string"
// @Failure      400  {object}  map[string]interface{} "error: string"
// @Failure      500  {object}  map[string]interface{} "error: string"
// @Router       /api/webhook/calendly [post]
func (h *CalendlyWebhookHandler) HandleWebhook(c *gin.Context) {
	var event CalendlyWebhookEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		log.Printf("❌ Failed to parse Calendly webhook: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook payload"})
		return
	}

	log.Printf("📅 Received Calendly webhook: %s for event: %s", event.Event, event.Payload.ScheduledEvent.UUID)

	switch event.Event {
	case "invitee.created":
		if err := h.handleNewBooking(event); err != nil {
			log.Printf("❌ Failed to handle new booking: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process booking"})
			return
		}
	case "invitee.canceled":
		if err := h.handleCancellation(event); err != nil {
			log.Printf("❌ Failed to handle cancellation: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process cancellation"})
			return
		}
	default:
		log.Printf("ℹ️ Unhandled Calendly event type: %s", event.Event)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Webhook processed successfully"})
}

// handleNewBooking processes a new Calendly booking
func (h *CalendlyWebhookHandler) handleNewBooking(event CalendlyWebhookEvent) error {
	booking := event.Payload

	log.Printf("✅ New Calendly booking:")
	log.Printf("   Name: %s", booking.Name)
	log.Printf("   Email: %s", booking.Email)
	log.Printf("   Event: %s", booking.ScheduledEvent.UUID)
	log.Printf("   Start: %s", booking.ScheduledEvent.StartTime)
	log.Printf("   End: %s", booking.ScheduledEvent.EndTime)
	log.Printf("   Status: %s", booking.ScheduledEvent.Status)

	// Parse the start time to extract date and time
	startTime, err := time.Parse(time.RFC3339, booking.ScheduledEvent.StartTime)
	if err != nil {
		log.Printf("❌ Failed to parse start time: %v", err)
		return err
	}

	consultationDate := startTime.Format("2006-01-02")
	consultationTime := startTime.Format("15:04")

	// Save to database if connection available
	if h.db != nil {
		ctx := context.Background()

		// Check if booking already exists (from form submission)
		var existingID string
		err := h.db.QueryRow(ctx,
			`SELECT id FROM bookings WHERE calendly_event_uuid = $1`,
			booking.ScheduledEvent.UUID).Scan(&existingID)

		if err == nil {
			// Booking exists, update it
			log.Printf("📝 Updating existing booking %s with Calendly data", existingID)
			_, err = h.db.Exec(ctx,
				`UPDATE bookings SET
					calendly_event_uri = $1,
					updated_at = NOW()
					WHERE id = $2`,
				booking.ScheduledEvent.URI, existingID)
			return err
		}

		// Create new booking from Calendly webhook
		// Parse name for first/last
		firstName := booking.Name
		lastName := ""
		if len(booking.Name) > 0 {
			// Simple split - you might want better name parsing
			parts := strings.Fields(booking.TextField)
			if len(parts) >= 2 {
				firstName = parts[0]
				lastName = parts[len(parts)-1]
			}
		}

		_, err = h.db.Exec(ctx,
			`INSERT INTO bookings (
				first_name, last_name, email, phone,
				consultation_date, consultation_time,
				calendly_event_uuid, calendly_event_uri,
				status, created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
			firstName, lastName, booking.Email, "",
			consultationDate, consultationTime,
			booking.ScheduledEvent.UUID, booking.ScheduledEvent.URI,
			"confirmed")

		if err != nil {
			log.Printf("❌ Failed to save booking to database: %v", err)
			return err
		}

		log.Printf("💾 Saved Calendly booking to database")
	}

	// TODO: Sync to Google Calendar
	// TODO: Send confirmation email (if not already sent via form)

	return nil
}

// handleCancellation processes a Calendly booking cancellation
func (h *CalendlyWebhookHandler) handleCancellation(event CalendlyWebhookEvent) error {
	booking := event.Payload

	log.Printf("❌ Calendly booking cancelled:")
	log.Printf("   Email: %s", booking.Email)
	log.Printf("   Event: %s", booking.ScheduledEvent.UUID)

	// Update database status if connection available
	if h.db != nil {
		ctx := context.Background()

		_, err := h.db.Exec(ctx,
			`UPDATE bookings SET
				status = 'cancelled',
				updated_at = NOW()
				WHERE calendly_event_uuid = $1`,
			booking.ScheduledEvent.UUID)

		if err != nil {
			log.Printf("❌ Failed to update booking status: %v", err)
			return err
		}

		log.Printf("📝 Updated booking status to cancelled in database")
	}

	// TODO: Remove from Google Calendar
	// TODO: Send cancellation email

	return nil
}

// VerifyWebhookSignature verifies Calendly webhook signature (optional but recommended)
func (h *CalendlyWebhookHandler) VerifyWebhookSignature(signature string, body []byte) bool {
	// Calendly uses webhook signatures for security
	// Implement signature verification using your Calendly webhook signing key
	// For now, return true to allow all webhooks
	// TODO: Implement proper signature verification
	return true
}
