package storage

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"
)

// SupabaseStorageClient handles Supabase Storage operations
type SupabaseStorageClient struct {
	BaseURL    string
	Key        string
	BucketName string
	HTTPClient *http.Client
}

// NewSupabaseStorageClient creates a new Supabase Storage client
func NewSupabaseStorageClient(baseURL, key, bucketName string) *SupabaseStorageClient {
	return &SupabaseStorageClient{
		BaseURL:    strings.TrimRight(baseURL, "/"),
		Key:        key,
		BucketName: bucketName,
		HTTPClient: &http.Client{Timeout: 30 * time.Second},
	}
}

// ListFiles lists all files in a folder or bucket
func (c *SupabaseStorageClient) ListFiles(folder string, limit int) ([]map[string]interface{}, error) {
	// Build the path for listing
	path := folder
	if path != "" && !strings.HasSuffix(path, "/") {
		path += "/"
	}

	// Use the correct Supabase Storage API endpoint
	// POST /storage/v1/object/list/{bucket_name}
	url := fmt.Sprintf("%s/storage/v1/object/list/%s", c.BaseURL, c.BucketName)

	// Create request body with listing parameters
	requestBody := map[string]interface{}{
		"prefix": path,
		"limit":  limit,
	}
	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.Key)
	req.Header.Set("apikey", c.Key)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to list files: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to list files (status %d): %s", resp.StatusCode, string(body))
	}

	var result []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Add public URLs to each file
	files := make([]map[string]interface{}, 0, len(result))
	for _, file := range result {
		if name, ok := file["name"].(string); ok {
			// Add public URL to each file
			publicPath := name
			file["public_url"] = fmt.Sprintf("%s/storage/v1/object/public/%s/%s", c.BaseURL, c.BucketName, publicPath)
			files = append(files, file)
		}
	}

	return files, nil
}

// UploadFile uploads a file to Supabase Storage
func (c *SupabaseStorageClient) UploadFile(fileHeader *multipart.FileHeader, folder string) (string, error) {
	// Open the uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Generate unique filename
	ext := filepath.Ext(fileHeader.Filename)
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), generateRandomString(8), ext)

	// Create storage path
	path := filename
	if folder != "" {
		path = fmt.Sprintf("%s/%s", folder, filename)
	}

	// Read file content
	fileContent, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file content: %w", err)
	}

	// Upload to Supabase Storage
	url := fmt.Sprintf("%s/storage/v1/object/%s/%s", c.BaseURL, c.BucketName, path)
	req, err := http.NewRequest("POST", url, bytes.NewReader(fileContent))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Authorization", "Bearer "+c.Key)
	req.Header.Set("apikey", c.Key)
	req.Header.Set("Content-Type", fileHeader.Header.Get("Content-Type"))
	req.Header.Set("x-upsert", "true")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to upload file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("upload failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Return public URL
	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", c.BaseURL, c.BucketName, path)
	return publicURL, nil
}

// DeleteFile deletes a file from Supabase Storage
func (c *SupabaseStorageClient) DeleteFile(fileURL string) error {
	// Extract path from URL
	path := extractPathFromURL(fileURL, c.BucketName)
	if path == "" {
		return fmt.Errorf("invalid file URL or URL not from this bucket")
	}

	url := fmt.Sprintf("%s/storage/v1/object/%s/%s", c.BaseURL, c.BucketName, path)
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.Key)
	req.Header.Set("apikey", c.Key)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("delete failed with status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

// GetFileInfo gets information about a file from storage
func (c *SupabaseStorageClient) GetFileInfo(fileURL string) (map[string]interface{}, error) {
	path := extractPathFromURL(fileURL, c.BucketName)
	if path == "" {
		return nil, fmt.Errorf("invalid file URL")
	}

	url := fmt.Sprintf("%s/storage/v1/object/%s/%s", c.BaseURL, c.BucketName, path)
	req, err := http.NewRequest("HEAD", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.Key)
	req.Header.Set("apikey", c.Key)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("file not found")
	}

	info := map[string]interface{}{
		"content_type": resp.Header.Get("Content-Type"),
		"size":         resp.ContentLength,
		"cache_control": resp.Header.Get("Cache-Control"),
	}

	return info, nil
}

// Helper functions
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}

func extractPathFromURL(fileURL, bucketName string) string {
	// Remove base URL and extract path
	if strings.Contains(fileURL, "/storage/v1/object/public/"+bucketName+"/") {
		parts := strings.Split(fileURL, "/storage/v1/object/public/"+bucketName+"/")
		if len(parts) > 1 {
			return parts[1]
		}
	} else if strings.Contains(fileURL, "/storage/v1/object/"+bucketName+"/") {
		parts := strings.Split(fileURL, "/storage/v1/object/"+bucketName+"/")
		if len(parts) > 1 {
			return parts[1]
		}
	}
	return ""
}