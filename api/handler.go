package handler

import (
	"net/http"
	"dreamscape-backend/internal/database"
	"dreamscape-backend/internal/handlers/auth"
	"dreamscape-backend/internal/handlers/public"
	"dreamscape-backend/internal/middleware"
	"dreamscape-backend/internal/services"
	"dreamscape-backend/pkg/config"
	"log/slog"
	"os"
	"log"

	"github.com/gin-gonic/gin"
)

var (
	router *gin.Engine
	logger *slog.Logger
)

func init() {
	// Load configuration
	if err := config.Load(); err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	gin.SetMode(config.AppConfig.GinMode)

	logger = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	if err := database.Initialize(); err != nil {
		logger.Error("Failed to initialize database", "error", err)
		log.Fatalf("Failed to initialize database: %v", err)
	}

	router = gin.New()
	router.Use(middleware.Recovery(logger))
	router.Use(middleware.Logger(logger))
	router.Use(middleware.Security())
	router.Use(middleware.CORS())

	// Initialize all handlers
	portfolioHandler := public.NewPortfolioHandler()
	utilsHandler := public.NewUtilitiesHandler(database.SupabaseClient)
	eventHandler := public.NewEventHandler()
	serviceHandler := public.NewServiceHandler()
	completeBookingHandler := public.NewCompleteBookingHandler()
	contentHandler := public.NewContentHandler(database.GetPool())
	settingsHandler := public.NewSettingsHandler(database.GetPool())
	mediaHandler := public.NewMediaStorageHandler()

	authService := services.NewAuthService()
	authHandler := auth.NewAuthHandler(authService)
	oauthHandler := auth.NewOAuthHandler(authService)

	auth := router.Group("/api/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.RefreshToken)
		auth.POST("/logout", authHandler.Logout)
		auth.POST("/forgot-password", authHandler.ForgotPassword)
		auth.POST("/reset-password", authHandler.ResetPassword)
		auth.GET("/google/login", oauthHandler.GoogleLogin)
		auth.GET("/google/callback", oauthHandler.GoogleCallback)
		auth.GET("/facebook/login", oauthHandler.FacebookLogin)
		auth.GET("/facebook/callback", oauthHandler.FacebookCallback)
		auth.GET("/apple/login", oauthHandler.AppleLogin)
		auth.POST("/apple/callback", oauthHandler.AppleCallback)
	}

	userAuth := router.Group("/api/auth")
	userAuth.Use(middleware.RequireAuth())
	{
		userAuth.GET("/me", authHandler.GetMe)
		userAuth.POST("/change-password", authHandler.ChangePassword)
	}

	public := router.Group("/api")
	{
		public.GET("/portfolio-items", portfolioHandler.GetPortfolioItems)
		public.GET("/portfolio-items/:id", portfolioHandler.GetPortfolioItem)
		public.GET("/blog-posts", portfolioHandler.GetPortfolioItems)
		public.GET("/blog-posts/:slug", portfolioHandler.GetPortfolioItem)
		public.GET("/events", eventHandler.GetEvents)
		public.GET("/events/:id", eventHandler.GetEventByID)
		public.GET("/events/slug/:slug", eventHandler.GetEventBySlug)
		public.GET("/services", serviceHandler.GetServices)
		public.GET("/services/:id", serviceHandler.GetServiceByID)
		public.GET("/services/slug/:slug", serviceHandler.GetServiceBySlug)
		public.GET("/health", utilsHandler.HealthCheck)
		public.GET("/db/tables", utilsHandler.GetDatabaseTables)
		public.GET("/db/stats", utilsHandler.GetDatabaseStats)
		public.GET("/content", contentHandler.GetSiteContent)
		public.GET("/content/key/:key", contentHandler.GetContentByKey)
		public.GET("/settings", settingsHandler.GetSiteSettings)
		public.GET("/media-test", mediaHandler.GetMediaLibrary)
	}

	adminAPI := router.Group("/api/admin")
	adminAPI.Use(middleware.RequireAdmin())
	{
		adminAPI.GET("/portfolio-items", portfolioHandler.GetPortfolioItems)
		adminAPI.POST("/portfolio-items", portfolioHandler.CreatePortfolioItem)
		adminAPI.GET("/portfolio-items/:id", portfolioHandler.GetPortfolioItem)
		adminAPI.PUT("/portfolio-items/:id", portfolioHandler.UpdatePortfolioItem)
		adminAPI.DELETE("/portfolio-items/:id", portfolioHandler.DeletePortfolioItem)
		adminAPI.GET("/blog-posts", portfolioHandler.GetPortfolioItems)
		adminAPI.POST("/blog-posts", portfolioHandler.CreatePortfolioItem)
		adminAPI.GET("/blog-posts/:id", portfolioHandler.GetPortfolioItem)
		adminAPI.PUT("/blog-posts/:id", portfolioHandler.UpdatePortfolioItem)
		adminAPI.DELETE("/blog-posts/:id", portfolioHandler.DeletePortfolioItem)
		adminAPI.GET("/events", eventHandler.GetEvents)
		adminAPI.POST("/events", eventHandler.CreateEvent)
		adminAPI.GET("/events/:id", eventHandler.GetEventByID)
		adminAPI.PUT("/events/:id", eventHandler.UpdateEvent)
		adminAPI.DELETE("/events/:id", eventHandler.DeleteEvent)
		adminAPI.GET("/services", serviceHandler.GetServices)
		adminAPI.POST("/services", serviceHandler.CreateService)
		adminAPI.GET("/services/:id", serviceHandler.GetServiceByID)
		adminAPI.PUT("/services/:id", serviceHandler.UpdateService)
		adminAPI.DELETE("/services/:id", serviceHandler.DeleteService)
		adminAPI.GET("/bookings", completeBookingHandler.GetBookings)
		adminAPI.GET("/bookings/:id", completeBookingHandler.GetBookingByID)
		adminAPI.PUT("/bookings/:id", completeBookingHandler.UpdateBooking)
		adminAPI.DELETE("/bookings/:id", completeBookingHandler.DeleteBooking)
		adminAPI.PUT("/bookings/:id/status", completeBookingHandler.UpdateBookingStatus)
		adminAPI.GET("/media-library", mediaHandler.GetMediaLibrary)
		adminAPI.POST("/media-library/upload", mediaHandler.UploadMedia)
		adminAPI.POST("/media-library", mediaHandler.CreateMedia)
		adminAPI.PUT("/media-library/:id", mediaHandler.UpdateMedia)
		adminAPI.DELETE("/media-library/:id", mediaHandler.DeleteMedia)
		adminAPI.GET("/users", authHandler.GetUsers)
		adminAPI.GET("/users/:id", authHandler.GetUserByID)
		adminAPI.PUT("/users/:id", authHandler.UpdateUser)
		adminAPI.DELETE("/users/:id", authHandler.DeleteUser)
		adminAPI.PUT("/users/:id/status", authHandler.UpdateUserStatus)
		adminAPI.GET("/db/tables", utilsHandler.GetDatabaseTables)
		adminAPI.GET("/db/stats", utilsHandler.GetDatabaseStats)
		adminAPI.GET("/health", utilsHandler.HealthCheck)
	}

	router.GET("/health", func(c *gin.Context) {
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
}

func Handler(w http.ResponseWriter, r *http.Request) {
	router.ServeHTTP(w, r)
}
