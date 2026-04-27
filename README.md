# Dreamscape Backend API

High-performance Go backend for Dreamscape Events management system.

## 🏗️ Architecture

### Technology Stack
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL with Supabase REST API integration
- **Authentication**: JWT with OAuth2 (Google, Facebook, Apple)
- **Documentation**: Swagger/OpenAPI 2.0
- **Language**: Go 1.21+

### Project Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point
├── internal/                    # Private application code
│   ├── handlers/               # HTTP request handlers
│   │   ├── admin/              # Admin-only endpoints
│   │   ├── auth/               # Authentication & OAuth
│   │   └── public/             # Public API endpoints
│   ├── middleware/             # HTTP middleware (auth, cors, etc.)
│   ├── models/                 # Data models and domain types
│   ├── services/               # Business logic layer
│   └── database/               # Database connection management
├── pkg/                        # Public libraries
│   ├── config/                 # Configuration management
│   ├── errors/                 # Error handling utilities
│   └── utils/                  # General utilities
├── db/                         # Database client implementation
├── scripts/                    # Utility scripts
│   ├── admin/                  # Admin management tools
│   └── debug/                  # Debugging utilities
├── tests/                      # Test files
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
├── docs/                       # Documentation
│   ├── README.md               # Detailed documentation
│   ├── STATUS.md               # Development status
│   └── SWAGGER.md              # API documentation
├── build/                      # Compiled binaries
├── logs/                       # Application logs
├── go.mod                      # Go module definition
├── go.sum                      # Go module checksums
├── Makefile                    # Build automation
└── .env                        # Environment configuration
```

## 🚀 Getting Started

### Prerequisites
- Go 1.21 or higher
- PostgreSQL database or Supabase account
- Environment variables configured

### Installation

1. **Clone and navigate to backend**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   go mod download
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the server**:
   ```bash
   make run
   # or
   go run cmd/server/main.go
   ```

### Build

```bash
make build
# Binary will be created in build/dreamscape-backend
```

## 📡 API Endpoints

### Public Routes
- `GET /api/health` - Health check
- `GET /api/portfolio-items` - List portfolio items
- `GET /api/events` - List events
- `GET /api/services` - List services

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/google/login` - Google OAuth
- `GET /api/auth/facebook/login` - Facebook OAuth
- `POST /api/auth/apple/callback` - Apple OAuth

### Admin Routes (Protected)
- `GET /api/admin/portfolio-items` - Manage portfolio
- `GET /api/admin/events` - Manage events
- `GET /api/admin/media-library` - Manage media
- `GET /api/admin/users` - Manage users

Full API documentation available at `/swagger/*` when server is running.

## 🔧 Configuration

Key environment variables (see `.env`):

```bash
# Server
SERVER_PORT=8080
GIN_MODE=release

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Authentication
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test
go test ./tests/unit/...

# Run with coverage
go test -cover ./...
```

## 📝 Code Standards

### Naming Conventions
- **Files**: `snake_case.go`
- **Packages**: lowercase, single word when possible
- **Functions/Variables**: `camelCase` for exported, `snakeCase` for private
- **Constants**: `PascalCase` or `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` with `-er` suffix (e.g., `Handler`, `Client`)

### Architecture Principles
1. **Separation of Concerns**: Clear boundaries between handlers, services, and data layers
2. **Dependency Injection**: Pass dependencies through constructors
3. **Error Handling**: Explicit error checks with proper HTTP status codes
4. **Middleware**: Use for cross-cutting concerns (auth, logging, etc.)
5. **Testing**: Write unit tests for business logic, integration tests for endpoints

## 🔐 Security

- JWT-based authentication with configurable expiration
- Role-based access control (admin, super_admin)
- CORS configuration for frontend integration
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- SQL injection prevention via parameterized queries

## 📚 Resources

- [Gin Framework Documentation](https://gin-gonic.com/docs/)
- [Supabase Client Library](https://supabase.com/docs/reference/golang)
- [Go Standards](https://go.dev/doc/effective_go)

## 🤝 Contributing

1. Follow the established code structure
2. Write tests for new features
3. Update Swagger documentation
4. Use meaningful commit messages
5. Create pull requests for review

## 📄 License

Proprietary - All rights reserved

---

**Last Updated**: 2026-04-26  
**Version**: 1.0.0  
**Maintainer**: Dreamscape Development Team