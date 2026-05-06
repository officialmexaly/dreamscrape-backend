package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/argon2"
)

// GenerateArgon2Hash creates an Argon2 hash (what your system uses)
func GenerateArgon2Hash(password string) string {
	// Generate random salt
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		log.Fatal(err)
	}

	// Argon2id parameters
	time := 1
	memory := 64 * 1024 // 64MB
	threads := 4
	keyLen := 32

	// Generate hash
	hash := argon2.IDKey([]byte(password), salt, uint32(time), uint32(memory), uint8(threads), uint32(keyLen))

	// Format: salt$hash$iterations (matching your format)
	saltB64 := base64.RawStdEncoding.EncodeToString(salt)
	hashB64 := base64.RawStdEncoding.EncodeToString(hash)

	return fmt.Sprintf("%s$%s$%d", saltB64, hashB64, 600000)
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run update_password_tool.go <new_password>")
		fmt.Println("Example: go run update_password_tool.go 'MySecurePassword123!'")
		os.Exit(1)
	}

	password := os.Args[1]

	// Generate the hash
	hash := GenerateArgon2Hash(password)

	fmt.Println("🔐 Password Hash Generated")
	fmt.Println("========================")
	fmt.Printf("Password: %s\n", password)
	fmt.Printf("Hash: %s\n", hash)
	fmt.Println()
	fmt.Println("📝 SQL Update Command:")
	fmt.Println("=====================")
	fmt.Printf("UPDATE users \n")
	fmt.Printf("SET \n")
	fmt.Printf("  password_hash = '%s',\n", hash)
	fmt.Printf("  updated_at = NOW() \n")
	fmt.Printf("WHERE email = 'admin@dreamscape.com';\n")
	fmt.Println()
	fmt.Println("🌐 Or use via Supabase REST API:")
	fmt.Println("==================================")
	fmt.Printf("curl -X PATCH 'https://aifqsjkgvejcqrzwgvqg.supabase.co/rest/v1/users?email=eq.admin@dreamscape.com' \\\n")
	fmt.Printf("  -H 'apikey: YOUR_SERVICE_ROLE_KEY' \\\n")
	fmt.Printf("  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \\\n")
	fmt.Printf("  -H 'Content-Type: application/json' \\\n")
	fmt.Printf("  -d '{\"password_hash\": \"%s\"}'\n", hash)
}