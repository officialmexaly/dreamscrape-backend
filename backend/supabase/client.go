package supabase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

type Client struct {
	BaseURL    string
	Key        string
	HTTPClient *http.Client
}

type SupabaseResponse struct {
	Data []map[string]interface{} `json:"data"`
}

func NewClient() (*Client, error) {
	url := os.Getenv("SUPABASE_URL")
	key := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if url == "" {
		return nil, fmt.Errorf("SUPABASE_URL environment variable is not set")
	}
	if key == "" {
		return nil, fmt.Errorf("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")
	}

	return &Client{
		BaseURL:    url,
		Key:        key,
		HTTPClient: &http.Client{},
	}, nil
}

func (c *Client) Select(table string, filters map[string]string) ([]map[string]interface{}, error) {
	url := fmt.Sprintf("%s/rest/v1/%s", c.BaseURL, table)

	// Build query parameters
	if filters != nil {
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, err
		}

		q := req.URL.Query()
		for key, value := range filters {
			// If caller already provided an operator (e.g. "eq.<val>", "not.is.null"),
			// the value will contain a dot. Otherwise assume a raw value and prefix with "eq.".
			if strings.Contains(value, ".") {
				q.Add(key, value)
			} else {
				q.Add(key, fmt.Sprintf("eq.%s", value))
			}
		}
		req.URL.RawQuery = q.Encode()
		url = req.URL.String()
		log.Printf("Supabase Select URL: %s", url)
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", c.Key)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Key))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("supabase error: %s", string(body))
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	if len(result) == 0 {
		log.Printf("Supabase Select returned empty result for URL: %s; body: %s", url, string(body))
	}

	return result, nil
}

func (c *Client) Insert(table string, data interface{}) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/rest/v1/%s", c.BaseURL, table)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", c.Key)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Key))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("supabase error: %s", string(body))
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	if len(result) > 0 {
		return result[0], nil
	}

	return nil, fmt.Errorf("no data returned")
}

func (c *Client) Update(table string, id string, data interface{}) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/rest/v1/%s?id=eq.%s", c.BaseURL, table, id)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", c.Key)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Key))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("supabase error: %s", string(body))
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	if len(result) > 0 {
		return result[0], nil
	}

	return nil, fmt.Errorf("no data returned")
}

func (c *Client) Delete(table string, id string) error {
	url := fmt.Sprintf("%s/rest/v1/%s?id=eq.%s", c.BaseURL, table, id)

	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("apikey", c.Key)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Key))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("supabase error: status %d", resp.StatusCode)
	}

	return nil
}

// UpdateByID updates a record by ID (alias for Update)
func (c *Client) UpdateByID(table string, id string, data interface{}) (map[string]interface{}, error) {
	return c.Update(table, id, data)
}

// UpdateWhere updates records that match the given filters
func (c *Client) UpdateWhere(table string, filters map[string]string, data interface{}) ([]map[string]interface{}, error) {
	url := fmt.Sprintf("%s/rest/v1/%s", c.BaseURL, table)

	// Build query parameters for filters
	if filters != nil {
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, err
		}

		q := req.URL.Query()
		for key, value := range filters {
			if strings.Contains(value, ".") {
				q.Add(key, value)
			} else {
				q.Add(key, fmt.Sprintf("eq.%s", value))
			}
		}
		req.URL.RawQuery = q.Encode()
		url = req.URL.String()
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", c.Key)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Key))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("supabase error: %s", string(body))
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	return result, nil
}

// DeleteByID deletes a record by ID (alias for Delete)
func (c *Client) DeleteByID(table string, id string) error {
	return c.Delete(table, id)
}

// DeleteWhere deletes records that match the given filters
func (c *Client) DeleteWhere(table string, filters map[string]string) error {
	url := fmt.Sprintf("%s/rest/v1/%s", c.BaseURL, table)

	// Build query parameters for filters
	if filters != nil {
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return err
		}

		q := req.URL.Query()
		for key, value := range filters {
			if strings.Contains(value, ".") {
				q.Add(key, value)
			} else {
				q.Add(key, fmt.Sprintf("eq.%s", value))
			}
		}
		req.URL.RawQuery = q.Encode()
		url = req.URL.String()
	}

	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("apikey", c.Key)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Key))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("supabase error: status %d", resp.StatusCode)
	}

	return nil
}
