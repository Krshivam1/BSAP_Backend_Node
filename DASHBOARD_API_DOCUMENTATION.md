# Dashboard API Documentation

## Overview

The Dashboard API provides comprehensive analytics and statistics for the BSAP Performance Statistics system. It offers insights into user activity, performance metrics, geographical distribution, and system health.

## Base URL
```
/api/dashboard
```

## Authentication
All endpoints require authentication using the `authenticateWithPermission` middleware, which checks both JWT token validity and user permissions.

## Available Endpoints

### 1. Dashboard Overview
**GET** `/api/dashboard/overview`

Returns key metrics summary for the dashboard homepage.

**Response Example:**
```json
{
  "status": "SUCCESS",
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "totalUsers": 101,
    "activeUsers": 91,
    "inactiveUsers": 10,
    "totalModules": 13,
    "totalQuestions": 496,
    "totalPerformanceRecords": 114,
    "recentPerformanceCount": 14,
    "userActivationRate": "90.10"
  }
}
```

### 2. Comprehensive Statistics
**GET** `/api/dashboard/stats`

Returns detailed statistics across all system components.

**Response Example:**
```json
{
  "status": "SUCCESS",
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "users": { /* User statistics */ },
    "performance": { /* Performance statistics */ },
    "geography": { /* Geographic statistics */ },
    "modules": { /* Module statistics */ },
    "lastUpdated": "2025-10-08T07:06:05.861Z"
  }
}
```

### 3. User Statistics
**GET** `/api/dashboard/users/stats`

Returns comprehensive user statistics including role distribution and recent user activity.

**Response Example:**
```json
{
  "status": "SUCCESS",
  "message": "User statistics retrieved successfully",
  "data": {
    "total": 101,
    "active": 91,
    "inactive": 10,
    "byRole": [
      { "role": "ADMIN", "count": 2 },
      { "role": "SP", "count": 49 },
      { "role": "DIG", "count": 13 }
    ],
    "newUsersThisWeek": 1
  }
}
```

### 4. Users by Role
**GET** `/api/dashboard/users/by-role`

Returns users grouped by their roles.

**Response Example:**
```json
{
  "status": "SUCCESS",
  "message": "Users by role retrieved successfully",
  "data": [
    {
      "roleId": 1,
      "roleName": "ADMIN",
      "count": 2
    },
    {
      "roleId": 2,
      "roleName": "SP",
      "count": 49
    }
  ]
}
```

### 5. Users by State
**GET** `/api/dashboard/users/by-state`

Returns users grouped by their assigned states.

### 6. Recent Users
**GET** `/api/dashboard/users/recent?limit=10`

Returns recently registered users.

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 10)

### 7. Performance Overview
**GET** `/api/dashboard/performance/overview`

Returns performance statistics overview including total records, monthly data, and top performers.

### 8. Performance by Month
**GET** `/api/dashboard/performance/by-month`

Returns performance data aggregated by month for the last 12 months.

**Response Example:**
```json
{
  "status": "SUCCESS",
  "message": "Performance data by month retrieved successfully",
  "data": [
    { "month": "2024-11", "count": 45 },
    { "month": "2024-12", "count": 52 },
    { "month": "2025-01", "count": 38 }
  ]
}
```

### 9. Performance by Module
**GET** `/api/dashboard/performance/by-module`

Returns performance data grouped by modules.

### 10. Performance Trends
**GET** `/api/dashboard/performance/trends`

Returns daily performance trends for the last 30 days.

### 11. Geography Statistics
**GET** `/api/dashboard/geography/stats`

Returns statistics about geographical entities (states, districts, ranges, battalions).

**Response Example:**
```json
{
  "status": "SUCCESS",
  "message": "Geography statistics retrieved successfully",
  "data": {
    "totalStates": 1,
    "totalDistricts": 38,
    "totalRanges": 13,
    "totalBattalions": 3
  }
}
```

### 12. Geographic Distribution
**GET** `/api/dashboard/geography/distribution`

Returns user distribution across geographic entities.

### 13. Module Statistics
**GET** `/api/dashboard/modules/stats`

Returns statistics about modules, topics, and questions.

### 14. Question Statistics
**GET** `/api/dashboard/questions/stats`

Returns detailed statistics about questions grouped by modules and topics.

### 15. System Health
**GET** `/api/dashboard/system/health`

Returns system health information including database connectivity and record counts.

**Response Example:**
```json
{
  "status": "SUCCESS",
  "message": "System health information retrieved successfully",
  "data": {
    "database": {
      "connected": true,
      "message": "Database connection is healthy"
    },
    "records": {
      "users": 101,
      "roles": 11,
      "modules": 13,
      "topics": 94,
      "questions": 649,
      "performanceRecords": 114,
      "states": 1,
      "districts": 38,
      "ranges": 13,
      "battalions": 3
    },
    "recentActivity": 14,
    "timestamp": "2025-10-08T07:06:05.861Z",
    "status": "healthy"
  }
}
```

### 16. Recent Activity
**GET** `/api/dashboard/activity/recent?limit=20`

Returns recent performance statistic entries (last 24 hours).

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 20)

## Error Handling

All endpoints return standardized error responses:

**Error Response Format:**
```json
{
  "status": "ERROR",
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error

## Usage Examples

### JavaScript/Fetch
```javascript
// Get dashboard overview
const response = await fetch('/api/dashboard/overview', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### cURL
```bash
# Get user statistics
curl -X GET "http://localhost:3000/api/dashboard/users/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Axios
```javascript
// Get performance trends
const response = await axios.get('/api/dashboard/performance/trends', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Data Aggregation

The dashboard service efficiently aggregates data using:
- Parallel database queries for better performance
- Sequelize ORM for complex joins and aggregations
- Proper error handling and fallback mechanisms
- Optimized queries with appropriate indexes

## Permissions Required

Each endpoint requires specific permissions from the permission table:
- Dashboard overview: `DASHBOARD_VIEW_OVERVIEW`
- User statistics: `DASHBOARD_VIEW_USER_STATS`
- Performance data: `DASHBOARD_VIEW_PERFORMANCE`
- System health: `DASHBOARD_VIEW_SYSTEM_HEALTH`

## Best Practices

1. **Caching**: Consider implementing caching for frequently accessed endpoints
2. **Pagination**: Use limit parameters for endpoints that return large datasets
3. **Filtering**: Apply date filters for performance-sensitive queries
4. **Error Handling**: Always check response status before processing data
5. **Rate Limiting**: Implement rate limiting for dashboard endpoints to prevent abuse

## Notes

- All timestamps are returned in ISO 8601 format
- Counts and statistics are calculated in real-time
- Geographic distribution includes hierarchical relationships (State → District → Range → Battalion)
- Performance trends include daily, weekly, and monthly aggregations
- System health checks include database connectivity and basic system metrics