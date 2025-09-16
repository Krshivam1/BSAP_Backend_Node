const express = require('express');
const router = express.Router();
const { userService } = require('../services');
const authMiddleware = require('../middleware/authMiddleware');
const { validatePagination, validateUserCreate, validateUserUpdate } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users with pagination and filtering
 *     description: Retrieve a paginated list of users with optional filtering by state, district, range, role, and search terms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - name: stateId
 *         in: query
 *         description: Filter by state ID
 *         schema:
 *           type: integer
 *       - name: districtId
 *         in: query
 *         description: Filter by district ID
 *         schema:
 *           type: integer
 *       - name: rangeId
 *         in: query
 *         description: Filter by range ID
 *         schema:
 *           type: integer
 *       - name: roleId
 *         in: query
 *         description: Filter by role ID
 *         schema:
 *           type: integer
 *       - name: active
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *             examples:
 *               usersSuccess:
 *                 summary: Successful users list response
 *                 value:
 *                   success: true
 *                   message: "Users retrieved successfully"
 *                   data:
 *                     users:
 *                       - id: 1
 *                         username: "john.doe"
 *                         email: "john.doe@example.com"
 *                         firstName: "John"
 *                         lastName: "Doe"
 *                         isActive: true
 *                         role:
 *                           name: "ADMIN"
 *                         state:
 *                           name: "Karnataka"
 *                     pagination:
 *                       page: 1
 *                       limit: 10
 *                       total: 50
 *                       totalPages: 5
 *                       hasNext: true
 *                       hasPrev: false
 *                   timestamp: "2025-09-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route GET /api/users
 * @desc Get all users with pagination and filtering
 * @access Private
 */
