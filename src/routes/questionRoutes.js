const express = require('express');
const {
	list,
	detail,
	create,
	update,
	remove,
	byTopic,
	bySubTopic,
	byType,
	search,
	active,
	activate,
	deactivate,
	updateOrder,
	types,
	stats,
	clone,
	reorder,
	bulkCreate,
	performanceStatistics,
	updateMetadata,
	withFormulas,
	forFormula,
	forForm,
	validateFormula
} = require('../controllers/questionController');
const { authenticate } = require('../middleware/auth');
const {
	validatePagination,
	validateId,
	validateQuestionCreate,
	validateQuestionUpdate,
	validateReorder
} = require('../middleware/validationMiddleware');

const router = express.Router();

// Static/specific routes first
router.get('/config/types', authenticate, types);
router.get('/stats/overview', authenticate, stats);
router.post('/validate-formula', authenticate, validateFormula);

// Topic-specific routes
router.get('/topic/:topicId/formulas', authenticate, withFormulas);
router.get('/topic/:topicId/for-formula', authenticate, forFormula);
router.get('/topic/:topicId/form', authenticate, forForm);

// Collections
router.get('/', authenticate, validatePagination, list);
router.post('/', authenticate, validateQuestionCreate, create);
router.post('/bulk-create', authenticate, bulkCreate);
router.put('/reorder', authenticate, validateReorder, reorder);

// Search and filters
router.get('/search/:searchTerm', authenticate, validatePagination, search);
router.get('/by-topic/:topicId', authenticate, byTopic);
router.get('/by-sub-topic/:subTopicId', authenticate, validatePagination, bySubTopic);
router.get('/by-type/:type', authenticate, validatePagination, byType);
router.get('/status/active', authenticate, active);

// Item-specific
router.get('/:id', authenticate, validateId, detail);
router.put('/:id', authenticate, validateId, validateQuestionUpdate, update);
router.delete('/:id', authenticate, validateId, remove);
router.post('/:id/activate', authenticate, validateId, activate);
router.post('/:id/deactivate', authenticate, validateId, deactivate);
router.put('/:id/order', authenticate, validateId, updateOrder);
router.post('/:id/clone', authenticate, validateId, clone);
router.get('/:id/performance-statistics', authenticate, validateId, validatePagination, performanceStatistics);
router.put('/:id/metadata', authenticate, validateId, updateMetadata);

module.exports = router;