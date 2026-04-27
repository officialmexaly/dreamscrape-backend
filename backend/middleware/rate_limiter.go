package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"dreamscape-backend/pkg/config"
)

// RateLimiterConfig holds rate limiter configuration
type RateLimiterConfig struct {
	RequestsPerMinute int
	RequestsPerHour   int
	Enabled           bool
}

// RateLimiter tracks request counts per IP address
type RateLimiter struct {
	mu      sync.RWMutex
	clients map[string]*ClientInfo
	config  RateLimiterConfig
}

// ClientInfo tracks request information for a client
type ClientInfo struct {
	MinuteCounter int
	HourCounter   int
	MinuteReset   time.Time
	HourReset     time.Time
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(config RateLimiterConfig) *RateLimiter {
	return &RateLimiter{
		clients: make(map[string]*ClientInfo),
		config:  config,
	}
}

// DefaultRateLimiter creates a rate limiter with default configuration
func DefaultRateLimiter() *RateLimiter {
	return NewRateLimiter(RateLimiterConfig{
		RequestsPerMinute: config.AppConfig.RateLimitPerMinute,
		RequestsPerHour:   config.AppConfig.RateLimitPerHour,
		Enabled:           true,
	})
}

// Middleware returns the Gin middleware for rate limiting
func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	if !rl.config.Enabled {
		return func(c *gin.Context) {
			c.Next()
		}
	}

	// Clean up old clients periodically
	go rl.cleanup()

	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		now := time.Now()

		rl.mu.Lock()
		client, exists := rl.clients[clientIP]
		if !exists {
			client = &ClientInfo{
				MinuteReset: now.Add(time.Minute),
				HourReset:   now.Add(time.Hour),
			}
			rl.clients[clientIP] = client
		}

		// Reset counters if time period has passed
		if now.After(client.MinuteReset) {
			client.MinuteCounter = 0
			client.MinuteReset = now.Add(time.Minute)
		}
		if now.After(client.HourReset) {
			client.HourCounter = 0
			client.HourReset = now.Add(time.Hour)
		}

		// Check minute limit
		if client.MinuteCounter >= rl.config.RequestsPerMinute {
			rl.mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": fmt.Sprintf("Rate limit exceeded: max %d requests per minute", rl.config.RequestsPerMinute),
			})
			c.Abort()
			return
		}

		// Check hour limit
		if client.HourCounter >= rl.config.RequestsPerHour {
			rl.mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": fmt.Sprintf("Rate limit exceeded: max %d requests per hour", rl.config.RequestsPerHour),
			})
			c.Abort()
			return
		}

		// Increment counters
		client.MinuteCounter++
		client.HourCounter++
		rl.mu.Unlock()

		// Add rate limit headers
		c.Header("X-RateLimit-Limit-Minute", fmt.Sprintf("%d", rl.config.RequestsPerMinute))
		c.Header("X-RateLimit-Remaining-Minute", fmt.Sprintf("%d", rl.config.RequestsPerMinute-client.MinuteCounter))
		c.Header("X-RateLimit-Limit-Hour", fmt.Sprintf("%d", rl.config.RequestsPerHour))
		c.Header("X-RateLimit-Remaining-Hour", fmt.Sprintf("%d", rl.config.RequestsPerHour-client.HourCounter))

		c.Next()
	}
}

// cleanup removes stale client entries
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, client := range rl.clients {
			if now.After(client.HourReset.Add(time.Hour)) {
				delete(rl.clients, ip)
			}
		}
		rl.mu.Unlock()
	}
}