package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "dreamscape-backend/docs" // swagger docs
	"dreamscape-backend/internal/database"
	"dreamscape-backend/internal/handlers/auth"
	"dreamscape-backend/internal/handlers/public"
	"dreamscape-backend/internal/middleware"
	"dreamscape-backend/internal/services"
	"dreamscape-backend/pkg/config"
)

// @title           Dreamscape Events API
// @version         1.0
// @description     API for Dreamscape Events - Event Planning and Management System
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.dreamscape-events.com/support
// @contact.email  support@dreamscape-events.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load configuration
	if err := config.Load(); err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Set Gin mode
	gin.SetMode(config.AppConfig.GinMode)

	// Initialize structured logging
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	// Initialize database connection
	if err := database.Initialize(); err != nil {
		logger.Error("Failed to initialize database", "error", err)
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Create Gin router
	r := gin.New()

	// Apply middleware
	r.Use(middleware.Recovery(logger))
	r.Use(middleware.Logger(logger))
	r.Use(middleware.Security())
	r.Use(middleware.CORS())

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Test endpoint to verify database connection
	// @Summary      Test database connection
	// @Description  Test endpoint to verify database connection
	// @Tags         test
	// @Accept       json
	// @Produce      json
	// @Success      200  {object}  map[string]interface{} "message: string, database: string"
	// @Failure      500  {object}  map[string]interface{} "error: string"
	// @Router       /api/test [get]
	r.GET("/api/test", func(c *gin.Context) {
		// Test the database connection with a simple query
		if database.Pool != nil {
			var result string
			err := database.Pool.QueryRow(c.Request.Context(), "SELECT 'Database connection successful!'").Scan(&result)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, gin.H{"message": result, "database": "PostgreSQL connected"})
		} else if database.SupabaseClient != nil {
			c.JSON(200, gin.H{"message": "Supabase REST API connection successful!", "database": "Supabase REST API"})
		} else {
			c.JSON(500, gin.H{"error": "No database connection available"})
		}
	})

	// Initialize all handlers
	portfolioHandler := public.NewPortfolioHandler()
	utilsHandler := public.NewUtilitiesHandler(database.SupabaseClient)
	eventHandler := public.NewEventHandler()
	serviceHandler := public.NewServiceHandler()
	completeBookingHandler := public.NewCompleteBookingHandler()
	contentHandler := public.NewContentHandler(database.GetPool())
	settingsHandler := public.NewSettingsHandler(database.GetPool())
	mediaHandler := public.NewMediaStorageHandler()

	// Initialize auth handlers
	authService := services.NewAuthService()
	authHandler := auth.NewAuthHandler(authService)
	oauthHandler := auth.NewOAuthHandler(authService)

	// Authentication routes (no auth required) - Traditional & OAuth 2.0
	auth := r.Group("/api/auth")
	{
		// Traditional email/password authentication
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.RefreshToken)
		auth.POST("/logout", authHandler.Logout)
		auth.POST("/forgot-password", authHandler.ForgotPassword)
		auth.POST("/reset-password", authHandler.ResetPassword)

		// OAuth 2.0 social login (alternative authentication methods)
		auth.GET("/google/login", oauthHandler.GoogleLogin)
		auth.GET("/google/callback", oauthHandler.GoogleCallback)
		auth.GET("/facebook/login", oauthHandler.FacebookLogin)
		auth.GET("/facebook/callback", oauthHandler.FacebookCallback)
		auth.GET("/apple/login", oauthHandler.AppleLogin)
		auth.POST("/apple/callback", oauthHandler.AppleCallback)
	}

	// Authenticated user routes (require valid JWT token)
	userAuth := r.Group("/api/auth")
	userAuth.Use(middleware.RequireAuth())
	{
		userAuth.GET("/me", authHandler.GetMe)
		userAuth.POST("/change-password", authHandler.ChangePassword)
	}

	// Public API routes
	public := r.Group("/api")
	{
		// Portfolio items (public)
		public.GET("/portfolio-items", portfolioHandler.GetPortfolioItems)
		public.GET("/portfolio-items/:id", portfolioHandler.GetPortfolioItem)

		// Blog posts (alias for portfolio)
		public.GET("/blog-posts", portfolioHandler.GetPortfolioItems)
		public.GET("/blog-posts/:slug", portfolioHandler.GetPortfolioItem)

		// Events (public)
		public.GET("/events", eventHandler.GetEvents)
		public.GET("/events/:id", eventHandler.GetEventByID)
		public.GET("/events/slug/:slug", eventHandler.GetEventBySlug)

		// Services (public)
		public.GET("/services", serviceHandler.GetServices)
		public.GET("/services/:id", serviceHandler.GetServiceByID)
		public.GET("/services/slug/:slug", serviceHandler.GetServiceBySlug)

		// Utility routes
		public.GET("/health", utilsHandler.HealthCheck)
		public.GET("/db/tables", utilsHandler.GetDatabaseTables)
		public.GET("/db/stats", utilsHandler.GetDatabaseStats)

		// Content and Settings routes (public)
		public.GET("/content", contentHandler.GetSiteContent)
		public.GET("/content/key/:key", contentHandler.GetContentByKey)
		public.GET("/settings", settingsHandler.GetSiteSettings)

		// Temporary test endpoint for media storage (no auth required)
		public.GET("/media-test", mediaHandler.GetMediaLibrary)
	}

	// Admin API routes (authentication required)
	adminAPI := r.Group("/api/admin")
	adminAPI.Use(middleware.RequireAdmin())
	{
		// Portfolio items routes (admin)
		adminAPI.GET("/portfolio-items", portfolioHandler.GetPortfolioItems)
		adminAPI.POST("/portfolio-items", portfolioHandler.CreatePortfolioItem)
		adminAPI.GET("/portfolio-items/:id", portfolioHandler.GetPortfolioItem)
		adminAPI.PUT("/portfolio-items/:id", portfolioHandler.UpdatePortfolioItem)
		adminAPI.DELETE("/portfolio-items/:id", portfolioHandler.DeletePortfolioItem)

		// Blog posts routes (alias for portfolio items)
		adminAPI.GET("/blog-posts", portfolioHandler.GetPortfolioItems)
		adminAPI.POST("/blog-posts", portfolioHandler.CreatePortfolioItem)
		adminAPI.GET("/blog-posts/:id", portfolioHandler.GetPortfolioItem)
		adminAPI.PUT("/blog-posts/:id", portfolioHandler.UpdatePortfolioItem)
		adminAPI.DELETE("/blog-posts/:id", portfolioHandler.DeletePortfolioItem)

		// Events routes (admin)
		adminAPI.GET("/events", eventHandler.GetEvents)
		adminAPI.POST("/events", eventHandler.CreateEvent)
		adminAPI.GET("/events/:id", eventHandler.GetEventByID)
		adminAPI.PUT("/events/:id", eventHandler.UpdateEvent)
		adminAPI.DELETE("/events/:id", eventHandler.DeleteEvent)

		// Services routes (admin)
		adminAPI.GET("/services", serviceHandler.GetServices)
		adminAPI.POST("/services", serviceHandler.CreateService)
		adminAPI.GET("/services/:id", serviceHandler.GetServiceByID)
		adminAPI.PUT("/services/:id", serviceHandler.UpdateService)
		adminAPI.DELETE("/services/:id", serviceHandler.DeleteService)

		// Bookings routes (admin - complete CRUD)
		adminAPI.GET("/bookings", completeBookingHandler.GetBookings)
		adminAPI.GET("/bookings/:id", completeBookingHandler.GetBookingByID)
		adminAPI.PUT("/bookings/:id", completeBookingHandler.UpdateBooking)
		adminAPI.DELETE("/bookings/:id", completeBookingHandler.DeleteBooking)
		adminAPI.PUT("/bookings/:id/status", completeBookingHandler.UpdateBookingStatus)

		// Media library routes (admin)
		adminAPI.GET("/media-library", mediaHandler.GetMediaLibrary)
		adminAPI.POST("/media-library/upload", mediaHandler.UploadMedia)
		adminAPI.POST("/media-library", mediaHandler.CreateMedia)
		adminAPI.PUT("/media-library/:id", mediaHandler.UpdateMedia)
		adminAPI.DELETE("/media-library/:id", mediaHandler.DeleteMedia)

		// User management routes (admin - traditional auth)
		adminAPI.GET("/users", authHandler.GetUsers)
		adminAPI.GET("/users/:id", authHandler.GetUserByID)
		adminAPI.PUT("/users/:id", authHandler.UpdateUser)
		adminAPI.DELETE("/users/:id", authHandler.DeleteUser)
		adminAPI.PUT("/users/:id/status", authHandler.UpdateUserStatus)

		// Database utilities
		adminAPI.GET("/db/tables", utilsHandler.GetDatabaseTables)
		adminAPI.GET("/db/stats", utilsHandler.GetDatabaseStats)

		// System utilities
		adminAPI.GET("/health", utilsHandler.HealthCheck)
	}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		dbStatus := "healthy"
		if err := database.HealthCheck(c.Request.Context()); err != nil {
			dbStatus = "unhealthy"
			logger.Warn("Database health check failed", "error", err)
		}

		c.JSON(200, gin.H{
			"status":   "ok",
			"database": dbStatus,
		})
	})

	// Start server - Vercel requires PORT environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = config.AppConfig.ServerPort
	}
	if port == "" {
		port = "8080"
	}

	logger.Info("Starting server",
		"port", port,
		"frontend_url", config.AppConfig.FrontendURL,
		"gin_mode", config.AppConfig.GinMode,
	)

	// Vercel requires using 0.0.0.0 instead of localhost
	if err := r.Run("0.0.0.0:" + port); err != nil {
		logger.Error("Failed to start server", "error", err)
		log.Fatalf("Failed to start server: %v", err)
	}
}
