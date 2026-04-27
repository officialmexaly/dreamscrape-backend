package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Get database connection URL
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	// Connect to database
	conn, err := pgxpool.Connect(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer conn.Close()

	// Check if admin user exists
	var email, passwordHash, role, status string
	var id string

	err = conn.QueryRow(context.Background(),
		"SELECT id, email, password_hash, role, status FROM users WHERE email = $1",
		"admin@dreamscape.com").Scan(&id, &email, &passwordHash, &role, &status)

	if err != nil {
		log.Fatalf("User not found: %v", err)
	}

	fmt.Printf("✅ Found user:\n")
	fmt.Printf("ID: %s\n", id)
	fmt.Printf("Email: %s\n", email)
	fmt.Printf("Role: %s\n", role)
	fmt.Printf("Status: %s\n", status)
	fmt.Printf("Password Hash: %s\n", passwordHash)

	// Test password verification
	password := "Dreamscape2025!"
	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password))
	if err != nil {
		fmt.Printf("❌ Password verification failed: %v\n", err)
	} else {
		fmt.Printf("✅ Password verification successful!\n")
	}
}