const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, authenticateWithPermission, checkPermission } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

// Method 1: Using authenticateWithPermission (automatically checks permissions based on URL)
router.get('/', authenticateWithPermission, validatePagination, userController.search);
router.get('/active', authenticateWithPermission, userController.active);
router.get('/:id', authenticateWithPermission, validateId, userController.detail);
router.post('/', authenticateWithPermission, userController.create);
router.put('/:id', authenticateWithPermission, validateId, userController.update);
router.delete('/:id', authenticateWithPermission, validateId, userController.remove);

// Method 2: Using authenticate + checkPermission (check specific permission codes)
router.post('/:id/toggle-status', authenticate, checkPermission('USER_TOGGLE_STATUS'), validateId, userController.toggleStatus);
router.post('/:id/verify', authenticate, checkPermission('USER_VERIFY'), validateId, userController.verify);
router.post('/:id/change-password', authenticate, checkPermission('USER_CHANGE_PASSWORD'), validateId, userController.changePassword);

// Method 3: Manual permission checking in controller (for complex logic)
// In controller, you can use: const canEdit = await hasPermission(req.user.id, 'USER_UPDATE');

module.exports = router;