package config

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// CORSConfig holds CORS configuration
type CORSConfig struct {
	AllowedOrigins     []string `json:"allowed_origins"`
	AllowedMethods     []string `json:"allowed_methods"`
	AllowedHeaders     []string `json:"allowed_headers"`
	ExposedHeaders     []string `json:"exposed_headers"`
	AllowCredentials   bool     `json:"allow_credentials"`
	MaxAgeSeconds      int      `json:"max_age_seconds"`
	DebugMode          bool     `json:"debug_mode"`
}

// RateLimitingConfig holds rate limiting configuration
type RateLimitingConfig struct {
	Enabled            bool                        `json:"enabled"`
	DefaultLimits      EndpointRateLimit           `json:"default_limits"`
	EndpointSpecificLimits map[string]EndpointRateLimit `json:"endpoint_specific_limits"`
	ExemptedPaths      []string                    `json:"exempted_paths"`
	CleanupIntervalMinutes int                     `json:"cleanup_interval_minutes"`
	BypassKeys         []string                    `json:"bypass_keys"`
}

// EndpointRateLimit holds rate limit for an endpoint
type EndpointRateLimit struct {
	RequestsPerMinute int `json:"requests_per_minute"`
	RequestsPerHour   int `json:"requests_per_hour"`
}

// UploadsConfig holds file upload configuration
type UploadsConfig struct {
	Enabled              bool                          `json:"enabled"`
	MaxFileSizeMB        int                           `json:"max_file_size_mb"`
	MaxFileSizeBytes     int64                         `json:"max_file_size_bytes"`
	AllowedFileTypes     []string                      `json:"allowed_file_types"`
	FileTypeRestrictions map[string]FileTypeRestriction `json:"file_type_restrictions"`
	ValidationRules      FileValidationRules           `json:"validation_rules"`
	StorageSettings      StorageSettings               `json:"storage_settings"`
	Security             FileSecurity                  `json:"security"`
}

// FileTypeRestriction holds restrictions for specific file types
type FileTypeRestriction struct {
	MaxSizeMB    int      `json:"max_size_mb"`
	AllowedTypes []string `json:"allowed_types"`
}

// FileValidationRules holds file validation rules
type FileValidationRules struct {
	MinFileSizeBytes      int      `json:"min_file_size_bytes"`
	MaxFilenameLength     int      `json:"max_filename_length"`
	AllowedFilenamePattern string  `json:"allowed_filename_pattern"`
	ForbiddenFilenames    []string `json:"forbidden_filenames"`
}

// StorageSettings holds storage configuration
type StorageSettings struct {
	CompressionEnabled   bool `json:"compression_enabled"`
	ThumbnailGeneration  bool `json:"thumbnail_generation"`
	AutoOptimization     bool `json:"auto_optimization"`
	BackupEnabled        bool `json:"backup_enabled"`
}

// FileSecurity holds file security settings
type FileSecurity struct {
	ScanForMalware       bool `json:"scan_for_malware"`
	CheckFileSignature   bool `json:"check_file_signature"`
	SanitizeFilename     bool `json:"sanitize_filename"`
	MaxUploadsPerRequest int  `json:"max_uploads_per_request"`
}

// MessagesConfig holds API response messages
type MessagesConfig struct {
	Version  string              `json:"version"`
	Language string              `json:"language"`
	Errors   map[string]map[string]string `json:"errors"`
	Success  map[string]string   `json:"success"`
	Info     map[string]string   `json:"info"`
}

// FeaturesConfig holds feature flags
type FeaturesConfig struct {
	Version      string                 `json:"version"`
	Environment  string                 `json:"environment"`
	Features     map[string]interface{} `json:"features"`
	BetaFeatures map[string]bool        `json:"beta_features"`
}

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

	// Calendly
	CalendlyToken string

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

	// CORS
	CORS *CORSConfig

	// Rate Limiting
	RateLimiting *RateLimitingConfig

	// Uploads
	Uploads *UploadsConfig

	// Messages
	Messages *MessagesConfig

	// Features
	Features *FeaturesConfig
}

var AppConfig *Config

