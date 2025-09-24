const express = require('express');
const router = express.Router();

const moduleController = require('../controllers/moduleController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId, validateModuleCreate, validateModuleUpdate } = require('../middleware/validationMiddleware');

// Stats and active
router.get('/stats/overview', authenticate, moduleController.stats);
router.get('/status/active', authenticate, moduleController.active);
router.get('/all', authenticate, moduleController.getAllModule);
router.get('/priority/:subMenuId?', authenticate, moduleController.byPriority);

// Search and relations
router.get('/search/:searchTerm', authenticate, validatePagination, moduleController.search);
router.get('/:id/topics', authenticate, validateId, validatePagination, moduleController.topics);
router.get('/:id/permissions', authenticate, validateId, moduleController.permissions);

// Order and clone
router.put('/:id/order', authenticate, validateId, moduleController.updateOrder);
router.post('/:id/clone', authenticate, validateId, moduleController.clone);

// Health check for modules
router.get('/health', (req, res) => {
  res.json({
    status: 'SUCCESS',
    message: 'Modules API is working',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint without auth
router.get('/test', moduleController.list);

// CRUD
router.get('/', authenticate, validatePagination, moduleController.list);
router.get('/:id', authenticate, validateId, moduleController.detail);
router.post('/', authenticate, validateModuleCreate, moduleController.create);
router.put('/:id', authenticate, validateId, validateModuleUpdate, moduleController.update);
router.delete('/:id', authenticate, validateId, moduleController.remove);

// Activation
router.post('/:id/activate', authenticate, validateId, moduleController.activate);
router.post('/:id/deactivate', authenticate, validateId, moduleController.deactivate);
router.patch('/:id/status', authenticate, validateId, moduleController.toggleStatus);

module.exports = router;