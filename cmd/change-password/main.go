package main

import (
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Get the password from command line
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run change_password.go <new_password>")
		os.Exit(1)
	}

	password := os.Args[1]

	// Generate bcrypt hash
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	fmt.Printf("Password: %s\n", password)
	fmt.Printf("BCrypt Hash: %s\n", string(hash))
	fmt.Printf("\nSQL Update:\n")
	fmt.Printf("UPDATE users SET password_hash = '%s', updated_at = NOW() WHERE email = 'user@example.com';\n", string(hash))
}