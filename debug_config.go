package main

import (
	"fmt"
	"log"

	"dreamscape-backend/pkg/config"
)

func main() {
	if err := config.Load(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	fmt.Printf("Supabase URL: %s\n", config.AppConfig.SupabaseURL)
	fmt.Printf("Supabase Key (first 20 chars): %s\n", config.AppConfig.SupabaseKey[:20])
	fmt.Printf("Supabase Service Role Key (first 20 chars): %s\n", config.AppConfig.SupabaseServiceRoleKey[:20])
	fmt.Printf("Supabase Bucket: %s\n", config.AppConfig.SupabaseBucket)
	fmt.Printf("Service Role Key length: %d\n", len(config.AppConfig.SupabaseServiceRoleKey))
}