// loadCORSConfig loads CORS configuration from JSON file
func loadCORSConfig() (*CORSConfig, error) {
	// Try to find cors.json in various locations (including Vercel paths)
	paths := []string{
		"config/cors.json",
		"./config/cors.json",
		"cors.json",
		"./cors.json",
		"/var/task/config/cors.json",  // Vercel path
		"/app/config/cors.json",        // Some container environments
		"../config/cors.json",          // Relative path fallback
	}

	var corsFile *os.File
	var err error

	// Try each path
	for _, path := range paths {
		corsFile, err = os.Open(path)
		if err == nil {
			fmt.Printf("Loaded CORS config from: %s\n", path)
			break
		}
	}

	// If no file found, use default configuration
	if corsFile == nil {
		fmt.Println("Warning: cors.json not found, using default CORS configuration")
		return GetDefaultCORSConfig(), nil
	}
	defer corsFile.Close()

	var corsConfig CORSConfig
	if err := json.NewDecoder(corsFile).Decode(&corsConfig); err != nil {
		return nil, fmt.Errorf("failed to parse cors.json: %w", err)
	}

	return &corsConfig, nil
}

// GetDefaultCORSConfig returns default CORS configuration
func GetDefaultCORSConfig() *CORSConfig {
	return &CORSConfig{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"http://localhost:8080",
		},
		AllowedMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:     []string{"Origin", "Content-Type", "Authorization", "Cookie", "X-CSRF-Token", "X-Request-ID"},
		ExposedHeaders:     []string{"Content-Length", "Content-Type", "X-Request-ID"},
		AllowCredentials:   true,
		MaxAgeSeconds:      12 * 60 * 60, // 12 hours
		DebugMode:          false,
	}
}

// loadRateLimitingConfig loads rate limiting configuration from JSON file
func loadRateLimitingConfig() (*RateLimitingConfig, error) {
	return loadConfigFile("config/rate-limiting.json", func() *RateLimitingConfig {
		return &RateLimitingConfig{
			Enabled: true,
			DefaultLimits: EndpointRateLimit{
				RequestsPerMinute: 60,
				RequestsPerHour:   1000,
			},
			EndpointSpecificLimits: make(map[string]EndpointRateLimit),
			ExemptedPaths:          []string{"/health", "/swagger/*", "/favicon.ico"},
			CleanupIntervalMinutes: 5,
			BypassKeys:             []string{},
		}
	})
}

// loadUploadsConfig loads uploads configuration from JSON file
func loadUploadsConfig() (*UploadsConfig, error) {
	return loadConfigFile("config/uploads.json", func() *UploadsConfig {
		return &UploadsConfig{
			Enabled:          true,
			MaxFileSizeMB:    10,
			MaxFileSizeBytes: 10 * 1024 * 1024,
			AllowedFileTypes: []string{"image/jpeg", "image/png", "image/gif", "application/pdf"},
			FileTypeRestrictions: map[string]FileTypeRestriction{
				"image": {
					MaxSizeMB:    5,
					AllowedTypes: []string{"image/jpeg", "image/png", "image/gif"},
				},
			},
			ValidationRules: FileValidationRules{
				MinFileSizeBytes:   1024,
				MaxFilenameLength:  255,
				AllowedFilenamePattern: "^[a-zA-Z0-9._-]+$",
				ForbiddenFilenames: []string{".", ".."},
			},
			StorageSettings: StorageSettings{
				CompressionEnabled:  true,
				ThumbnailGeneration: true,
			},
			Security: FileSecurity{
				CheckFileSignature: true,
				SanitizeFilename:   true,
				MaxUploadsPerRequest: 10,
			},
		}
	})
}

// loadMessagesConfig loads messages configuration from JSON file
func loadMessagesConfig() (*MessagesConfig, error) {
	return loadConfigFile("config/messages.json", func() *MessagesConfig {
		return &MessagesConfig{
			Version:  "1.0.0",
			Language: "en",
			Errors: map[string]map[string]string{
				"authentication": {
					"invalid_credentials": "Invalid email or password",
					"unauthorized": "You don't have permission to access this resource",
				},
				"general": {
					"internal_error": "An internal server error occurred",
					"not_found": "The requested resource was not found",
				},
			},
			Success: map[string]string{
				"created": "Successfully created",
				"updated": "Successfully updated",
			},
			Info: map[string]string{
				"welcome": "Welcome to Dreamscape Events API",
			},
		}
	})
}

