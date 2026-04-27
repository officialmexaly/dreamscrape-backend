package auth

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"dreamscape-backend/backend/models"
	"dreamscape-backend/backend/handlers/common"
	"dreamscape-backend/backend/services"
	"dreamscape-backend/pkg/errors"
)

// OAuthHandler handles OAuth 2.0 authentication
type OAuthHandler struct {
	authService *services.AuthService
	config      *OAuthConfig
}

// OAuthConfig holds OAuth configuration
type OAuthConfig struct {
	Google   GoogleOAuthConfig
	Facebook FacebookOAuthConfig
	Apple    AppleOAuthConfig
}

// GoogleOAuthConfig holds Google OAuth configuration
type GoogleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	AuthURL      string
	TokenURL     string
	UserInfoURL  string
}

// FacebookOAuthConfig holds Facebook OAuth configuration
type FacebookOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	AuthURL      string
	TokenURL     string
	UserInfoURL  string
}

// AppleOAuthConfig holds Apple OAuth configuration
type AppleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	AuthURL      string
	TokenURL     string
	UserInfoURL  string
}

// NewOAuthHandler creates a new OAuth handler
func NewOAuthHandler(authService *services.AuthService) *OAuthHandler {
	return &OAuthHandler{
		authService: authService,
		config:      loadOAuthConfig(),
	}
}

// loadOAuthConfig loads OAuth configuration from environment variables
func loadOAuthConfig() *OAuthConfig {
	return &OAuthConfig{
		Google: GoogleOAuthConfig{
			ClientID:     os.Getenv("GOOGLE_OAUTH_CLIENT_ID"),
			ClientSecret: os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
			RedirectURI:  os.Getenv("GOOGLE_OAUTH_REDIRECT_URI"),
			AuthURL:      "https://accounts.google.com/o/oauth2/v2/auth",
			TokenURL:     "https://oauth2.googleapis.com/token",
			UserInfoURL:  "https://www.googleapis.com/oauth2/v2/userinfo",
		},
		Facebook: FacebookOAuthConfig{
			ClientID:     os.Getenv("FACEBOOK_OAUTH_CLIENT_ID"),
			ClientSecret: os.Getenv("FACEBOOK_OAUTH_CLIENT_SECRET"),
			RedirectURI:  os.Getenv("FACEBOOK_OAUTH_REDIRECT_URI"),
			AuthURL:      "https://www.facebook.com/v18.0/dialog/oauth",
			TokenURL:     "https://graph.facebook.com/v18.0/oauth/access_token",
			UserInfoURL:  "https://graph.facebook.com/v18.0/me?fields=id,email,first_name,last_name,picture",
		},
		Apple: AppleOAuthConfig{
			ClientID:     os.Getenv("APPLE_OAUTH_CLIENT_ID"),
			ClientSecret: os.Getenv("APPLE_OAUTH_CLIENT_SECRET"),
			RedirectURI:  os.Getenv("APPLE_OAUTH_REDIRECT_URI"),
			AuthURL:      "https://appleid.apple.com/auth/authorize",
			TokenURL:     "https://appleid.apple.com/auth/token",
			UserInfoURL:  "https://appleid.apple.com/auth/userinfo",
		},
	}
}

// GoogleLogin initiates Google OAuth flow
// @Summary      Initiate Google OAuth
// @Description  Redirect user to Google OAuth consent screen
// @Tags         oauth
// @Produce      json
// @Success      302  {string}  string "Redirects to Google"
// @Router       /api/auth/google/login [get]
func (h *OAuthHandler) GoogleLogin(c *gin.Context) {
	if h.config.Google.ClientID == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Google OAuth not configured"})
		return
	}

	// Generate state parameter for security
	state := uuid.New().String()

	// Store state in session or cache (for production, use Redis)
	// For now, we'll use a simple approach

	oauthURL := fmt.Sprintf("%s?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&state=%s",
		h.config.Google.AuthURL,
		h.config.Google.ClientID,
		h.config.Google.RedirectURI,
		url.QueryEscape("email profile"),
		url.QueryEscape(state),
	)

	c.Redirect(http.StatusFound, oauthURL)
}

