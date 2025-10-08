# Permission System Implementation Guide

## Quick Start

### 1. Update Your Routes

Replace your existing authentication middleware with the new permission-based one:

#### Before (userRoutes.js):
```javascript
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, userController.search);
router.post('/', authenticate, userController.create);
```

#### After (userRoutes.js):
```javascript
const { authenticateWithPermission } = require('../middleware/auth');

// Option 1: Automatic URL-based permission checking
router.get('/', authenticateWithPermission, userController.search);
router.post('/', authenticateWithPermission, userController.create);

// Option 2: Specific permission checking
const { authenticate, checkPermission } = require('../middleware/auth');
router.get('/', authenticate, checkPermission('USER_VIEW_ALL'), userController.search);
router.post('/', authenticate, checkPermission('USER_CREATE'), userController.create);
```

### 2. Test the System

Run the test script to verify everything is working:
```bash
node test-permissions.js
```

### 3. Update All Route Files

Apply the same pattern to all your route files. Here are the recommended approaches:

## Implementation Approaches

### Approach 1: Full Automatic (Recommended for most routes)

Use `authenticateWithPermission` for standard CRUD operations:

```javascript
const { authenticateWithPermission } = require('../middleware/auth');

// These will automatically check permissions based on URL patterns
router.get('/users', authenticateWithPermission, userController.getAll);        // Checks USER_VIEW_ALL
router.get('/users/:id', authenticateWithPermission, userController.getById);  // Checks USER_VIEW_BY_ID  
router.post('/users', authenticateWithPermission, userController.create);      // Checks USER_CREATE
router.put('/users/:id', authenticateWithPermission, userController.update);   // Checks USER_UPDATE
router.delete('/users/:id', authenticateWithPermission, userController.delete); // Checks USER_DELETE
```

### Approach 2: Mixed (Recommended for complex business logic)

Use `authenticate` + `checkPermission` for specific permissions:

```javascript
const { authenticate, checkPermission } = require('../middleware/auth');
const PERMISSIONS = require('../constants/permissions');

// Standard routes with automatic checking
router.get('/users', authenticateWithPermission, userController.getAll);

// Special routes with specific permission checking
router.post('/users/:id/reset-password', 
  authenticate, 
  checkPermission(PERMISSIONS.USER.CHANGE_PASSWORD), 
  userController.resetPassword
);

router.post('/users/bulk-import', 
  authenticate, 
  checkPermission(PERMISSIONS.USER.CREATE), 
  userController.bulkImport
);
```

### Approach 3: Controller-Level (For complex conditional logic)

Use `hasPermission` utility in controllers:

```javascript
const { hasPermission } = require('../middleware/auth');
const PERMISSIONS = require('../constants/permissions');

const userController = {
  async updateProfile(req, res) {
    try {
      const targetUserId = parseInt(req.params.id);
      const currentUserId = req.user.id;
      
      // Check if user can edit any profile or only their own
      const canUpdateAny = await hasPermission(currentUserId, PERMISSIONS.USER.UPDATE);
      const canUpdateOwn = await hasPermission(currentUserId, 'USER_UPDATE_OWN_PROFILE');
      
      if (!canUpdateAny && (!canUpdateOwn || currentUserId !== targetUserId)) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own profile'
        });
      }
      
      // Proceed with update logic...
      
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
```

## Step-by-Step Implementation

### Step 1: Update Route Files

#### userRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateWithPermission } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

router.get('/', authenticateWithPermission, validatePagination, userController.search);
router.get('/active', authenticateWithPermission, userController.active);
router.get('/:id', authenticateWithPermission, validateId, userController.detail);
router.post('/', authenticateWithPermission, userController.create);
router.put('/:id', authenticateWithPermission, validateId, userController.update);
router.delete('/:id', authenticateWithPermission, validateId, userController.remove);
router.post('/:id/toggle-status', authenticateWithPermission, validateId, userController.toggleStatus);
router.post('/:id/verify', authenticateWithPermission, validateId, userController.verify);
router.post('/:id/change-password', authenticateWithPermission, validateId, userController.changePassword);

module.exports = router;
```

#### roleRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateWithPermission } = require('../middleware/auth');

router.get('/', authenticateWithPermission, roleController.getAll);
router.get('/active', authenticateWithPermission, roleController.getActive);
router.get('/:id', authenticateWithPermission, roleController.getById);
router.post('/', authenticateWithPermission, roleController.create);
router.put('/:id', authenticateWithPermission, roleController.update);
router.delete('/:id', authenticateWithPermission, roleController.delete);

module.exports = router;
```

### Step 2: Test Each Module

Create test cases for each role:

```javascript
// Test with different user tokens
const testScenarios = [
  {
    description: 'Admin should access all user endpoints',
    token: 'admin_jwt_token',
    tests: [
      { method: 'GET', url: '/api/users', expectedStatus: 200 },
      { method: 'POST', url: '/api/users', expectedStatus: 201 },
      { method: 'PUT', url: '/api/users/1', expectedStatus: 200 },
      { method: 'DELETE', url: '/api/users/1', expectedStatus: 200 }
    ]
  },
  {
    description: 'Regular user should have limited access',
    token: 'user_jwt_token',
    tests: [
      { method: 'GET', url: '/api/users', expectedStatus: 403 },
      { method: 'GET', url: '/api/users/own-id', expectedStatus: 200 },
      { method: 'POST', url: '/api/users', expectedStatus: 403 }
    ]
  }
];
```

### Step 3: Handle Special Cases

For routes that don't exactly match the permission URL patterns:

```javascript
// If your route is: /api/users/profile/settings
// But permission URL is: /api/users/:id/settings
// You might need to normalize the URL in the middleware or create specific permissions

router.get('/profile/settings', authenticate, async (req, res, next) => {
  // Manual permission check
  const hasPermission = await hasPermission(req.user.id, 'USER_VIEW_SETTINGS');
  if (!hasPermission) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
}, userController.getSettings);
```

### Step 4: Error Handling

Add proper error handling in your controllers:

```javascript
const userController = {
  async getAll(req, res) {
    try {
      // req.user is available (added by authentication middleware)
      // req.permission is available (added by authenticateWithPermission)
      
      const users = await userService.getAll();
      
      res.json({
        success: true,
        data: users,
        permission: req.permission.permissionName // Optional: show which permission was used
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};
```

## Migration Checklist

- [ ] Update all route files to use new authentication middleware
- [ ] Test each endpoint with different user roles
- [ ] Verify permission data is correctly populated in database
- [ ] Update any hardcoded role checks in controllers
- [ ] Test error scenarios (invalid tokens, insufficient permissions)
- [ ] Update API documentation with new permission requirements
- [ ] Create role-specific test suites

## Troubleshooting

### Common Issues

1. **Permission not found error**
   - Check if the endpoint URL exactly matches the permission_url in database
   - Verify the URL pattern matching is working for dynamic routes

2. **User always gets 403**
   - Check if user's role has the required permission in role_permission table
   - Verify the permission and role are both active

3. **Token validation fails**
   - Ensure JWT_SECRET is correctly set in environment variables
   - Check token format in Authorization header (should be 'Bearer <token>')

### Debug Mode

Add this to your middleware for debugging:

```javascript
// Add at the beginning of authenticateWithPermission
console.log('Debug Info:', {
  method: req.method,
  originalUrl: req.originalUrl,
  baseUrl: req.baseUrl,
  path: req.path,
  route: req.route ? req.route.path : 'no route',
  userId: decoded.id
});
```

This implementation provides a robust, scalable permission system that can handle complex access control requirements while maintaining clean, readable code.