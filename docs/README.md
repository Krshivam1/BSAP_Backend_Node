# Performance Statistics API Documentation

This directory contains comprehensive API documentation for the Performance Statistics Management System.

## Quick Start

1. **View Interactive Documentation**: Visit `http://localhost:3000/api/docs` when the server is running
2. **API Base URL**: `http://localhost:3000/api`
3. **Authentication**: Most endpoints require Bearer token authentication

## Documentation Structure

### Core Documentation Files

- `API_DOCUMENTATION_TEMPLATE.md` - Templates and examples for adding Swagger documentation
- `swagger.js` - OpenAPI specification configuration with schemas and components
- `generateSwaggerDocs.js` - Automated documentation generation script

### API Endpoints Overview

#### Authentication Endpoints (`/api/auth`)
- `POST /auth/login` - User login with credentials
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh authentication token
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Complete password reset

#### User Management (`/api/users`)
- `GET /users` - List users with pagination and filtering
- `POST /users` - Create new user (Admin only)
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user information
- `DELETE /users/{id}` - Delete user (Admin only)
- `POST /users/{id}/activate` - Activate user account
- `POST /users/{id}/deactivate` - Deactivate user account

#### Administrative Functions (`/api/admin`)
- `GET /admin/dashboard` - Admin dashboard statistics
- `GET /admin/system-config` - System configuration settings
- `PUT /admin/system-config/{key}` - Update system configuration
- `POST /admin/system-config` - Create new configuration
- `GET /admin/users/statistics` - User statistics overview
- `GET /admin/performance/overview` - Performance analytics
- `POST /admin/backup/create` - Create system backup

#### Geography Management (`/api/states`, `/api/districts`, `/api/ranges`)
- `GET /states` - List all states
- `POST /states` - Create new state
- `GET /states/{id}` - Get state by ID
- `PUT /states/{id}` - Update state
- `DELETE /states/{id}` - Delete state
- Similar CRUD operations for districts and ranges

#### Content Management (`/api/modules`, `/api/topics`, `/api/sub-topics`, `/api/questions`)
- `GET /modules` - List learning modules
- `POST /modules` - Create new module
- `GET /modules/{id}` - Get module details
- `PUT /modules/{id}` - Update module
- `DELETE /modules/{id}` - Delete module
- Similar operations for topics, sub-topics, and questions

#### Performance Statistics (`/api/performance-statistics`)
- `GET /performance-statistics` - List performance records with filtering
- `POST /performance-statistics` - Submit new performance data
- `GET /performance-statistics/{id}` - Get specific performance record
- `PUT /performance-statistics/{id}` - Update performance record
- `GET /performance-statistics/user/{userId}` - Get user's performance history
- `GET /performance-statistics/analytics` - Performance analytics and reports

#### Communications (`/api/communications`)
- `GET /communications` - List messages and communications
- `POST /communications` - Send new message
- `GET /communications/{id}` - Get specific communication
- `PUT /communications/{id}/read` - Mark communication as read
- `POST /communications/broadcast` - Send broadcast message

#### Reports (`/api/reports`)
- `GET /reports/performance` - Generate performance reports
- `GET /reports/user-activity` - User activity reports
- `GET /reports/system-usage` - System usage analytics
- `POST /reports/export` - Export reports in various formats

#### CID (Crime Investigation Department) (`/api/cid`)
- `GET /cid/crime-categories` - List crime categories
- `POST /cid/crime-data` - Submit crime data
- `GET /cid/crime-data` - List crime records
- `GET /cid/districts` - CID-specific district data
- `GET /cid/police-stations` - Police station information

#### File Management (`/api/files`)
- `POST /files/upload/{type}` - Upload single file by category
- `POST /files/upload-multiple/{type}` - Upload multiple files
- `GET /files/download/{filename}` - Download file
- `GET /files/info/{filename}` - Get file information
- `DELETE /files/{filename}` - Delete file
- `GET /files/list/{type}` - List files by category
- `POST /files/cleanup` - Clean up old files (Admin only)

## Authentication

### Bearer Token Authentication

Most endpoints require authentication using JWT tokens:

```http
Authorization: Bearer <your-jwt-token>
```

### Obtaining Authentication Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... },
    "expiresIn": 3600
  }
}
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2025-09-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Operation failed",
  "error": {
    "code": "ERROR_CODE",
    "details": [
      {
        "field": "fieldName",
        "message": "Validation error message"
      }
    ]
  },
  "timestamp": "2025-09-15T10:30:00.000Z"
}
```

## Pagination

List endpoints support pagination with these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term for filtering
- `sort` - Sort field and direction (e.g., "name:asc", "createdAt:desc")

### Pagination Response
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Error Codes

Common HTTP status codes and their meanings:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

## API Versioning

Current API version: `v1.0.0`

Version information is available at:
- Header: `X-API-Version: 1.0.0`
- Endpoint: `GET /api/health` includes version info

## Rate Limiting

API requests are subject to rate limiting:
- Authenticated users: 1000 requests per hour
- Unauthenticated requests: 100 requests per hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit` - Request limit per hour
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset time (Unix timestamp)

## SDK and Client Libraries

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  }
});

// Get users
const users = await apiClient.get('/users?page=1&limit=10');

// Create user
const newUser = await apiClient.post('/users', {
  username: 'john.doe',
  email: 'john@example.com',
  // ... other fields
});
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Get users (authenticated)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer your-jwt-token"

# Upload file
curl -X POST http://localhost:3000/api/files/upload/documents \
  -H "Authorization: Bearer your-jwt-token" \
  -F "file=@document.pdf"
```

## Environment Configuration

Required environment variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=performance_stats
DB_USER=postgres
DB_PASS=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# API
API_BASE_URL=http://localhost:3000/api
API_VERSION=1.0.0
```

## Development and Testing

### Running the Server
```bash
npm run dev    # Development mode with auto-reload
npm start      # Production mode
npm test       # Run tests
```

### API Documentation Development
```bash
# Generate documentation for new controllers
node scripts/generateSwaggerDocs.js

# View documentation locally
# Visit http://localhost:3000/api/docs
```

## Support and Contributing

- **Issues**: Report bugs and feature requests via GitHub issues
- **Documentation**: Improvements to API documentation are welcome
- **Testing**: All new endpoints should include comprehensive tests
- **Standards**: Follow the existing code style and documentation patterns

## Migration from Java Spring Boot

This API represents a complete migration from Java Spring Boot to Node.js Express while maintaining:
- ✅ All original functionality and endpoints
- ✅ Database schema compatibility
- ✅ Authentication and authorization patterns
- ✅ Performance characteristics
- ✅ Enterprise-grade error handling and validation

For migration details, see the project's main README.md file.