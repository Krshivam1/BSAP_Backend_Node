const express = require('express');
const router = express.Router();

const stateController = require('../controllers/stateController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

// Stats and active
router.get('/stats/overview', authenticate, stateController.stats);
router.get('/status/active', authenticate, stateController.active);

// Search and child resources
router.get('/search/:searchTerm', authenticate, validatePagination, stateController.search);
router.get('/:id/districts', authenticate, validateId, validatePagination, stateController.districts);

// CRUD
router.get('/', authenticate, validatePagination, stateController.list);
router.get('/:id', authenticate, validateId, stateController.detail);
router.post('/', authenticate, stateController.create);
router.put('/:id', authenticate, validateId, stateController.update);
router.delete('/:id', authenticate, validateId, stateController.remove);

// Activation
router.post('/:id/activate', authenticate, validateId, stateController.activate);
router.post('/:id/deactivate', authenticate, validateId, stateController.deactivate);

module.exports = router;