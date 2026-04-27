package main

import (
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"

	"dreamscape-backend/internal/supabase"
)

func main() {
	// Check if Supabase credentials are set
	url := os.Getenv("SUPABASE_URL")
	key := os.Getenv("SUPABASE_KEY")

	if url == "" || key == "" {
		log.Fatal("SUPABASE_URL and SUPABASE_KEY environment variables must be set")
	}

	// Create Supabase client
	client, err := supabase.NewClient()
	if err != nil {
		log.Fatalf("Failed to create Supabase client: %v", err)
	}

	// Generate password hash
	password := "Dreamscape2025!"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	fmt.Printf("🔐 Creating admin user...\n")
	fmt.Printf("Email: admin@dreamscape.com\n")
	fmt.Printf("Password: %s\n", password)
	fmt.Printf("Hash: %s\n\n", string(hash))

	// Create admin user
	newUser := map[string]interface{}{
		"email":          "admin@dreamscape.com",
		"password_hash":  string(hash),
		"role":           "admin",
		"status":         "active",
		"email_verified": true,
		"first_name":     "Admin",
		"last_name":      "User",
	}

	// Check if user exists
	filters := map[string]string{"email": "eq.admin@dreamscape.com"}
	existingUsers, err := client.Select("users", filters)
	if err != nil {
		log.Printf("Warning: Could not check existing users: %v", err)
	} else if len(existingUsers) > 0 {
		fmt.Printf("⚠️  User already exists. Deleting and recreating...\n")

		// Get user ID
		userID := existingUsers[0]["id"].(string)
		fmt.Printf("Found user ID: %s\n", userID)

		// We can't easily delete via the current client, so let's just display a message
		fmt.Printf("⚠️  Cannot delete user via REST API. Please manually delete the user or use a different email.\n")
		fmt.Printf("Alternatively, update the password directly in the Supabase dashboard.\n")
		fmt.Printf("Password hash to use: %s\n", string(hash))
		return
	}

	// Insert new user
	insertedUser, err := client.Insert("users", newUser)
	if err != nil {
		log.Fatalf("Failed to create user: %v", err)
	}

	fmt.Printf("✅ Admin user created successfully!\n")
	fmt.Printf("User data: %+v\n", insertedUser)
	fmt.Printf("\n🎉 You can now login with:\n")
	fmt.Printf("Email: admin@dreamscape.com\n")
	fmt.Printf("Password: %s\n", password)
}