# Configuration Usage Examples

This file provides practical examples of how to use the new configuration system in your code.

## 🚀 Rate Limiting Examples

### Endpoint-Specific Rate Limiting
```go
// In your handler or middleware
func LoginHandler(c *gin.Context) {
    // Get rate limits for this endpoint
    minuteLimit, hourLimit, exempt := config.GetEndpointRateLimit("/api/auth/login")

    if !exempt {
        // Apply rate limiting
        if !checkRateLimit(c, minuteLimit, hourLimit) {
            c.JSON(429, gin.H{
                "error": config.GetMessage("rate_limit", "too_many_requests", nil),
            })
            return
        }
    }

    // Your login logic here
}
```

### Custom Rate Limiting by User Tier
```go
// Get different rate limits based on user tier
func getRateLimitsForUser(user *models.User) (int, int) {
    if user.IsAdmin {
        return 120, 2000 // Higher limits for admins
    } else if user.IsPremium {
        return 100, 1500 // Premium users
    }
    return 60, 1000 // Standard users
}
```

## 📁 File Upload Examples

### Using Upload Configuration
```go
// In your upload handler
func UploadMediaHandler(c *gin.Context) {
    // Get max file size from config
    maxSize := config.GetUploadMaxSize()

    // Check if file type is allowed
    fileHeader, err := c.FormFile("file")
    if err != nil {
        c.JSON(400, gin.H{"error": "File is required"})
        return
    }

    // Check file type
    fileType := fileHeader.Header.Get("Content-Type")
    if !config.IsFileTypeAllowed(fileType) {
        c.JSON(400, gin.H{
            "error": config.GetMessage("validation", "invalid_file_type", map[string]string{
                "file_type": fileType,
            }),
        })
        return
    }

    // Check file size
    if fileHeader.Size > maxSize {
        c.JSON(400, gin.H{
            "error": config.GetMessage("validation", "file_too_large", map[string]string{
                "max_size": fmt.Sprintf("%.1f", float64(maxSize)/(1024*1024)),
            }),
        })
        return
    }

    // Process upload
}
```

### File Type Validation
```go
// Validate multiple file uploads
func UploadMultipleFiles(c *gin.Context) {
    form, err := c.MultipartForm()
    if err != nil {
        c.JSON(400, gin.H{"error": "Invalid form data"})
        return
    }

    files := form.File["files"]
    if len(files) > 10 { // Max 10 files
        c.JSON(400, gin.H{"error": "Too many files"})
        return
    }

    for _, file := range files {
        if !config.IsFileTypeAllowed(file.Header.Get("Content-Type")) {
            c.JSON(400, gin.H{
                "error": fmt.Sprintf("File type %s not allowed", file.Header.Get("Content-Type")),
            })
            return
        }
    }

    // Process files
}
```

## 💬 Message System Examples

### Error Messages with Parameters
```go
// Validation error with dynamic parameters
func ValidatePassword(password string) error {
    if len(password) < 8 {
        return fmt.Errorf(config.GetMessage("validation", "password_too_short", map[string]string{
            "min_length": "8",
        }))
    }
    return nil
}

// Usage in handler
if err := ValidatePassword(newPassword); err != nil {
    c.JSON(400, gin.H{"error": err.Error()})
    return
}
```

### Success Messages
```go
// Success message with resource name
func CreateUserHandler(c *gin.Context) {
    // Create user logic
    user := createUser()

    c.JSON(201, gin.H{
        "message": config.GetSuccessMessage("created", map[string]string{
            "resource": "user",
        }),
        "data": user,
    })
}
```

### Contextual Error Messages
```go
// Database error handling
func GetUserByID(id string) (*models.User, error) {
    user, err := db.QueryUser(id)
    if err != nil {
        if errors.Is(err, db.ErrNotFound) {
            return nil, fmt.Errorf(config.GetMessage("database", "record_not_found", nil))
        }
        return nil, fmt.Errorf(config.GetMessage("database", "query_failed", nil))
    }
    return user, nil
}
```

## 🚦 Feature Flags Examples

### Conditional Feature Enablement
```go
// In your handler
func BookEventHandler(c *gin.Context) {
    // Check if Google Calendar integration is enabled
    if config.IsFeatureEnabled("bookings.google_calendar_integration") {
        // Create Google Calendar event
        createGoogleCalendarEvent(event)
    }

    // Check if email notifications are enabled
    if config.IsFeatureEnabled("bookings.email_notifications.confirmation_email") {
        // Send confirmation email
        sendConfirmationEmail(user, event)
    }

    c.JSON(200, gin.H{"status": "booked"})
}
```

### OAuth Provider Management
```go
// In OAuth handler
func GetEnabledOAuthProviders() []string {
    providers := []string{}

    if config.IsFeatureEnabled("authentication.providers.google_oauth") {
        providers = append(providers, "google")
    }

    if config.IsFeatureEnabled("authentication.providers.facebook_oauth") {
        providers = append(providers, "facebook")
    }

    if config.IsFeatureEnabled("authentication.providers.apple_oauth") {
        providers = append(providers, "apple")
    }

    return providers
}
```