// loadFeaturesConfig loads features configuration from JSON file
func loadFeaturesConfig() (*FeaturesConfig, error) {
	return loadConfigFile("config/features.json", func() *FeaturesConfig {
		return &FeaturesConfig{
			Version:     "1.0.0",
			Environment: "development",
			Features: map[string]interface{}{
				"authentication": map[string]interface{}{
					"enabled": true,
					"providers": map[string]interface{}{
						"email_password": map[string]interface{}{"enabled": true},
						"google_oauth":   map[string]interface{}{"enabled": true},
					},
				},
				"api": map[string]interface{}{
					"enabled":        true,
					"rate_limiting":  map[string]interface{}{"enabled": true},
					"swagger_docs":   map[string]interface{}{"enabled": true},
				},
			},
			BetaFeatures: map[string]bool{
				"multi_language_support": false,
				"api_v2":                 false,
			},
		}
	})
}

// loadConfigFile is a generic helper to load config files
func loadConfigFile[T any](path string, defaultFunc func() *T) (*T, error) {
	// Try multiple possible paths for different environments
	paths := []string{
		path,                    // config/cors.json
		"./" + path,             // ./config/cors.json
		"../" + path,            // ../config/cors.json
		"../../" + path,         // ../../config/cors.json
		"/var/task/" + path,     // Vercel path
		"/app/" + path,          // Some container environments
	}

	var configFile *os.File
	var err error

	for _, p := range paths {
		configFile, err = os.Open(p)
		if err == nil {
			fmt.Printf("Loaded config from: %s\n", p)
			break
		}
	}

	if configFile == nil {
		fmt.Printf("Warning: %s not found in any location, using default configuration\n", path)
		return defaultFunc(), nil
	}
	defer configFile.Close()

	var config T
	if err := json.NewDecoder(configFile).Decode(&config); err != nil {
		return nil, fmt.Errorf("failed to parse %s: %w", path, err)
	}

	return &config, nil
}

