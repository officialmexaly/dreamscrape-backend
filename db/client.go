package db

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// Client is a small Supabase REST client used by the backend.
type Client struct {
	BaseURL    string
	Key        string
	HTTPClient *http.Client
}

// NewClient builds a new REST client from the provided config.
func NewClient(cfg Config) (*Client, error) {
	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return &Client{
		BaseURL:  strings.TrimRight(cfg.SupabaseURL, "/"),
		Key:      cfg.SupabaseServiceRoleKey,
		HTTPClient: &http.Client{Timeout: 30 * time.Second},
	}, nil
}

func (c *Client) request(ctx context.Context, method, table string, params map[string]string, headers map[string]string, body io.Reader) (*http.Response, []byte, error) {
	endpoint := fmt.Sprintf("%s/rest/v1/%s", c.BaseURL, table)
	parsedURL, err := url.Parse(endpoint)
	if err != nil {
		return nil, nil, err
	}

	query := parsedURL.Query()
	for key, value := range params {
		if value != "" {
			query.Set(key, value)
		}
	}
	parsedURL.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, method, parsedURL.String(), body)
	if err != nil {
		return nil, nil, err
	}

	req.Header.Set("apikey", c.Key)
	req.Header.Set("Authorization", "Bearer "+c.Key)
	req.Header.Set("Content-Type", "application/json")
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, nil, err
	}

	payload, readErr := io.ReadAll(resp.Body)
	_ = resp.Body.Close()
	if readErr != nil {
		return resp, nil, readErr
	}

	return resp, payload, nil
}

// Select fetches rows from a Supabase table.
func (c *Client) Select(table string, params map[string]string) ([]map[string]interface{}, error) {
	resp, body, err := c.request(context.Background(), http.MethodGet, table, params, nil, nil)
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

// Insert creates a row and returns the inserted record.
func (c *Client) Insert(table string, data interface{}) (map[string]interface{}, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	resp, body, err := c.request(context.Background(), http.MethodPost, table, map[string]string{"select": "*"}, map[string]string{"Prefer": "return=representation"}, bytes.NewReader(jsonData))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("supabase error: %s", string(body))
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	if len(result) == 0 {
		return nil, fmt.Errorf("no data returned")
	}
	return result[0], nil
}

// UpdateByID updates a row by id and returns the updated record.
func (c *Client) UpdateByID(table, id string, data interface{}) (map[string]interface{}, error) {
	updated, err := c.UpdateWhere(table, map[string]string{"id": "eq." + id}, data)
	if err != nil {
		return nil, err
	}
	if len(updated) == 0 {
		return nil, fmt.Errorf("no data returned")
	}
	return updated[0], nil
}

// Update keeps backward compatibility with older call sites.
func (c *Client) Update(table, id string, data interface{}) (map[string]interface{}, error) {
	return c.UpdateByID(table, id, data)
}

// UpdateWhere updates rows matched by the supplied filters.
func (c *Client) UpdateWhere(table string, params map[string]string, data interface{}) ([]map[string]interface{}, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	resp, body, err := c.request(context.Background(), http.MethodPatch, table, params, map[string]string{"Prefer": "return=representation"}, bytes.NewReader(jsonData))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return nil, fmt.Errorf("supabase error: %s", string(body))
	}
	if len(body) == 0 {
		return []map[string]interface{}{}, nil
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

// DeleteByID deletes a row by id.
func (c *Client) DeleteByID(table, id string) error {
	return c.DeleteWhere(table, map[string]string{"id": "eq." + id})
}

// Delete keeps backward compatibility with older call sites.
func (c *Client) Delete(table, id string) error {
	return c.DeleteByID(table, id)
}

// DeleteWhere deletes rows matched by the supplied filters.
func (c *Client) DeleteWhere(table string, params map[string]string) error {
	resp, body, err := c.request(context.Background(), http.MethodDelete, table, params, nil, nil)
	if err != nil {
		return err
	}
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("supabase error: %s", string(body))
	}
	return nil
}

// Health checks that the REST API is reachable.
func (c *Client) Health() error {
	_, err := c.Select("portfolio_items", map[string]string{"select": "id", "limit": "1"})
	return err
}
