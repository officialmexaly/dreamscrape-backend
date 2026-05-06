package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5"
)

type Todo struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func main() {
	// Use the direct database host parameters you specified
	connectionFormats := []string{
		// Direct database host (your specified format)
		"postgresql://postgres:NJyS7jwwp%2FEC7-y@db.aifqsjkgvejcqrzwgvqg.supabase.co:5432/postgres?sslmode=require",
		// Try with IPv4 if available
		"postgresql://postgres:NJyS7jwwp%2FEC7-y@db.aifqsjkgvejcqrzwgvqg.supabase.co:5432/postgres?sslmode=require&connect_timeout=10",
		// Pooler alternatives
		"postgresql://postgres:NJyS7jwwp%2FEC7-y@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
		"postgresql://postgres:NJyS7jwwp%2FEC7-y@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require",
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var conn *pgx.Conn
	var err error

	for i, testConnString := range connectionFormats {
		fmt.Printf("🔄 Attempting connection format %d...\n", i+1)
		conn, err = pgx.Connect(ctx, testConnString)
		if err == nil {
			fmt.Printf("✅ Connected using format %d!\n", i+1)
			break
		}
		fmt.Printf("❌ Format %d failed: %v\n", i+1, err)
	}

	if conn == nil {
		log.Fatal("❌ All connection formats failed. Please check your Supabase credentials and project status.")
	}
	defer conn.Close(ctx)

	fmt.Println("✅ Connected to Supabase successfully!")

	// Test connection with a simple query
	fmt.Println("\n📊 Testing database query...")
	var result string
	err = conn.QueryRow(ctx, "SELECT 'Connection successful!' as message").Scan(&result)
	if err != nil {
		log.Fatalf("❌ Query failed: %v", err)
	}
	fmt.Printf("✅ Database response: %s\n", result)

	// Check if todos table exists
	fmt.Println("\n🔍 Checking for 'todos' table...")
	var tableName string
	err = conn.QueryRow(ctx,
		"SELECT table_name FROM information_schema.tables WHERE table_name = 'todos' LIMIT 1").
		Scan(&tableName)

	if err == pgx.ErrNoRows {
		fmt.Println("ℹ️  'todos' table doesn't exist. Let's create it...")

		// Create todos table
		_, err = conn.Exec(ctx, `
			CREATE TABLE IF NOT EXISTS todos (
				id BIGSERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				created_at TIMESTAMPTZ DEFAULT NOW(),
				updated_at TIMESTAMPTZ DEFAULT NOW()
			)
		`)
		if err != nil {
			log.Fatalf("❌ Failed to create todos table: %v", err)
		}
		fmt.Println("✅ Created 'todos' table")
	} else if err != nil {
		log.Fatalf("❌ Error checking table: %v", err)
	} else {
		fmt.Printf("✅ Found '%s' table\n", tableName)
	}

	// Insert a test todo
	fmt.Println("\n➕ Inserting test data...")
	var newID int
	err = conn.QueryRow(ctx,
		"INSERT INTO todos (name) VALUES ($1) RETURNING id",
		"Test Todo from Go - "+time.Now().Format("2006-01-02 15:04:05")).
		Scan(&newID)
	if err != nil {
		log.Fatalf("❌ Failed to insert: %v", err)
	}
	fmt.Printf("✅ Inserted todo with ID: %d\n", newID)

	// Query all todos
	fmt.Println("\n📋 Fetching all todos...")
	rows, err := conn.Query(ctx, "SELECT id, name FROM todos ORDER BY id DESC LIMIT 10")
	if err != nil {
		log.Fatalf("❌ Failed to query todos: %v", err)
	}
	defer rows.Close()

	var todos []Todo
	for rows.Next() {
		var todo Todo
		if err := rows.Scan(&todo.ID, &todo.Name); err != nil {
			log.Fatalf("❌ Error scanning row: %v", err)
		}
		todos = append(todos, todo)
	}

	if len(todos) == 0 {
		fmt.Println("ℹ️  No todos found")
	} else {
		fmt.Printf("✅ Found %d todo(s):\n", len(todos))
		jsonData, _ := json.MarshalIndent(todos, "  ", "  ")
		fmt.Printf("  %s\n", string(jsonData))
	}

	// Get database info
	fmt.Println("\n🔢 Database statistics...")
	var tableCount int
	err = conn.QueryRow(ctx,
		"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'").
		Scan(&tableCount)
	if err != nil {
		log.Printf("⚠️  Could not get table count: %v", err)
	} else {
		fmt.Printf("✅ Public tables count: %d\n", tableCount)
	}

	fmt.Println("\n🎉 All tests completed successfully!")
	fmt.Println("📝 Your Supabase connection is working properly.")
}