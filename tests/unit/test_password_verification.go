package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Test password verification
	password := "Dreamscape2025!"

	// The bcrypt hash we generated
	hash := "$2a$10$5T7q9K8wZCSEecn5Ida3ROEiw1GO1i2mPJ2xLWH9RI32J8cbPqUjq"

	// Test verification
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Printf("❌ Password verification failed: %v\n", err)
	} else {
		fmt.Printf("✅ Password verification successful!\n")
		fmt.Printf("Password: %s\n", password)
		fmt.Printf("Hash: %s\n", hash)
	}
}