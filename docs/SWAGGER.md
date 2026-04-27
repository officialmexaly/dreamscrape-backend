# Swagger Documentation Setup

## Overview
The Dreamscape Events API now includes interactive Swagger documentation powered by swaggo/swag.

## Access Documentation
- **Swagger UI**: http://localhost:8080/swagger/index.html
- **JSON Spec**: http://localhost:8080/swagger/doc.json
- **YAML Spec**: http://localhost:8080/swagger/doc.yaml

## Usage

### 1. Adding Documentation to New Endpoints

Add Swagger annotations before your handler functions:

```go
// @Summary      Brief description
// @Description  Detailed description of what the endpoint does
// @Tags         category
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Parameter description"
// @Success      200  {object}  models.ResponseType
// @Failure      400  {object}  models.ErrorResponse
// @Router       /api/endpoint [get]
func (h *Handler) MethodName(c *gin.Context) {
    // handler implementation
}
```

### 2. Common Annotation Tags

- `@Summary` - Short description (shown in the UI)
- `@Description` - Detailed explanation (Markdown supported)
- `@Tags` - Category grouping for endpoints
- `@Accept` - Request content type
- `@Produce` - Response content type
- `@Param` - Parameter description
- `@Success` - Success response
- `@Failure` - Error response
- `@Router` - HTTP method and path

### 3. Regenerating Documentation

After adding or modifying annotations:

```bash
# Set up PATH if needed
export PATH=$PATH:$(go env GOPATH)/bin

# Regenerate Swagger docs
swag init -g main.go -o docs --parseInternal
```

### 4. Custom Types for Swagger

When using custom types (like our StringArray), add them to the models package with proper JSON tags:

```go
type StringArray []string

// Add swagger example tags
type PortfolioItem struct {
    Categories StringArray `json:"categories,omitempty" db:"categories" example:"["weddings","corporate"]"`
}
```

## Current Documentation

### Documented Endpoints:
- **Portfolio API**: Full CRUD operations
- **Health Check**: System health status
- **Database Utils**: Table info and statistics
- **Test Endpoint**: Supabase connection test

### To Be Documented:
- Authentication endpoints
- Events management
- Services management
- Bookings management
- Media management
- Content management

## Configuration

API configuration is in `main.go`:
- **Host**: localhost:8080
- **Base Path**: /
- **Version**: 1.0
- **Security**: Bearer token authentication configured

## Development Tips

1. **Keep docs updated**: Regenerate docs after adding/changing annotations
2. **Use descriptive summaries**: These appear first in the UI
3. **Group related endpoints**: Use the same `@Tags` value
4. **Document all parameters**: Path, query, and body parameters
5. **Include response examples**: Add example tags to model structs
6. **Test in UI**: Use the "Try it out" button in Swagger UI

## Troubleshooting

**Swagger UI not loading:**
- Check if docs are generated: `ls docs/`
- Regenerate docs: `swag init -g main.go -o docs --parseInternal`

**Missing types in Swagger:**
- Add custom types to models package
- Use JSON tags with examples
- Run `swag init` with `--parseInternal` flag

**Compilation errors:**
- Run `go mod tidy` to update dependencies
- Check that docs are imported: `_ "your-project/docs"`
