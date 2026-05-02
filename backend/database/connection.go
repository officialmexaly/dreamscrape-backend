package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"dreamscape-backend/backend/supabase"
)

// Pool is retained for compatibility with older code paths.
var Pool *pgxpool.Pool
var SupabaseClient *supabase.Client

// Initialize creates the shared Supabase REST client and PostgreSQL pool.
func Initialize() error {
	client, err := supabase.NewClient()
	if err != nil {
		return fmt.Errorf("failed to create Supabase REST client: %w", err)
	}

	SupabaseClient = client
	log.Println("Supabase REST API client initialized successfully")

	// Initialize PostgreSQL connection pool for write operations
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Println("DATABASE_URL environment variable not set, write operations will be disabled")
		return nil
	}

	// Add connection timeout and retry parameters
	connString := databaseURL
	if len(databaseURL) > 0 {
		if databaseURL[len(databaseURL)-1] != '?' {
			connString += "&connect_timeout=10&pool_max_conns=10"
		}
	}

	pool, err := pgxpool.New(context.Background(), connString)
	if err != nil {
		log.Printf("Failed to create PostgreSQL connection pool: %v (write operations will be disabled)", err)
		log.Println("Continuing with Supabase REST API only - read operations will work")
		return nil
	}

	// Test the pool connection with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		log.Printf("Failed to ping PostgreSQL database: %v (write operations will be disabled)", err)
		log.Println("Continuing with Supabase REST API only - read operations will work")
		return nil
	}

	Pool = pool
	log.Println("PostgreSQL connection pool initialized successfully")

	return nil
}

// Close resets the shared database client.
func Close() {
	if Pool != nil {
		Pool.Close()
		log.Println("🔌 PostgreSQL connection pool closed")
	}
	Pool = nil
	SupabaseClient = nil
	log.Println("🔌 Database client closed")
}

// HealthCheck checks if the database connection is healthy
func HealthCheck(ctx context.Context) error {
	_ = ctx
	if SupabaseClient == nil {
		return fmt.Errorf("database client is not initialized")
	}
	return nil // Supabase REST API doesn't have a health check method
}

// GetPool returns the database connection pool
func GetPool() *pgxpool.Pool {
	return Pool
}

// GetClient returns the Supabase client (for storage operations)
func GetClient() *supabase.Client {
	return SupabaseClient
}
