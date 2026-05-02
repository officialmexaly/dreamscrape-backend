package database

import (
	"context"
	"fmt"
	"log"

	"dreamscape-backend/backend/supabase"
)

var SupabaseClient *supabase.Client

// Initialize creates the shared Supabase REST client.
func Initialize() error {
	client, err := supabase.NewClient()
	if err != nil {
		return fmt.Errorf("failed to create Supabase REST client: %w", err)
	}

	SupabaseClient = client
	log.Println("Supabase REST API client initialized successfully")

	return nil
}

// Close resets the shared database client.
func Close() {
	SupabaseClient = nil
	log.Println("Database client closed")
}

// HealthCheck checks if the database connection is healthy
func HealthCheck(ctx context.Context) error {
	_ = ctx
	if SupabaseClient == nil {
		return fmt.Errorf("database client is not initialized")
	}
	return nil
}

// GetClient returns the Supabase REST client
func GetClient() *supabase.Client {
	return SupabaseClient
}
