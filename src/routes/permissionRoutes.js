const express = require('express');
const router = express.Router();

const permissionController = require('../controllers/permissionController');
const { authenticate , authenticateWithPermission } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

router.get('/test', (req, res) => {
  res.json({ message: 'Permission routes are working!', timestamp: new Date() });
});

router.get('/', authenticateWithPermission, validatePagination, permissionController.search);
router.get('/active', authenticate, permissionController.active);
router.get('/by-code/:code', authenticate, permissionController.byCode);

router.post('/:id/activate', authenticate, validateId, permissionController.activate);
router.post('/:id/deactivate', authenticate, validateId, permissionController.deactivate);
router.post('/:id/toggle-status', authenticate, validateId, permissionController.toggleStatus);

router.get('/:id', authenticate, validateId, permissionController.detail);
router.post('/', authenticate, permissionController.create);
router.put('/:id', authenticate, validateId, permissionController.update);
router.delete('/:id', authenticate, validateId, permissionController.remove);

module.exports = router;