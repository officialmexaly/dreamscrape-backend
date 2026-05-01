package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration values
type Config struct {
	// Server
	ServerPort  string
	GinMode     string
	FrontendURL string

	// Authentication
	JWTSecret            string
	AccessTokenDuration  time.Duration
	RefreshTokenDuration time.Duration

	// Email
	ResendAPIKey string
	FromEmail    string

	// Google Calendar
	GoogleClientID     string
	GoogleClientSecret string
	GoogleCalendarID   string

	// Supabase
	SupabaseURL            string
	SupabaseKey            string
	SupabaseServiceRoleKey string
	SupabaseBucket         string
	MaxUploadSize          int64

	// Rate Limiting
	RateLimitPerMinute int
	RateLimitPerHour   int

	// Security
	CSRFSecret   string
	CookieDomain string
	CookieSecure bool
}

var AppConfig *Config

// Load initializes the configuration from environment variables
func Load() error {
	// Load .env file if it exists (optional for local development)
	if err := godotenv.Load(); err != nil {
		// .env file is optional - continue with environment variables
		fmt.Println("Note: .env file not found, using environment variables")
	}

	AppConfig = &Config{
		// Server
		ServerPort:  getEnv("PORT", "8080"),
		GinMode:     getEnv("GIN_MODE", "debug"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),

		// Authentication
		JWTSecret:            getEnv("JWT_SECRET", ""),
		AccessTokenDuration:  getDuration("ACCESS_TOKEN_DURATION", 15*time.Minute),
		RefreshTokenDuration: getDuration("REFRESH_TOKEN_DURATION", 7*24*time.Hour),

		// Email
		ResendAPIKey: getEnv("RESEND_API_KEY", ""),
		FromEmail:    getEnv("FROM_EMAIL", "noreply@dreamscape-events.com"),

		// Google Calendar
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleCalendarID:   getEnv("GOOGLE_CALENDAR_ID", ""),

		// Supabase
		SupabaseURL:            getEnv("SUPABASE_URL", ""),
		SupabaseKey:            getEnv("SUPABASE_KEY", getEnv("SUPABASE_SERVICE_ROLE_KEY", "")),
		SupabaseServiceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),
		SupabaseBucket:         getEnv("SUPABASE_BUCKET", "media"),
		MaxUploadSize:          int64(getInt("MAX_UPLOAD_SIZE_MB", 10) * 1024 * 1024),

		// Rate Limiting
		RateLimitPerMinute: getInt("RATE_LIMIT_PER_MINUTE", 60),
		RateLimitPerHour:   getInt("RATE_LIMIT_PER_HOUR", 1000),

		// Security
		CSRFSecret:   getEnv("CSRF_SECRET", ""),
		CookieDomain: getEnv("COOKIE_DOMAIN", ""),
		CookieSecure: getBool("COOKIE_SECURE", false),
	}

	// Validate required configuration (log warnings but don't fail for optional fields)
	if err := AppConfig.Validate(); err != nil {
		fmt.Printf("Configuration warning: %v\n", err)
	}

	return nil
}

// Validate checks if all required configuration values are set
func (c *Config) Validate() error {
	// Only critical validation - JWT secret and Supabase credentials
	if c.JWTSecret == "" {
		fmt.Println("Warning: JWT_SECRET not set - authentication will not work properly")
	}
	if c.SupabaseURL == "" {
		return fmt.Errorf("SUPABASE_URL is required")
	}
	if c.SupabaseKey == "" {
		return fmt.Errorf("SUPABASE_KEY is required")
	}
	return nil
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return defaultValue
}

func getDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
