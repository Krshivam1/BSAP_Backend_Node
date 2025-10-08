# Dashboard API Endpoints with Request Parameters

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoint Details

### 1. Dashboard Overview
```http
GET /api/dashboard/overview
```

**Request Parameters:** None

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "totalUsers": 101,
    "activeUsers": 91,
    "inactiveUsers": 10,
    "roles": 11,
    "permissions": 176,
    "menus": 10,
    "subMenus": 224,
    "states": 1,
    "modules": 13,
    "ranges": 13,
    "battalions": 3,
    "topics": 94,
    "subTopics": 92,
    "questions": 649,
    "totalPerformanceRecords": 114,
    "recentPerformanceCount": 14,
    "userActivationRate": "90.10"
  }
}
```

---

### 2. Comprehensive Statistics
```http
GET /api/dashboard/stats
```

**Request Parameters:** None

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "users": {
      "total": 101,
      "active": 91,
      "inactive": 10,
      "byRole": [
        { "role": "ADMIN", "count": 2 },
        { "role": "SP", "count": 49 }
      ],
      "newUsersThisWeek": 1
    },
    "performance": {
      "totalRecords": 114,
      "recordsThisMonth": 25,
      "averagePerUser": "1.13",
      "topPerformers": []
    },
    "geography": {
      "totalStates": 1,
      "totalDistricts": 38,
      "totalRanges": 13,
      "totalBattalions": 3
    },
    "modules": {
      "totalModules": 13,
      "activeModules": 13,
      "inactiveModules": 0,
      "totalTopics": 94,
      "totalQuestions": 649
    },
    "lastUpdated": "2025-10-08T07:06:05.861Z"
  }
}
```

---

### 3. User Statistics
```http
GET /api/dashboard/users/stats
```

**Request Parameters:** None

**Response:**
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
      { "role": "DGP", "count": 2 },
      { "role": "IG", "count": 8 },
      { "role": "SP", "count": 49 }
    ],
    "newUsersThisWeek": 1
  }
}
```

---

### 4. Users by Role
```http
GET /api/dashboard/users/by-role
```

**Request Parameters:** None

**Response:**
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
      "roleId": 6,
      "roleName": "SP",
      "count": 49
    },
    {
      "roleId": 7,
      "roleName": "DIG",
      "count": 13
    }
  ]
}
```

---

### 5. Users by State
```http
GET /api/dashboard/users/by-state
```

**Request Parameters:** None

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Users by state retrieved successfully",
  "data": [
    {
      "stateId": 1,
      "stateName": "Bihar",
      "count": 85
    },
    {
      "stateId": 2,
      "stateName": "Jharkhand",
      "count": 16
    }
  ]
}
```

---

### 6. Recent Users
```http
GET /api/dashboard/users/recent?limit=10
```

**Query Parameters:**
- `limit` (optional): Number of recent users to return (default: 10, max: 50)

**Example Request:**
```bash
GET /api/dashboard/users/recent?limit=5
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Recent users retrieved successfully",
  "data": [
    {
      "id": 95,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "created_date": "2025-10-05T10:30:00.000Z",
      "role": {
        "roleName": "SP"
      }
    },
    {
      "id": 94,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "created_date": "2025-10-04T15:45:00.000Z",
      "role": {
        "roleName": "DIG"
      }
    }
  ]
}
```

---

### 7. Performance Overview
```http
GET /api/dashboard/performance/overview
```

**Request Parameters:** None

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Performance overview retrieved successfully",
  "data": {
    "totalRecords": 114,
    "recordsThisMonth": 25,
    "averagePerUser": "1.13",
    "topPerformers": [
      {
        "userId": 15,
        "userName": "Rajesh Kumar",
        "email": "rajesh.kumar@bsap.gov.in",
        "recordCount": 12
      },
      {
        "userId": 28,
        "userName": "Priya Sharma",
        "email": "priya.sharma@bsap.gov.in",
        "recordCount": 8
      }
    ]
  }
}
```

---

### 8. Performance by Month
```http
GET /api/dashboard/performance/by-month
```

