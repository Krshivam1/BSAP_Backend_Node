const express = require('express');
const router = express.Router();

const subTopicController = require('../controllers/subTopicController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId, validateSubTopicCreate, validateSubTopicUpdate } = require('../middleware/validationMiddleware');

// Stats and active
router.get('/stats/overview', authenticate, subTopicController.stats);
router.get('/status/active', authenticate, subTopicController.active);
router.get('/active', authenticate, subTopicController.activeSubTopics);

// Search and relations
router.get('/search/:searchTerm', authenticate, validatePagination, subTopicController.search);
router.get('/by-topic/:topicId', authenticate, validatePagination, subTopicController.byTopic);
router.get('/topic/:topicId', authenticate, subTopicController.byTopicForForm);
router.get('/:id/questions', authenticate, validateId, validatePagination, subTopicController.questions);
router.get('/:id/performance-statistics', authenticate, validateId, validatePagination, subTopicController.performanceStatistics);

// Reorder and order update
router.put('/reorder', authenticate, subTopicController.reorder);
router.put('/:id/order', authenticate, validateId, subTopicController.updateOrder);

// Clone
router.post('/:id/clone', authenticate, validateId, subTopicController.clone);

// CRUD
router.get('/', authenticate, validatePagination, subTopicController.list);
router.get('/:id', authenticate, validateId, subTopicController.detail);
router.post('/', authenticate, validateSubTopicCreate, subTopicController.create);
router.put('/:id', authenticate, validateId, validateSubTopicUpdate, subTopicController.update);
router.delete('/:id', authenticate, validateId, subTopicController.remove);

// Activation
router.post('/:id/activate', authenticate, validateId, subTopicController.activate);
router.post('/:id/deactivate', authenticate, validateId, subTopicController.deactivate);

module.exports = router;