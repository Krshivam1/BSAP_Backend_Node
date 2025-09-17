const express = require('express');
const router = express.Router();

const rangeController = require('../controllers/rangeController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId, validateRangeCreate, validateRangeUpdate } = require('../middleware/validationMiddleware');

// Stats and active
router.get('/stats/overview', authenticate, rangeController.stats);
router.get('/status/active', authenticate, rangeController.active);

// Search and relations
router.get('/search/:searchTerm', authenticate, validatePagination, rangeController.search);
router.get('/by-district/:districtId', authenticate, validatePagination, rangeController.byDistrict);
router.get('/by-state/:stateId', authenticate, validatePagination, rangeController.byState);
router.get('/:id/police-stations', authenticate, validateId, validatePagination, rangeController.policeStations);
router.get('/:id/users', authenticate, validateId, validatePagination, rangeController.users);

// CRUD
router.get('/', authenticate, validatePagination, rangeController.list);
router.get('/:id', authenticate, validateId, rangeController.detail);
router.post('/', authenticate, validateRangeCreate, rangeController.create);
router.put('/:id', authenticate, validateId, validateRangeUpdate, rangeController.update);
router.delete('/:id', authenticate, validateId, rangeController.remove);

// Activation
router.post('/:id/activate', authenticate, validateId, rangeController.activate);
router.post('/:id/deactivate', authenticate, validateId, rangeController.deactivate);

module.exports = router;