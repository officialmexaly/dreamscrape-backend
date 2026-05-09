# Dreamscape Backend Configuration

This directory contains JSON configuration files for the Dreamscape backend system. These configurations allow you to manage application behavior without modifying code.

## 📁 Configuration Files

### 1. **CORS Configuration** (`cors.json`)
Controls Cross-Origin Resource Sharing settings for API access.

**Key Settings:**
- `allowed_origins`: Whitelist of domains that can access your API
- `allowed_methods`: HTTP methods permitted for cross-origin requests
- `allowed_headers`: Headers allowed in requests
- `max_age_seconds`: How long browsers cache CORS preflight responses

**Usage:** Update when adding new frontend domains or changing security policies.

### 2. **Rate Limiting** (`rate-limiting.json`)
Manages API rate limiting to prevent abuse and ensure fair usage.

**Key Settings:**
- `default_limits`: Standard rate limits for all endpoints
- `endpoint_specific_limits`: Custom limits for sensitive endpoints (login, register)
- `exempted_paths`: Paths excluded from rate limiting (health checks, swagger)
- `bypass_keys`: API keys that bypass rate limiting

**Example:**
```json
{
  "endpoint_specific_limits": {
    "/api/auth/login": {
      "requests_per_minute": 5,
      "requests_per_hour": 20
    }
  }
}
```

### 3. **File Uploads** (`uploads.json`)
Controls file upload behavior and security.

**Key Settings:**
- `max_file_size_mb`: Maximum file size for uploads
- `allowed_file_types`: MIME types permitted for upload
- `file_type_restrictions`: Different rules for images, videos, documents
- `security`: Malware scanning, file signature validation

**Usage:** Tighten security settings or increase limits for specific file types.

### 4. **API Messages** (`messages.json`)
Centralized error and success messages for API responses.

**Structure:**
- `errors`: Categorized error messages (authentication, validation, database)
- `success`: Success messages for operations
- `info`: Informational messages

**Example:**
```json
{
  "errors": {
    "authentication": {
      "invalid_credentials": "Invalid email or password"
    }
  }
}
```

**Benefits:**
- Multi-language support (create `messages.fr.json`, `messages.es.json`)
- Consistent messaging across endpoints
- Easy updates without code changes

### 5. **Feature Flags** (`features.json`)
Controls feature availability without deployment.

**Key Features:**
- `authentication`: Enable/disable OAuth providers
- `bookings`: Control booking system integrations
- `content_management`: Enable/disable content types
- `experimental`: Test new features safely

**Example:**
```json
{
  "features": {
    "authentication": {
      "providers": {
        "google_oauth": {
          "enabled": true
        },
        "apple_oauth": {
          "enabled": false
        }
      }
    }
  }
}
```

**Usage Scenarios:**
- A/B testing new features
- Gradual feature rollouts
- Emergency feature disabling
- Environment-specific functionality

## 🚀 Usage in Code

### Rate Limiting
```go
// Get endpoint-specific rate limits
minuteLimit, hourLimit, exempt := config.GetEndpointRateLimit("/api/auth/login")

// Check if feature is enabled
if config.IsFeatureEnabled("authentication.providers.google_oauth") {
    // Google OAuth is enabled
}
```

### File Uploads
```go
// Get max upload size
maxSize := config.GetUploadMaxSize()

// Check if file type is allowed
if config.IsFileTypeAllowed("image/jpeg") {
    // Process JPEG upload
}
```

### Messages
```go
// Get error message with parameters
message := config.GetMessage("validation", "password_too_short", map[string]string{
    "min_length": "8",
})

// Get success message
successMsg := config.GetSuccessMessage("created", map[string]string{
    "resource": "user",
})
```

### Feature Flags
```go
// Check if feature is enabled
if config.IsFeatureEnabled("bookings.google_calendar_integration") {
    // Enable Google Calendar integration
}

// Check beta features
if config.IsBetaFeatureEnabled("multi_language_support") {
    // Enable multi-language support
}
```

## 🔧 Configuration Management

### Adding New Environments
Create environment-specific config files:
```bash
config/
├── cors.json
├── cors.staging.json
├── cors.production.json
```

### Loading Different Configs
Set environment variable to specify config file:
```bash
export CONFIG_ENV=production
# Loads cors.production.json
```

### Validation
All config files are validated on startup. Invalid JSON prevents server startup.

## 📋 Best Practices

1. **Version Control**: Always commit config changes with descriptive messages
2. **Documentation**: Update README when adding new config options
3. **Testing**: Test config changes in staging before production
4. **Backups**: Keep backups of working configurations
5. **Security**: Never commit sensitive data (API keys, secrets) to config files
6. **Validation**: Use JSON validators to ensure syntax correctness

## 🚨 Troubleshooting

### Config Not Loading
```bash
# Check file permissions
ls -la config/*.json

# Validate JSON syntax
python -m json.tool config/rate-limiting.json

# Check server logs for config loading errors
tail -f logs/app.log | grep -i config
```

### Rate Limiting Too Strict
```json
{
  "default_limits": {
    "requests_per_minute": 120,  // Increase from 60
    "requests_per_hour": 2000    // Increase from 1000
  }
}
```

### File Uploads Failing
```json
{
  "max_file_size_mb": 20,  // Increase from 10
  "allowed_file_types": [
    "image/jpeg",
    "image/png",
    "application/pdf"  // Add missing types
  ]
}
```

### Feature Not Working
```json
{
  "features": {
    "your_feature": {
      "enabled": true  // Ensure enabled: true
    }
  }
}
```

## 📊 Configuration Priority

1. **Environment Variables** (highest priority)
2. **JSON Config Files**
3. **Default Values** (lowest priority)

This allows local overrides for testing without changing committed configs.

## 🔐 Security Notes

- **Never commit** sensitive data to JSON files
- **Use environment variables** for API keys, secrets
- **Set file permissions** to prevent unauthorized access
- **Audit regularly** for unintended configuration changes
- **Test thoroughly** before deploying config changes

## 📝 Configuration Templates

### Development Environment
```json
{
  "allowed_origins": ["http://localhost:3000"],
  "requests_per_minute": 1000,
  "max_file_size_mb": 50
}
```

### Production Environment
```json
{
  "allowed_origins": ["https://yourdomain.com"],
  "requests_per_minute": 60,
  "max_file_size_mb": 10
}
```

---

**Last Updated:** 2026-05-09
**Maintainer:** Dreamscape Development Team