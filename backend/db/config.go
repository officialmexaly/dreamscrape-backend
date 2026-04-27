package db

import (
	"fmt"
	"os"
)

// Config holds the database connectivity settings used by the backend.
type Config struct {
	SupabaseURL             string
	SupabaseServiceRoleKey   string
	SupabaseStorageBucket    string
}

// LoadConfig reads database settings from the environment.
func LoadConfig() Config {
	return Config{
		SupabaseURL:            os.Getenv("SUPABASE_URL"),
		SupabaseServiceRoleKey: firstEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_KEY"),
		SupabaseStorageBucket:   getenv("SUPABASE_BUCKET", "media"),
	}
}

// Validate checks that the required database settings exist.
func (c Config) Validate() error {
	if c.SupabaseURL == "" {
		return fmt.Errorf("SUPABASE_URL environment variable is not set")
	}
	if c.SupabaseServiceRoleKey == "" {
		return fmt.Errorf("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")
	}
	return nil
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func firstEnv(keys ...string) string {
	for _, key := range keys {
		if value := os.Getenv(key); value != "" {
			return value
		}
	}
	return ""
}
