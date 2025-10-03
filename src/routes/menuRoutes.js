const express = require('express');
const router = express.Router();

const menuController = require('../controllers/menuController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');



// Order matters: define specific/static routes before dynamic ':id'

// Test route to check if menu routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Menu routes are working!', timestamp: new Date() });
});

// Statistics and structure
// router.get('/stats/overview', authenticate, menuController.stats);                    // COMMENTED OUT: requires associations
// router.get('/structure/hierarchy', authenticate, menuController.hierarchy);          // COMMENTED OUT: requires associations
// router.get('/level/root', authenticate, menuController.root);                        // COMMENTED OUT: requires associations
router.get('/status/active', authenticate, menuController.active);

// User/role based
router.get('/user', authenticate, menuController.userMenusSelf);
router.get('/user/:userId', authenticate, menuController.userMenus);
// router.get('/role/:roleId', authenticate, menuController.roleMenus);                 // COMMENTED OUT: requires associations

// Search and children
router.get('/search/:searchTerm', authenticate, validatePagination, menuController.search);
router.get('/parent/:parentId', authenticate, validatePagination, menuController.children);

// Sidebar and breadcrumb
// router.get('/sidebar/:userId', authenticate, menuController.sidebar);                // COMMENTED OUT: requires associations
// router.get('/breadcrumb/:menuId', authenticate, menuController.breadcrumb);          // COMMENTED OUT: requires associations

// Reorder and order update
// router.put('/reorder', authenticate, menuController.reorder);                        // COMMENTED OUT: requires associations
router.put('/:id/order', authenticate, validateId, menuController.updateOrder);

// Permissions
// router.post('/:id/permissions', authenticate, validateId, menuController.assignPermissions);     // COMMENTED OUT: requires associations
// Do not use validateId here (two params); controller will validate both
// router.delete('/:id/permissions/:roleId', authenticate, menuController.removePermission);        // COMMENTED OUT: requires associations

// CRUD
router.get('/', authenticate, validatePagination, menuController.list);
router.get('/:id', authenticate, validateId, menuController.detail);
router.post('/', authenticate, menuController.create);
router.put('/:id', authenticate, validateId, menuController.update);
router.delete('/:id', authenticate, validateId, menuController.remove);

// Activation
router.post('/:id/activate', authenticate, validateId, menuController.activate);
router.post('/:id/deactivate', authenticate, validateId, menuController.deactivate);

module.exports = router; 