// GoogleCallback handles Google OAuth callback
// @Summary      Google OAuth callback
// @Description  Handle Google OAuth callback and create/update user
// @Tags         oauth
// @Accept       json
// @Produce      json
// @Param        code   query      string  true  "OAuth authorization code"
// @Param        state   query      string  true  "OAuth state parameter"
// @Success      200  {object}  models.AuthResponse
// @Failure      400  {object}  models.ErrorResponse
// @Failure      401  {object}  models.ErrorResponse
// @Router       /api/auth/google/callback [get]
func (h *OAuthHandler) GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")

	if code == "" {
		common.ErrorResponse(c, errors.BadRequest("Authorization code required"))
		return
	}

	// Exchange code for tokens
	tokens, err := h.exchangeGoogleCode(code)
	if err != nil {
		common.ErrorResponse(c, errors.InternalServerError("Failed to exchange authorization code"))
		log.Printf("Google OAuth token exchange failed: %v", err)
		return
	}

	// Get user info from Google
	googleUserInfo, err := h.getGoogleUserInfo(tokens.AccessToken)
	if err != nil {
		common.ErrorResponse(c, errors.InternalServerError("Failed to get user information"))
		log.Printf("Google user info request failed: %v", err)
		return
	}

	// Create or update user
	_, tokenPair, err := h.authService.CreateOrUpdateOAuthUser("google", googleUserInfo.Email, googleUserInfo)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Set HTTP-only cookies
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"access_token",
		tokenPair.AccessToken,
		int(time.Until(tokenPair.ExpiresAt).Seconds()),
		"/",
		"",
		os.Getenv("COOKIE_SECURE") == "true",
		true,
	)
	c.SetCookie(
		"refresh_token",
		tokenPair.RefreshToken,
		int(7*24*time.Hour.Seconds()),
		"/",
		"",
		os.Getenv("COOKIE_SECURE") == "true",
		true,
	)

	log.Printf("✅ User %s logged in via Google OAuth (state: %s)", googleUserInfo.Email, state)

	// Redirect to frontend
	redirectURL := os.Getenv("FRONTEND_URL") + "/auth/callback"
	c.Redirect(http.StatusFound, redirectURL)
}

// FacebookLogin initiates Facebook OAuth flow
// @Summary      Initiate Facebook OAuth
// @Description  Redirect user to Facebook OAuth consent screen
// @Tags         oauth
// @Produce      json
// @Success      302  {string}  string "Redirects to Facebook"
// @Router       /api/auth/facebook/login [get]
func (h *OAuthHandler) FacebookLogin(c *gin.Context) {
	if h.config.Facebook.ClientID == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Facebook OAuth not configured"})
		return
	}

	state := uuid.New().String()

	oauthURL := fmt.Sprintf("%s?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&state=%s",
		h.config.Facebook.AuthURL,
		h.config.Facebook.ClientID,
		h.config.Facebook.RedirectURI,
		url.QueryEscape("email public_profile"),
		url.QueryEscape(state),
	)

	c.Redirect(http.StatusFound, oauthURL)
}

