package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5"
)

func main() {
	// Local PostgreSQL connection
	connString := "postgresql://postgres:postgres@localhost:5432/dreamscape_db?sslmode=disable"

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	fmt.Println("🔗 Testing local PostgreSQL connection...")

	conn, err := pgx.Connect(ctx, connString)
	if err != nil {
		fmt.Printf("❌ Local connection failed: %v\n", err)
		fmt.Println("\n💡 To start local PostgreSQL:")
		fmt.Println("   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dreamscape_db postgres:16")
		return
	}
	defer conn.Close(ctx)

	fmt.Println("✅ Local PostgreSQL is running!")

	// Test query
	var result string
	err = conn.QueryRow(ctx, "SELECT version()").Scan(&result)
	if err != nil {
		log.Fatalf("❌ Query failed: %v", err)
	}
	fmt.Printf("📊 %s\n", result[:50]+"...")

	fmt.Println("\n🎉 Use local database for development while fixing Supabase!")
}