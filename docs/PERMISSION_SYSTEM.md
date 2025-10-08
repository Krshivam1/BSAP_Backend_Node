# Permission-Based Authentication System

## Overview
This system provides comprehensive permission-based access control for API endpoints. It verifies JWT tokens and checks user permissions against the database before allowing access to protected routes.

## Database Tables
- `permission`: Stores all available permissions with URLs and codes
- `role_permission`: Maps roles to permissions (many-to-many relationship)

## Available Middleware Functions

### 1. `authenticate`
Basic JWT token verification without permission checking.
```javascript
const { authenticate } = require('../middleware/auth');
router.get('/basic-route', authenticate, controller.method);
```

### 2. `authenticateWithPermission`
JWT verification + automatic permission checking based on the current URL.
```javascript
const { authenticateWithPermission } = require('../middleware/auth');
router.get('/users', authenticateWithPermission, userController.getAll);
```

### 3. `checkPermission(permissionCode)`
Check for specific permission after authentication.
```javascript
const { authenticate, checkPermission } = require('../middleware/auth');
router.delete('/users/:id', authenticate, checkPermission('USER_DELETE'), userController.delete);
```

### 4. `hasPermission(userId, permissionCode)`
Utility function to check permissions programmatically in controllers.
```javascript
const { hasPermission } = require('../middleware/auth');

// In controller
const canEdit = await hasPermission(req.user.id, 'USER_UPDATE');
if (!canEdit) {
  return res.status(403).json({ message: 'Permission denied' });
}
```

## Implementation Examples

### Method 1: Automatic URL-based Permission Checking
```javascript
const express = require('express');
const router = express.Router();
const { authenticateWithPermission } = require('../middleware/auth');

// Automatically checks permission based on URL pattern
router.get('/users', authenticateWithPermission, userController.getAll);
router.get('/users/:id', authenticateWithPermission, userController.getById);
router.post('/users', authenticateWithPermission, userController.create);
router.put('/users/:id', authenticateWithPermission, userController.update);
router.delete('/users/:id', authenticateWithPermission, userController.delete);
```

### Method 2: Specific Permission Code Checking
```javascript
const express = require('express');
const router = express.Router();
const { authenticate, checkPermission } = require('../middleware/auth');

// First authenticate, then check specific permission
router.get('/users', authenticate, checkPermission('USER_VIEW_ALL'), userController.getAll);
router.post('/users', authenticate, checkPermission('USER_CREATE'), userController.create);
router.put('/users/:id', authenticate, checkPermission('USER_UPDATE'), userController.update);
router.delete('/users/:id', authenticate, checkPermission('USER_DELETE'), userController.delete);
```

### Method 3: Manual Permission Checking in Controllers
```javascript
const { hasPermission } = require('../middleware/auth');

const userController = {
  async update(req, res) {
    try {
      // Check if user can update their own profile or any user
      const canUpdateAny = await hasPermission(req.user.id, 'USER_UPDATE_ANY');
      const canUpdateOwn = await hasPermission(req.user.id, 'USER_UPDATE_OWN');
      
      const targetUserId = req.params.id;
      
      if (!canUpdateAny && (!canUpdateOwn || req.user.id !== parseInt(targetUserId))) {
        return res.status(403).json({ 
          success: false, 
          message: 'Permission denied' 
        });
      }
      
      // Proceed with update logic
      // ...
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
```

## Error Responses

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Access token is required"
}
```

```json
{
  "success": false,
  "message": "Invalid token or user not found"
}
```

### Permission Errors (403)
```json
{
  "success": false,
  "message": "Access denied. No permission found for GET /api/users"
}
```

```json
{
  "success": false,
  "message": "Access denied. Role 'User' does not have permission for 'View All Users'"
}
```

```json
{
  "success": false,
  "message": "Access denied. Permission 'USER_DELETE' required"
}
```

## How It Works

1. **Token Verification**: Extracts and verifies JWT token from Authorization header
2. **User Lookup**: Finds user in database and loads role information
3. **URL Matching**: Matches current endpoint URL with permissions in database
   - First tries exact match
   - If not found, uses pattern matching for dynamic routes (e.g., `:id` parameters)
4. **Permission Check**: Verifies user's role has the required permission
5. **Access Grant**: If all checks pass, adds `req.user` and `req.permission` to request object

## Permission URL Patterns

The system handles both exact URLs and dynamic patterns:
- Exact: `/api/users` → matches `/api/users`
- Pattern: `/api/users/:id` → matches `/api/users/123`, `/api/users/456`, etc.
- Pattern: `/api/users/:id/profile` → matches `/api/users/123/profile`

## Best Practices

1. **Use `authenticateWithPermission` for standard CRUD operations** - it automatically handles permission checking
2. **Use `checkPermission()` for specific business logic** - when you need to check particular permission codes
3. **Use `hasPermission()` in controllers** - for complex conditional logic based on permissions
4. **Combine methods as needed** - you can use multiple approaches in the same application

## Setup Steps

1. Ensure your permission table contains all API endpoints
2. Set up role_permission mappings for each role
3. Replace `authenticate` with `authenticateWithPermission` in routes that need permission checking
4. Test with different user roles to verify access control

## Testing Permission System

```javascript
// Test different scenarios
const testCases = [
  { role: 'Admin', endpoint: '/api/users', expected: 'success' },
  { role: 'User', endpoint: '/api/users', expected: 'forbidden' },
  { role: 'User', endpoint: '/api/users/123', expected: 'success' }, // own profile
  { role: 'User', endpoint: '/api/users/456', expected: 'forbidden' } // other's profile
];
```