// FacebookCallback handles Facebook OAuth callback
// @Summary      Facebook OAuth callback
// @Description  Handle Facebook OAuth callback and create/update user
// @Tags         oauth
// @Accept       json
// @Produce      json
// @Param        code   query      string  true  "OAuth authorization code"
// @Param        state   query      string  true  "OAuth state parameter"
// @Success      200  {object}  models.AuthResponse
// @Failure      400  {object}  models.ErrorResponse
// @Failure      401  {object}  models.ErrorResponse
// @Router       /api/auth/facebook/callback [get]
func (h *OAuthHandler) FacebookCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")

	if code == "" {
		common.ErrorResponse(c, errors.BadRequest("Authorization code required"))
		return
	}

	// Exchange code for tokens
	tokens, err := h.exchangeFacebookCode(code)
	if err != nil {
		common.ErrorResponse(c, errors.InternalServerError("Failed to exchange authorization code"))
		log.Printf("Facebook OAuth token exchange failed: %v", err)
		return
	}

	// Get user info from Facebook
	facebookUserInfo, err := h.getFacebookUserInfo(tokens.AccessToken)
	if err != nil {
		common.ErrorResponse(c, errors.InternalServerError("Failed to get user information"))
		log.Printf("Facebook user info request failed: %v", err)
		return
	}

	// Create or update user
	_, tokenPair, err := h.authService.CreateOrUpdateOAuthUser("facebook", facebookUserInfo.Email, facebookUserInfo)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Set HTTP-only cookies
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"access_token",
		tokenPair.AccessToken,
		int(time.Until(tokenPair.ExpiresAt).Seconds()),
		"/",
		"",
		os.Getenv("COOKIE_SECURE") == "true",
		true,
	)
	c.SetCookie(
		"refresh_token",
		tokenPair.RefreshToken,
		int(7*24*time.Hour.Seconds()),
		"/",
		"",
		os.Getenv("COOKIE_SECURE") == "true",
		true,
	)

	log.Printf("✅ User %s logged in via Facebook OAuth (state: %s)", facebookUserInfo.Email, state)

	redirectURL := os.Getenv("FRONTEND_URL") + "/auth/callback"
	c.Redirect(http.StatusFound, redirectURL)
}

// AppleLogin initiates Apple OAuth flow
// @Summary      Initiate Apple OAuth
// @Description  Redirect user to Apple OAuth consent screen
// @Tags         oauth
// @Produce      json
// @Success      302  {string}  string "Redirects to Apple"
// @Router       /api/auth/apple/login [get]
func (h *OAuthHandler) AppleLogin(c *gin.Context) {
	if h.config.Apple.ClientID == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Apple OAuth not configured"})
		return
	}

	state := uuid.New().String()

	// Apple requires specific response mode and scopes
	oauthURL := fmt.Sprintf("%s?client_id=%s&redirect_uri=%s&response_type=code&response_mode=form_post&scope=%s&state=%s",
		h.config.Apple.AuthURL,
		h.config.Apple.ClientID,
		h.config.Apple.RedirectURI,
		url.QueryEscape("name email"),
		url.QueryEscape(state),
	)

	c.Redirect(http.StatusFound, oauthURL)
}

// AppleCallback handles Apple OAuth callback
// @Summary      Apple OAuth callback
// @Description  Handle Apple OAuth callback and create/update user
// @Tags         oauth
// @Accept       json
// @Produce      json
// @Param        code   query      string  true  "OAuth authorization code"
// @Param        state   query      string  true  "OAuth state parameter"
// @Param        name   query      string  false  "User name (from Apple)"
// @Param        email   query      string  false  "User email (from Apple)"
// @Success      200  {object}  models.AuthResponse
// @Failure      400  {object}  models.ErrorResponse
// @Failure      401  {object}  models.ErrorResponse
// @Router       /api/auth/apple/callback [post]
func (h *OAuthHandler) AppleCallback(c *gin.Context) {
	code := c.PostForm("code")
	state := c.PostForm("state")

	// Apple sends user data in POST form data
	userName := c.PostForm("user") // First and last name
	userEmail := c.PostForm("email") // Email is masked by default

	if code == "" {
		common.ErrorResponse(c, errors.BadRequest("Authorization code required"))
		return
	}

	// Exchange code for tokens (validation only)
	_, err := h.exchangeAppleCode(code)
	if err != nil {
		common.ErrorResponse(c, errors.InternalServerError("Failed to exchange authorization code"))
		log.Printf("Apple OAuth token exchange failed: %v", err)
		return
	}

	// Get user info from Apple (email might be masked)
	appleUserInfo := &models.AppleUserInfo{
		Email: userEmail,
		Name:  userName,
	}

	// Create or update user
	_, tokenPair, err := h.authService.CreateOrUpdateOAuthUser("apple", appleUserInfo.Email, appleUserInfo)
	if err != nil {
		common.ErrorResponse(c, err)
		return
	}

	// Set HTTP-only cookies
	c.SetSameSite(http.SameSiteLaxMode) // Apple requires Lax mode
	c.SetCookie(
		"access_token",
		tokenPair.AccessToken,
		int(time.Until(tokenPair.ExpiresAt).Seconds()),
		"/",
		"",
		os.Getenv("COOKIE_SECURE") == "true",
		true,
	)
	c.SetCookie(
		"refresh_token",
		tokenPair.RefreshToken,
		int(7*24*time.Hour.Seconds()),
		"/",
		"",
		os.Getenv("COOKIE_SECURE") == "true",
		true,
	)

	log.Printf("✅ User %s logged in via Apple OAuth (state: %s)", appleUserInfo.Email, state)

	redirectURL := os.Getenv("FRONTEND_URL") + "/auth/callback"
	c.Redirect(http.StatusFound, redirectURL)
}