router.get('/', authMiddleware, validatePagination, async (req, res) => {
  try {
    const { page, size, stateId, rangeId, districtId, roleId, search, active } = req.query;
    
    const filters = {
      page: parseInt(page) || 1,
      size: parseInt(size) || 20,
      stateId: stateId ? parseInt(stateId) : undefined,
      rangeId: rangeId ? parseInt(rangeId) : undefined,
      districtId: districtId ? parseInt(districtId) : undefined,
      roleId: roleId ? parseInt(roleId) : undefined,
      search,
      active: active !== undefined ? active === 'true' : true
    };

    const result = await userService.getAllUsers(filters);

    res.json({
      status: 'SUCCESS',
      message: 'Users retrieved successfully',
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });

  } catch (error) {
    logger.error('Error getting users:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
});

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(parseInt(id));

    res.json({
      status: 'SUCCESS',
      message: 'User retrieved successfully',
      data: user
    });

  } catch (error) {
    logger.error('Error getting user:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create new user
 *     description: Create a new user account (Admin/Manager access required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *           examples:
 *             createUserExample:
 *               summary: Example user creation request
 *               value:
 *                 username: "mike.johnson"
 *                 email: "mike.johnson@example.com"
 *                 password: "SecurePassword123!"
 *                 firstName: "Mike"
 *                 lastName: "Johnson"
 *                 mobile: "+91-9876543212"
 *                 designation: "Constable"
 *                 roleId: 3
 *                 stateId: 1
 *                 districtId: 2
 *                 rangeId: 3
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             examples:
 *               userCreated:
 *                 summary: Successful user creation response
 *                 value:
 *                   success: true
 *                   message: "User created successfully"
 *                   data:
 *                     user:
 *                       id: 3
 *                       username: "mike.johnson"
 *                       email: "mike.johnson@example.com"
 *                       firstName: "Mike"
 *                       lastName: "Johnson"
 *                       isActive: true
 *                       role:
 *                         name: "USER"
 *                   timestamp: "2025-09-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route POST /api/users
 * @desc Create new user
 * @access Private (Admin/Manager only)
 */
router.post('/', authMiddleware, validateUserCreate, async (req, res) => {
  try {
    const userData = req.body;
    const createdBy = req.user.id;

    const user = await userService.createUser(userData, createdBy);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'User created successfully',
      data: user
    });

  } catch (error) {
    logger.error('Error creating user:', error);
    const statusCode = error.message.includes('already exists') ? 409 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private (Admin/Manager only)
 */
router.put('/:id', authMiddleware, validateUserUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedBy = req.user.id;

    const user = await userService.updateUser(parseInt(id), updateData, updatedBy);

    res.json({
      status: 'SUCCESS',
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    logger.error('Error updating user:', error);
    const statusCode = error.message === 'User not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/users/:id
 * @desc Delete user (soft delete)
 * @access Private (Admin only)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user.id;

    const result = await userService.deleteUser(parseInt(id), deletedBy);

    res.json({
      status: 'SUCCESS',
      message: result.message
    });

  } catch (error) {
    logger.error('Error deleting user:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/users/:id/activate
 * @desc Activate user
 * @access Private (Admin/Manager only)
 */
router.post('/:id/activate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user.id;

    const result = await userService.toggleUserStatus(parseInt(id), true, updatedBy);

    res.json({
      status: 'SUCCESS',
      message: result.message
    });

  } catch (error) {
    logger.error('Error activating user:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/users/:id/deactivate
 * @desc Deactivate user
 * @access Private (Admin/Manager only)
 */
router.post('/:id/deactivate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user.id;

    const result = await userService.toggleUserStatus(parseInt(id), false, updatedBy);

    res.json({
      status: 'SUCCESS',
      message: result.message
    });

  } catch (error) {
    logger.error('Error deactivating user:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/users/:id/first-time-password
 * @desc Update password for first-time login
 * @access Private
 */
router.put('/:id/first-time-password', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const updatedBy = req.user.id;

    if (!newPassword) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'New password is required'
      });
    }

    const result = await userService.updateUser(
      parseInt(id), 
      { password: newPassword, isFirst: false }, 
      updatedBy
    );

    res.json({
      status: 'SUCCESS',
      message: 'Password updated successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error updating first-time password:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route GET /api/users/by-role/:roleId
 * @desc Get users by role
 * @access Private
 */
router.get('/by-role/:roleId', authMiddleware, async (req, res) => {
  try {
    const { roleId } = req.params;
    const users = await userService.getUsersByRole(parseInt(roleId));

    res.json({
      status: 'SUCCESS',
      message: 'Users retrieved successfully',
      data: users
    });

  } catch (error) {
    logger.error('Error getting users by role:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
});

/**
 * @route GET /api/users/by-location
 * @desc Get users by location
 * @access Private
 */
router.get('/by-location', authMiddleware, async (req, res) => {
  try {
    const { stateId, rangeId, districtId } = req.query;
    
    const location = {
      stateId: stateId ? parseInt(stateId) : undefined,
      rangeId: rangeId ? parseInt(rangeId) : undefined,
      districtId: districtId ? parseInt(districtId) : undefined
    };

    const users = await userService.getUsersByLocation(location);

    res.json({
      status: 'SUCCESS',
      message: 'Users retrieved successfully',
      data: users
    });

  } catch (error) {
    logger.error('Error getting users by location:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
});

/**
 * @route GET /api/users/search/:searchTerm
 * @desc Search users
 * @access Private
 */
router.get('/search/:searchTerm', authMiddleware, async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { roleId, stateId, rangeId, districtId } = req.query;

    const filters = {
      roleId: roleId ? parseInt(roleId) : undefined,
      stateId: stateId ? parseInt(stateId) : undefined,
      rangeId: rangeId ? parseInt(rangeId) : undefined,
      districtId: districtId ? parseInt(districtId) : undefined
    };

    const users = await userService.searchUsers(searchTerm, filters);

    res.json({
      status: 'SUCCESS',
      message: 'Search completed successfully',
      data: users
    });

  } catch (error) {
    logger.error('Error searching users:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Search failed',
      error: error.message
    });
  }
});

/**
 * @route GET /api/users/statistics
 * @desc Get user statistics
 * @access Private (Admin/Manager only)
 */
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const statistics = await userService.getUserStatistics();

    res.json({
      status: 'SUCCESS',
      message: 'Statistics retrieved successfully',
      data: statistics
    });

  } catch (error) {
    logger.error('Error getting user statistics:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
});

/**
 * @route POST /api/users/bulk-operation
 * @desc Bulk operations on users
 * @access Private (Admin only)
 */
router.post('/bulk-operation', authMiddleware, async (req, res) => {
  try {
    const { userIds, operation } = req.body;
    const performedBy = req.user.id;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'User IDs array is required'
      });
    }

    if (!['activate', 'deactivate', 'delete'].includes(operation)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid operation'
      });
    }

    const result = await userService.bulkUserOperation(userIds, operation, performedBy);

    res.json({
      status: 'SUCCESS',
      message: result.message,
      data: { affectedCount: result.affectedCount }
    });

  } catch (error) {
    logger.error('Error performing bulk operation:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Bulk operation failed',
      error: error.message
    });
  }
});

module.exports = router;