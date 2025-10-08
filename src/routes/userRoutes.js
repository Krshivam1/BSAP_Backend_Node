const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticateWithPermission } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

// Test route (no authentication needed)
router.get('/test', (req, res) => {
  res.json({ message: 'User routes are working!', timestamp: new Date() });
});

// Protected routes with automatic permission checking based on URL
router.get('/', authenticateWithPermission, validatePagination, userController.search);
router.get('/active', authenticateWithPermission, userController.active);
router.get('/self', authenticateWithPermission, userController.detail);
router.post('/', authenticateWithPermission, userController.create);
router.put('/:id', authenticateWithPermission, validateId, userController.update);
router.delete('/:id', authenticateWithPermission, validateId, userController.remove);
router.post('/:id/toggle-status', authenticateWithPermission, validateId, userController.toggleStatus);
router.post('/:id/verify', authenticateWithPermission, validateId, userController.verify);
router.post('/:id/change-password', authenticateWithPermission, validateId, userController.changePassword);

module.exports = router;