**Request Parameters:** None

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Performance data by month retrieved successfully",
  "data": [
    { "month": "2024-10", "count": 15 },
    { "month": "2024-11", "count": 23 },
    { "month": "2024-12", "count": 18 },
    { "month": "2025-01", "count": 31 },
    { "month": "2025-02", "count": 27 },
    { "month": "2025-03", "count": 35 },
    { "month": "2025-04", "count": 29 },
    { "month": "2025-05", "count": 42 },
    { "month": "2025-06", "count": 38 },
    { "month": "2025-07", "count": 45 },
    { "month": "2025-08", "count": 52 },
    { "month": "2025-09", "count": 48 }
  ]
}
```

---

### 9. Performance by Module
```http
GET /api/dashboard/performance/by-module
```

**Request Parameters:** None

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Performance data by module retrieved successfully",
  "data": [
    {
      "moduleId": 1,
      "moduleName": "Crime Prevention",
      "count": 45
    },
    {
      "moduleId": 2,
      "moduleName": "Traffic Management",
      "count": 32
    },
    {
      "moduleId": 3,
      "moduleName": "Public Safety",
      "count": 28
    }
  ]
}
```

---

### 10. Performance Trends
```http
GET /api/dashboard/performance/trends
```

**Request Parameters:** None
**Data Range:** Last 30 days

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Performance trends retrieved successfully",
  "data": [
    { "date": "2025-09-09", "count": 3 },
    { "date": "2025-09-10", "count": 5 },
    { "date": "2025-09-11", "count": 2 },
    { "date": "2025-09-12", "count": 7 },
    { "date": "2025-09-13", "count": 4 },
    { "date": "2025-09-14", "count": 8 },
    { "date": "2025-09-15", "count": 6 }
  ]
}
```

---

### 11. Geography Statistics
```http
GET /api/dashboard/geography/stats
```

**Request Parameters:** None

**Response:**
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

---

### 12. Geographic Distribution
```http
GET /api/dashboard/geography/distribution
```

**Request Parameters:** None

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Geographic distribution retrieved successfully",
  "data": [
    {
      "stateId": 1,
      "stateName": "Bihar",
      "rangeId": 1,
      "rangeName": "Patna Range",
      "battalionId": 1,
      "battalionName": "1st Battalion",
      "userCount": 25
    },
    {
      "stateId": 1,
      "stateName": "Bihar",
      "rangeId": 2,
      "rangeName": "Gaya Range",
      "battalionId": 2,
      "battalionName": "2nd Battalion",
      "userCount": 18
    }
  ]
}
```

---

### 13. Module Statistics
```http
GET /api/dashboard/modules/stats
```

**Request Parameters:** None

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Module statistics retrieved successfully",
  "data": {
    "totalModules": 13,
    "activeModules": 13,
    "inactiveModules": 0,
    "totalTopics": 94,
    "totalQuestions": 649
  }
}
```

---

### 14. Question Statistics
```http
GET /api/dashboard/questions/stats
```

**Request Parameters:** None

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Question statistics retrieved successfully",
  "data": {
    "byModule": [
      {
        "moduleId": 1,
        "moduleName": "Crime Prevention",
        "count": 125
      },
      {
        "moduleId": 2,
        "moduleName": "Traffic Management",
        "count": 89
      }
    ],
    "byTopic": [
      {
        "topicId": 1,
        "topicName": "Investigation Techniques",
        "count": 45
      },
      {
        "topicId": 2,
        "topicName": "Evidence Collection",
        "count": 38
      }
    ]
  }
}
```

---

### 15. System Health
```http
GET /api/dashboard/system/health
```

**Request Parameters:** None

**Response:**
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

---

### 16. Recent Activity
```http
GET /api/dashboard/activity/recent?limit=20
```

**Query Parameters:**
- `limit` (optional): Number of recent activities to return (default: 20, max: 100)

