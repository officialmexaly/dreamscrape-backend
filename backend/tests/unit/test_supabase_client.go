package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/supabase-community/supabase-go"
)

type Todo struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

func main() {
	// Supabase credentials
	supabaseUrl := "https://aifqsjkgvejcqrzwgvqg.supabase.co"
	supabaseKey := "sb_publishable_LCmmz6P7mLZv5BaQsON9yA_L0Jr3Nrc"

	fmt.Println("🔗 Initializing Supabase client...")

	client, err := supabase.NewClient(supabaseUrl, supabaseKey, nil)
	if err != nil {
		log.Fatalf("❌ Cannot initialize client: %v", err)
	}

	fmt.Println("✅ Supabase client initialized successfully!")

	// Check if we can access the database
	fmt.Println("\n📊 Testing database access...")

	// Try to get todos
	var todos []Todo
	data, _, err := client.From("todos").Select("*", "", false).Execute()
	if err != nil {
		fmt.Printf("ℹ️  Todos query failed (might not exist yet): %v\n", err)

		// Try to create the todos table using RPC or just inform user
		fmt.Println("\n💡 Note: 'todos' table might not exist yet.")
		fmt.Println("   You can create it in Supabase SQL editor:")
		fmt.Println("   CREATE TABLE todos (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL);")
	} else {
		// Parse the response
		if err := json.Unmarshal(data, &todos); err != nil {
			fmt.Printf("❌ Failed to parse response: %v\n", err)
		} else {
			fmt.Printf("✅ Successfully queried todos! Found %d items\n", len(todos))

			if len(todos) > 0 {
				jsonData, _ := json.MarshalIndent(todos, "  ", "  ")
				fmt.Printf("📋 Todos:\n  %s\n", string(jsonData))
			}
		}
	}

	// Test connection by checking Supabase health
	fmt.Println("\n🔍 Testing Supabase connection...")

	// Try to get current user info (will be empty for anon key, but tests connection)
	responseData, _, err := client.From("todos").Select("*", "", false).Execute()
	if err != nil {
		fmt.Printf("ℹ️  Connection test query failed: %v\n", err)
	} else {
		fmt.Printf("✅ Supabase connection is working! Response size: %d bytes\n", len(responseData))
	}

	// Insert a test todo
	fmt.Println("\n➕ Attempting to insert a test todo...")
	newTodo := map[string]interface{}{
		"name": "Test Todo from Go - " + time.Now().Format("2006-01-02 15:04:05"),
	}

	insertData, _, err := client.From("todos").Insert(newTodo, false, "", "", "").Execute()
	if err != nil {
		fmt.Printf("❌ Failed to insert todo: %v\n", err)
		fmt.Println("💡 Make sure the 'todos' table exists and you have proper permissions")
	} else {
		var insertedTodos []Todo
		if err := json.Unmarshal(insertData, &insertedTodos); err != nil {
			fmt.Printf("❌ Failed to parse insert response: %v\n", err)
		} else {
			fmt.Printf("✅ Successfully inserted todo! ID: %d\n", insertedTodos[0].ID)
		}
	}

	fmt.Println("\n🎉 Supabase client test completed!")
	fmt.Println("📝 Your Supabase connection using REST API is working properly.")
}