### Feature Toggle in Middleware
```go
// Feature check middleware
func FeatureCheckMiddleware(featurePath string) gin.HandlerFunc {
    return func(c *gin.Context) {
        if !config.IsFeatureEnabled(featurePath) {
            c.JSON(403, gin.H{
                "error": config.GetMessage("info", "feature_disabled", nil),
            })
            c.Abort()
            return
        }
        c.Next()
    }
}

// Usage in routes
advancedRoutes := router.Group("/api/advanced")
advancedRoutes.Use(FeatureCheckMiddleware("experimental.advanced_search"))
{
    advancedRoutes.GET("/search", AdvancedSearchHandler)
}
```

### Beta Feature Testing
```go
// Check beta features
func GetBetaFeatures() []string {
    betas := []string{}

    if config.IsBetaFeatureEnabled("multi_language_support") {
        betas = append(betas, "multi_language")
    }

    if config.IsBetaFeatureEnabled("api_v2") {
        betas = append(betas, "api_v2")
    }

    return betas
}
```

## 🔧 Advanced Configuration Examples

### Dynamic Rate Limiting
```go
// Implement rate limiting with config
func RateLimitMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        path := c.Request.URL.Path

        // Get rate limits for this endpoint
        minuteLimit, hourLimit, exempt := config.GetEndpointRateLimit(path)

        if exempt {
            c.Next()
            return
        }

        // Apply rate limiting logic
        clientIP := c.ClientIP()
        if !checkRateLimit(clientIP, minuteLimit, hourLimit) {
            c.JSON(429, gin.H{
                "error": config.GetMessage("rate_limit", "rate_limit_minute", map[string]string{
                    "limit": fmt.Sprintf("%d", minuteLimit),
                }),
            })
            c.Abort()
            return
        }

        c.Next()
    }
}
```

### Configuration-Based Feature Routing
```go
// Dynamic route registration based on features
func RegisterFeatureRoutes(router *gin.Engine) {
    // Content management features
    if config.IsFeatureEnabled("content_management.portfolio") {
        portfolioRoutes := router.Group("/api/portfolio")
        portfolioRoutes.GET("", GetPortfolioItems)
        portfolioRoutes.POST("", CreatePortfolioItem)
    }

    if config.IsFeatureEnabled("content_management.events") {
        eventRoutes := router.Group("/api/events")
        eventRoutes.GET("", GetEvents)
        eventRoutes.POST("", CreateEvent)
    }

    // Admin features
    if config.IsFeatureEnabled("admin.dashboard.analytics_enabled") {
        router.GET("/api/admin/analytics", GetAnalytics)
    }
}
```

### Environment-Specific Configuration
```go
// Load different configs based on environment
func LoadEnvironmentConfig() string {
    env := os.Getenv("APP_ENV")
    if env == "" {
        env = "development"
    }

    switch env {
    case "production":
        // Use production configs
        config.SetEnvironment("production")
    case "staging":
        // Use staging configs
        config.SetEnvironment("staging")
    default:
        // Use development configs
        config.SetEnvironment("development")
    }

    return env
}
```

## 📊 Monitoring and Debugging

### Configuration Status Endpoint
```go
// Endpoint to check current configuration status
func ConfigStatusHandler(c *gin.Context) {
    status := gin.H{
        "cors_enabled": config.AppConfig.CORS != nil,
        "rate_limiting_enabled": config.AppConfig.RateLimiting != nil && config.AppConfig.RateLimiting.Enabled,
        "uploads_enabled": config.AppConfig.Uploads != nil && config.AppConfig.Uploads.Enabled,
        "features_version": config.AppConfig.Features.Version,
        "messages_language": config.AppConfig.Messages.Language,
    }

    c.JSON(200, status)
}
```

### Feature Status Check
```go
// Check all feature flags
func GetFeatureStatus() gin.H {
    features := gin.H{}

    // Authentication features
    features["authentication"] = gin.H{
        "google_oauth": config.IsFeatureEnabled("authentication.providers.google_oauth"),
        "facebook_oauth": config.IsFeatureEnabled("authentication.providers.facebook_oauth"),
        "apple_oauth": config.IsFeatureEnabled("authentication.providers.apple_oauth"),
    }

    // Booking features
    features["bookings"] = gin.H{
        "calendly": config.IsFeatureEnabled("bookings.calendly_integration"),
        "google_calendar": config.IsFeatureEnabled("bookings.google_calendar_integration"),
    }

    return features
}
```

## 🛡️ Security Examples

### Configuration-Based Security
```go
// Apply security settings from config
func ApplySecurityMiddleware(router *gin.Engine) {
    if config.AppConfig.RateLimiting != nil && config.AppConfig.RateLimiting.Enabled {
        router.Use(RateLimitMiddleware())
    }

    if config.AppConfig.Uploads != nil && config.AppConfig.Uploads.Security.CheckFileSignature {
        // Enable file signature checking
        enableFileSecurityChecks()
    }
}
```

---

**Tip:** Always test configuration changes in a development environment before deploying to production!