// Token response structures
type GoogleTokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
	IDToken      string `json:"id_token"`
}

type FacebookTokens struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
}

type AppleTokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	IDToken      string `json:"id_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
}

// Helper functions for OAuth flows

func (h *OAuthHandler) exchangeGoogleCode(code string) (*GoogleTokens, error) {
	data := url.Values{}
	data.Set("code", code)
	data.Set("client_id", h.config.Google.ClientID)
	data.Set("client_secret", h.config.Google.ClientSecret)
	data.Set("redirect_uri", h.config.Google.RedirectURI)
	data.Set("grant_type", "authorization_code")

	resp, err := http.PostForm(h.config.Google.TokenURL, data)
	if err != nil {
		return nil, fmt.Errorf("token exchange request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token exchange failed: %s", string(body))
	}

	var tokens GoogleTokens
	if err := json.NewDecoder(resp.Body).Decode(&tokens); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	return &tokens, nil
}

func (h *OAuthHandler) getGoogleUserInfo(accessToken string) (*models.GoogleUserInfo, error) {
	req, err := http.NewRequest("GET", h.config.Google.UserInfoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("user info request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("user info request failed: %s", string(body))
	}

	var userInfo models.GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode user info: %w", err)
	}

	return &userInfo, nil
}

func (h *OAuthHandler) exchangeFacebookCode(code string) (*FacebookTokens, error) {
	data := url.Values{}
	data.Set("code", code)
	data.Set("client_id", h.config.Facebook.ClientID)
	data.Set("client_secret", h.config.Facebook.ClientSecret)
	data.Set("redirect_uri", h.config.Facebook.RedirectURI)
	data.Set("grant_type", "authorization_code")

	resp, err := http.PostForm(h.config.Facebook.TokenURL, data)
	if err != nil {
		return nil, fmt.Errorf("token exchange request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token exchange failed: %s", string(body))
	}

	var tokens FacebookTokens
	if err := json.NewDecoder(resp.Body).Decode(&tokens); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	return &tokens, nil
}

func (h *OAuthHandler) getFacebookUserInfo(accessToken string) (*models.FacebookUserInfo, error) {
	req, err := http.NewRequest("GET", h.config.Facebook.UserInfoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("user info request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("user info request failed: %s", string(body))
	}

	var userInfo models.FacebookUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode user info: %w", err)
	}

	return &userInfo, nil
}

func (h *OAuthHandler) exchangeAppleCode(code string) (*AppleTokens, error) {
	data := url.Values{}
	data.Set("code", code)
	data.Set("client_id", h.config.Apple.ClientID)
	data.Set("client_secret", h.config.Apple.ClientSecret)
	data.Set("redirect_uri", h.config.Apple.RedirectURI)
	data.Set("grant_type", "authorization_code")

	resp, err := http.PostForm(h.config.Apple.TokenURL, data)
	if err != nil {
		return nil, fmt.Errorf("token exchange request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token exchange failed: %s", string(body))
	}

	var tokens AppleTokens
	if err := json.NewDecoder(resp.Body).Decode(&tokens); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	return &tokens, nil
}

func (h *OAuthHandler) getAppleUserInfo(accessToken, email, name string) (*models.AppleUserInfo, error) {
	// Apple provides email and name in the callback or ID token
	// For masked emails, we need to handle them specially
	return &models.AppleUserInfo{
		Email:    email,
		Name:     name,
		Verified: true, // Apple emails are always verified
	}, nil
}