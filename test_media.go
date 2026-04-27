package main

import (
	"fmt"
	"log"
	"os"

	"dreamscape-backend/db"
	"dreamscape-backend/backend/database"
)

func main() {
	// Load config
	cfg := db.LoadConfig()
	client, err := db.NewClient(cfg)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	// Test media library query
	fmt.Println("Testing media library query...")
	params := map[string]string{
		"order": "created_at.desc",
	}

	mediaRows, err := client.Select("media_library", params)
	if err != nil {
		fmt.Printf("Error querying media_library: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Success! Found %d media items\n", len(mediaRows))
	for i, row := range mediaRows {
		if i < 3 { // Print first 3
			fmt.Printf("Item %d: %+v\n", i+1, row)
		}
	}

	// Test other tables
	fmt.Println("\nTesting portfolio_items query...")
	portfolioRows, err := client.Select("portfolio_items", map[string]string{"limit": "1"})
	if err != nil {
		fmt.Printf("Error querying portfolio_items: %v\n", err)
	} else {
		fmt.Printf("Success! Found %d portfolio items\n", len(portfolioRows))
	}

	// Test database connection using database package
	fmt.Println("\nTesting database connection...")
	database.Initialize()
	if database.SupabaseClient != nil {
		fmt.Println("Supabase client initialized successfully")
	}
}