const express = require('express');
const router = express.Router();

const topicController = require('../controllers/topicController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId, validateTopicCreate, validateTopicUpdate, validateReorder } = require('../middleware/validationMiddleware');

// Stats and active
router.get('/stats/overview', authenticate, topicController.stats);
router.get('/status/active', authenticate, topicController.active);

// Search and module relations
router.get('/search/:searchTerm', authenticate, validatePagination, topicController.search);
router.get('/by-module/:moduleId', authenticate, validatePagination, topicController.byModule);
router.get('/module/:moduleId', authenticate, topicController.byModuleForForm);
router.get('/:id/sub-topics', authenticate, validateId, validatePagination, topicController.subTopics);
router.get('/:id/form-config', authenticate, validateId, topicController.formConfig);

// Reorder and order update
router.put('/reorder', authenticate, validateReorder, topicController.reorder);
router.put('/:id/order', authenticate, validateId, topicController.updateOrder);

// Clone
router.post('/:id/clone', authenticate, validateId, topicController.clone);

// CRUD
router.get('/', authenticate, validatePagination, topicController.list);
router.get('/:id', authenticate, validateId, topicController.detail);
router.post('/', authenticate, validateTopicCreate, topicController.create);
router.put('/:id', authenticate, validateId, validateTopicUpdate, topicController.update);
router.delete('/:id', authenticate, validateId, topicController.remove);

// Activation
router.post('/:id/activate', authenticate, validateId, topicController.activate);
router.post('/:id/deactivate', authenticate, validateId, topicController.deactivate);

module.exports = router;