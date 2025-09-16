# Performance Statistics API - Node.js Express Backend

A comprehensive Node.js Express backend API converted from Java Spring Boot, featuring complete performance statistics management, user authentication, communication system, and CID crime data management.

## 🚀 Features

### Core Modules
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user lifecycle management with role assignments
- **Performance Statistics**: Advanced analytics and performance tracking
- **Communication System**: Internal messaging with file attachments
- **CID Crime Data Management**: Comprehensive crime data tracking and management
- **Reporting**: Excel and PDF report generation with customizable templates

### Entity Management
- **Geographic Entities**: States, Districts, Ranges with hierarchical relationships
- **Content Management**: Modules, Topics, Sub-topics, Questions with ordering
- **Menu System**: Dynamic menu hierarchy with role-based permissions
- **File Management**: Secure file upload and management

### Technical Features
- **Database**: MySQL with Sequelize ORM and auto-migrations
- **Security**: Helmet security headers, CORS, input validation, XSS protection
- **Validation**: Comprehensive Joi-based input validation
- **Error Handling**: Global error handling with detailed logging
- **File Upload**: Multer-based file handling with size and type restrictions
- **API Documentation**: Built-in endpoint documentation
- **Health Checks**: System health monitoring endpoints

## 📋 Prerequisites

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **MySQL**: >= 8.0
- **Git**: Latest version

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database and configuration settings

5. Create database:
   ```sql
   CREATE DATABASE performance_statistics;
   ```

6. Run database migrations:
   ```bash
   npm run db:migrate
   ```

7. Seed initial data (optional):
   ```bash
   npm run db:seed
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgotPassword` - Request password reset
- `POST /api/auth/verifyOtp` - Verify OTP
- `POST /api/auth/resetPassword` - Reset password

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `POST /api/users/:id/change-password` - Change password

### States, Ranges, Districts
- `GET /api/states` - Get all states
- `GET /api/ranges` - Get all ranges
- `GET /api/districts` - Get all districts

### Performance Statistics
- `GET /api/performance-statistics` - Get performance statistics
- `POST /api/performance-statistics` - Create performance statistic
- `PUT /api/performance-statistics/:id` - Update performance statistic
- `DELETE /api/performance-statistics/:id` - Delete performance statistic

### File Management
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files/download/:filename` - Download file
- `DELETE /api/files/:filename` - Delete file

### Reports
- `GET /api/reports` - Get reports
- `GET /api/reports/performance` - Get performance report
- `GET /api/reports/crime-statistics` - Get crime statistics

## Environment Variables

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=performance_statistics
DB_USERNAME=root
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# File Upload
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
```

## Database Scripts

- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Run seeders
- `npm run db:reset` - Reset database (undo migrations, migrate, seed)

## Project Structure

```
src/
├── config/          # Database and app configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Sequelize models
├── routes/          # Express routes
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Input validation
└── dto/            # Data transfer objects

migrations/          # Database migrations
seeders/            # Database seeders
logs/               # Application logs
uploads/            # File uploads
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

All API responses follow this format:

```json
{
  "success": boolean,
  "message": "string",
  "data": object|array|null,
  "error": string|null
}
```

## Logging

Application logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## Security Features

- Rate limiting
- Helmet.js security headers
- Input validation
- SQL injection prevention (Sequelize)
- Password hashing (bcrypt)
- CORS enabled

## Testing

```bash
npm test
```

## License

MIT