**Example Request:**
```bash
GET /api/dashboard/activity/recent?limit=10
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Recent activity retrieved successfully",
  "data": [
    {
      "id": 245,
      "userId": 15,
      "moduleId": 3,
      "topicId": 12,
      "created_date": "2025-10-08T06:30:00.000Z",
      "user": {
        "firstName": "Rajesh",
        "lastName": "Kumar"
      },
      "module": {
        "moduleName": "Crime Prevention"
      },
      "topic": {
        "topicName": "Investigation Methods"
      }
    }
  ],
  "count": 10
}
```

---

### 17. Battalion Performance Statistics
```http
GET /api/dashboard/battalions/performance
```

**Request Parameters:** None

**Description:** Get battalion-wise performance statistics showing module completion for current month - 1

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Battalion performance statistics retrieved successfully",
  "data": {
    "monthYear": "SEP 2025",
    "battalionStats": [
      {
        "battalionId": 1,
        "battalionName": "1st Patna Battalion",
        "modulesWithData": 8,
        "totalActiveModules": 13,
        "completionPercentage": "61.5"
      },
      {
        "battalionId": 2,
        "battalionName": "2nd Patna Battalion", 
        "modulesWithData": 5,
        "totalActiveModules": 13,
        "completionPercentage": "38.5"
      },
      {
        "battalionId": 3,
        "battalionName": "3rd Gaya Battalion",
        "modulesWithData": 10,
        "totalActiveModules": 13,
        "completionPercentage": "76.9"
      }
    ],
    "totalBattalions": 3,
    "totalActiveModules": 13
  }
}
```

**Data Explanation:**
- `monthYear`: The previous month (current month - 1) for which statistics are calculated
- `battalionStats`: Array of battalion performance data
- `modulesWithData`: Number of modules that have performance data entries for this battalion
- `totalActiveModules`: Total number of active modules in the system
- `completionPercentage`: Percentage of modules completed by this battalion
- `totalBattalions`: Total number of battalions in the system

---

## Error Responses

All endpoints can return these error responses:

### Authentication Error (401)
```json
{
  "status": "ERROR",
  "message": "Access token is required"
}
```

### Permission Error (403)
```json
{
  "status": "ERROR",
  "message": "Access denied. Permission 'DASHBOARD_VIEW' required"
}
```

### Server Error (500)
```json
{
  "status": "ERROR",
  "message": "Failed to retrieve dashboard data",
  "error": "Database connection failed"
}
```

---

## Usage Examples

### JavaScript/Fetch
```javascript
// Get dashboard overview
const response = await fetch('/api/dashboard/overview', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

if (response.ok) {
  const data = await response.json();
  console.log(data.data);
} else {
  console.error('Failed to fetch dashboard data');
}
```

### JavaScript/Axios
```javascript
// Get recent users with limit
const response = await axios.get('/api/dashboard/users/recent', {
  params: { limit: 5 },
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log(response.data.data);
```

### cURL Examples
```bash
# Get performance trends
curl -X GET "http://localhost:3000/api/dashboard/performance/trends" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Get recent users with limit
curl -X GET "http://localhost:3000/api/dashboard/users/recent?limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Get system health
curl -X GET "http://localhost:3000/api/dashboard/system/health" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Node.js/Express Frontend Integration
```javascript
// Dashboard service for frontend
class DashboardAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async getOverview() {
    const response = await fetch(`${this.baseURL}/dashboard/overview`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }

  async getRecentUsers(limit = 10) {
    const response = await fetch(`${this.baseURL}/dashboard/users/recent?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }

  async getPerformanceTrends() {
    const response = await fetch(`${this.baseURL}/dashboard/performance/trends`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }
}

// Usage
const dashboard = new DashboardAPI('http://localhost:3000/api', userToken);
const overview = await dashboard.getOverview();
```

---

## Notes

1. **Rate Limiting**: Consider implementing rate limiting for dashboard endpoints
2. **Caching**: Dashboard data can be cached for 5-10 minutes to improve performance
3. **Real-time Updates**: Use WebSocket or polling for real-time dashboard updates
4. **Data Freshness**: All statistics are calculated in real-time from the database
5. **Timezone**: All timestamps are in UTC format
6. **Pagination**: For endpoints returning large datasets, consider implementing pagination
7. **Filtering**: Future versions may include date range filtering for performance data