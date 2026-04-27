.PHONY: help build run test clean deps install

help: ## Show this help message
	@echo "\n🚀 Dreamscape Backend - Available Commands:"
	@echo ""
	@echo "  make deps      - Download Go dependencies"
	@echo "  make build     - Build the backend binary"
	@echo "  make run       - Run the development server"
	@echo "  make test      - Run tests"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make install    - Install development tools"
	@echo ""

deps: ## Download Go dependencies
	@echo "📦 Downloading dependencies..."
	go mod download
	go mod tidy

build: deps ## Build the backend binary
	@echo "🔨 Building backend..."
	go build -o dreamscape-backend .
	@echo "✅ Build complete: ./dreamscape-backend"

run: ## Run the development server
	@echo "🚀 Starting development server..."
	go run main.go

test: ## Run tests
	@echo "🧪 Running tests..."
	go test -v ./...

clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	rm -f dreamscape-backend
	rm -f go.sum
	@echo "✅ Clean complete"

install: ## Install development tools
	@echo "🔧 Installing development tools..."
	go install github.com/cosmtrek/air@latest
	@echo "✅ Development tools installed"

dev: ## Run with hot reload (requires air)
	@echo "🔥 Starting development server with hot reload..."
	air

fmt: ## Format Go code
	@echo "🎨 Formatting code..."
	go fmt ./...

lint: ## Run linter
	@echo "🔍 Running linter..."
	go vet ./...

check: lint fmt ## Run all checks (lint + format)
	@echo "✅ All checks passed!"

ports: ## Check if ports are available
	@echo "🔍 Checking available ports..."
	@lsof -i :3000 -s > /dev/null 2>&1 && echo "⚠️  Port 3000 is in use" || echo "✅ Port 3000 is available"
	@lsof -i :8080 -s > /dev/null 2>&1 && echo "⚠️  Port 8080 is in use" || echo "✅ Port 8080 is available"

.DEFAULT_GOAL := help