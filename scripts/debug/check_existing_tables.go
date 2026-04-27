package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/supabase-community/supabase-go"
)

func main() {
	// Supabase credentials
	supabaseUrl := "https://aifqsjkgvejcqrzwgvqg.supabase.co"
	supabaseKey := "sb_publishable_LCmmz6P7mLZv5BaQsON9yA_L0Jr3Nrc"

	fmt.Println("🔗 Connecting to Supabase...")

	client, err := supabase.NewClient(supabaseUrl, supabaseKey, nil)
	if err != nil {
		log.Fatalf("❌ Cannot initialize client: %v", err)
	}

	fmt.Println("✅ Supabase client initialized successfully!")

	// Try to query portfolio_items (since this is a Dreamscape project)
	fmt.Println("\n📊 Checking for existing tables...")

	tables := []string{"portfolio_items", "blog_posts", "events", "services", "bookings", "users"}

	for _, table := range tables {
		fmt.Printf("🔍 Checking table '%s'...\n", table)

		data, _, err := client.From(table).Select("*", "1", false).Limit(1, "").Execute()
		if err != nil {
			fmt.Printf("   ❌ Table not found or no access\n")
		} else {
			var results []map[string]interface{}
			if err := json.Unmarshal(data, &results); err != nil {
				fmt.Printf("   ⚠️  Found but error parsing: %v\n", err)
			} else {
				fmt.Printf("   ✅ Found! Sample data keys: %v\n", getKeys(results))
			}
		}
	}

	fmt.Println("\n🎉 Supabase connection check completed!")
	fmt.Println("📝 Your Supabase connection is working and accessible via REST API.")
}

func getKeys(data []map[string]interface{}) []string {
	if len(data) == 0 {
		return []string{}
	}
	keys := make([]string, 0, len(data[0]))
	for k := range data[0] {
		keys = append(keys, k)
	}
	return keys
}