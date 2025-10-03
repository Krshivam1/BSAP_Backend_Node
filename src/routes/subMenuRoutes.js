const express = require('express');
const router = express.Router();

const subMenuController = require('../controllers/subMenuController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'SubMenu routes are working!', timestamp: new Date() });
});

// Special queries
router.get('/active', authenticate, subMenuController.active);
router.get('/search/:searchTerm', authenticate, validatePagination, subMenuController.search);
router.get('/by-menu/:menuId', authenticate, validatePagination, subMenuController.byMenu);
router.get('/by-parent/:parentId', authenticate, validatePagination, subMenuController.byParent);

// Order operations
router.put('/:id/order', authenticate, validateId, subMenuController.updateOrder);

// Status operations
router.post('/:id/activate', authenticate, validateId, subMenuController.activate);
router.post('/:id/deactivate', authenticate, validateId, subMenuController.deactivate);

// Basic CRUD operations
router.get('/', authenticate, validatePagination, subMenuController.list);
router.get('/:id', authenticate, validateId, subMenuController.detail);
router.post('/', authenticate, subMenuController.create);
router.put('/:id', authenticate, validateId, subMenuController.update);
router.delete('/:id', authenticate, validateId, subMenuController.remove);

module.exports = router;