// Load initializes the configuration from environment variables
func Load() error {
	// Load .env file if it exists (optional for local development)
	if err := godotenv.Load(); err != nil {
		// .env file is optional - continue with environment variables
		fmt.Println("Note: .env file not found, using environment variables")
	}

	// Load CORS configuration
	corsConfig, err := loadCORSConfig()
	if err != nil {
		fmt.Printf("Warning: Failed to load CORS config, using defaults: %v\n", err)
		corsConfig = GetDefaultCORSConfig()
	}

	// Load Rate Limiting configuration
	rateLimitingConfig, err := loadRateLimitingConfig()
	if err != nil {
		fmt.Printf("Warning: Failed to load rate limiting config, using defaults: %v\n", err)
	}

	// Load Uploads configuration
	uploadsConfig, err := loadUploadsConfig()
	if err != nil {
		fmt.Printf("Warning: Failed to load uploads config, using defaults: %v\n", err)
	}

	// Load Messages configuration
	messagesConfig, err := loadMessagesConfig()
	if err != nil {
		fmt.Printf("Warning: Failed to load messages config, using defaults: %v\n", err)
	}

	// Load Features configuration
	featuresConfig, err := loadFeaturesConfig()
	if err != nil {
		fmt.Printf("Warning: Failed to load features config, using defaults: %v\n", err)
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

		// Calendly
		CalendlyToken: getEnv("CALENDLY_TOKEN", ""),

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

		// CORS
		CORS: corsConfig,

		// Rate Limiting
		RateLimiting: rateLimitingConfig,

		// Uploads
		Uploads: uploadsConfig,

		// Messages
		Messages: messagesConfig,

		// Features
		Features: featuresConfig,
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

// GetMessage retrieves a message by category and key with optional parameters
func GetMessage(category, key string, params map[string]string) string {
	if AppConfig == nil || AppConfig.Messages == nil {
		return key
	}

	if categoryMessages, ok := AppConfig.Messages.Errors[category]; ok {
		if message, ok := categoryMessages[key]; ok {
			return formatMessage(message, params)
		}
	}

	// Fallback to general errors if category not found
	if generalMessages, ok := AppConfig.Messages.Errors["general"]; ok {
		if message, ok := generalMessages[key]; ok {
			return formatMessage(message, params)
		}
	}

	return key
}

// GetSuccessMessage retrieves a success message
func GetSuccessMessage(key string, params map[string]string) string {
	if AppConfig == nil || AppConfig.Messages == nil {
		return key
	}

	if message, ok := AppConfig.Messages.Success[key]; ok {
		return formatMessage(message, params)
	}

	return key
}

// GetInfoMessage retrieves an info message
func GetInfoMessage(key string, params map[string]string) string {
	if AppConfig == nil || AppConfig.Messages == nil {
		return key
	}

	if message, ok := AppConfig.Messages.Info[key]; ok {
		return formatMessage(message, params)
	}

	return key
}

// formatMessage formats a message with parameters
func formatMessage(message string, params map[string]string) string {
	result := message
	for key, value := range params {
		placeholder := "{" + key + "}"
		result = replaceAll(result, placeholder, value)
	}
	return result
}

// replaceAll replaces all occurrences of old with new in s
func replaceAll(s, old, new string) string {
	result := ""
	for {
		idx := indexOf(s, old)
		if idx == -1 {
			result += s
			break
		}
		result += s[:idx] + new
		s = s[idx+len(old):]
	}
	return result
}

// indexOf returns the index of substr in s, or -1 if not found
func indexOf(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}

// IsFeatureEnabled checks if a feature is enabled
func IsFeatureEnabled(featurePath string) bool {
	if AppConfig == nil || AppConfig.Features == nil {
		return false
	}

	features := AppConfig.Features.Features
	pathParts := splitPath(featurePath)

	for i, part := range pathParts {
		if i == len(pathParts)-1 {
			// Last part - check if it's a boolean enabled field
			if featureMap, ok := features[part].(map[string]interface{}); ok {
				if enabled, ok := featureMap["enabled"].(bool); ok {
					return enabled
				}
			}
			return false
		}

		// Navigate deeper into the feature map
		if featureMap, ok := features[part].(map[string]interface{}); ok {
			// Check if this level has an enabled field
			if enabled, ok := featureMap["enabled"].(bool); ok && !enabled {
				return false
			}
			// Move to next level
			if nextFeatures, ok := featureMap["features"].(map[string]interface{}); ok {
				features = nextFeatures
			} else if nextFeatures, ok := featureMap["providers"].(map[string]interface{}); ok {
				features = nextFeatures
			} else {
				// Try to use the current map as the next level
				features = featureMap
			}
		} else {
			return false
		}
	}

	return false
}

// IsBetaFeatureEnabled checks if a beta feature is enabled
func IsBetaFeatureEnabled(feature string) bool {
	if AppConfig == nil || AppConfig.Features == nil {
		return false
	}

	if enabled, ok := AppConfig.Features.BetaFeatures[feature]; ok {
		return enabled
	}

	return false
}

// splitPath splits a dot-notation path into parts
func splitPath(path string) []string {
	var parts []string
	current := ""

	for _, char := range path {
		if char == '.' {
			if current != "" {
				parts = append(parts, current)
				current = ""
			}
		} else {
			current += string(char)
		}
	}

	if current != "" {
		parts = append(parts, current)
	}

	return parts
}

// GetUploadMaxSize returns the maximum file upload size
func GetUploadMaxSize() int64 {
	if AppConfig != nil && AppConfig.Uploads != nil {
		return AppConfig.Uploads.MaxFileSizeBytes
	}
	return 10 * 1024 * 1024 // 10MB default
}

// IsFileTypeAllowed checks if a file type is allowed for upload
func IsFileTypeAllowed(fileType string) bool {
	if AppConfig != nil && AppConfig.Uploads != nil {
		for _, allowedType := range AppConfig.Uploads.AllowedFileTypes {
			if allowedType == fileType {
				return true
			}
		}
	}
	return false
}

// GetEndpointRateLimit returns rate limits for a specific endpoint
func GetEndpointRateLimit(path string) (minuteLimit, hourLimit int, exempt bool) {
	if AppConfig == nil || AppConfig.RateLimiting == nil {
		return 60, 1000, false // defaults
	}

	// Check if path is exempt
	for _, exemptPath := range AppConfig.RateLimiting.ExemptedPaths {
		if matchPath(exemptPath, path) {
			return 0, 0, true
		}
	}

	// Check for endpoint-specific limits
	for pattern, limits := range AppConfig.RateLimiting.EndpointSpecificLimits {
		if matchPath(pattern, path) {
			return limits.RequestsPerMinute, limits.RequestsPerHour, false
		}
	}

	// Return default limits
	return AppConfig.RateLimiting.DefaultLimits.RequestsPerMinute,
		AppConfig.RateLimiting.DefaultLimits.RequestsPerHour,
		false
}

// matchPath checks if a pattern matches a path (supports wildcards)
func matchPath(pattern, path string) bool {
	if pattern == path {
		return true
	}

	// Handle wildcard patterns
	if len(pattern) > 0 && pattern[len(pattern)-1] == '*' {
		prefix := pattern[:len(pattern)-1]
		return len(path) >= len(prefix) && path[:len(prefix)] == prefix
	}

	return false
}
