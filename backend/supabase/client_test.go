package supabase

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/supabase-community/supabase-go"
)

var Client *supabase.Client

// NewClient creates a new Supabase client using REST API
func NewClient() (*supabase.Client, error) {
	url := os.Getenv("SUPABASE_URL")
	if url == "" {
		return nil, fmt.Errorf("SUPABASE_URL environment variable is not set")
	}

	key := os.Getenv("SUPABASE_KEY")
	if key == "" {
		return nil, fmt.Errorf("SUPABASE_KEY environment variable is not set")
	}

	client, err := supabase.NewClient(url, key, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create Supabase client: %w", err)
	}

	log.Println("✅ Supabase REST API client initialized")
	return client, nil
}

// InitializeClient initializes the global Supabase client
func InitializeClient() error {
	client, err := NewClient()
	if err != nil {
		return err
	}
	Client = client
	return nil
}

// TestConnection tests if the Supabase connection is working
func TestConnection() error {
	if Client == nil {
		return fmt.Errorf("Supabase client is not initialized")
	}

	// Try to query a simple table to test connection
	data, _, err := Client.From("portfolio_items").Select("id", "1", false).Limit(1, "").Execute()
	if err != nil {
		return fmt.Errorf("failed to test connection: %w", err)
	}

	var results []map[string]interface{}
	if err := json.Unmarshal(data, &results); err != nil {
		return fmt.Errorf("failed to parse test response: %w", err)
	}

	log.Printf("✅ Supabase connection test successful! Found %d portfolio items", len(results))
	return nil
}

// GetClient returns the initialized Supabase client
func GetClient() *supabase.Client {
	return Client
}