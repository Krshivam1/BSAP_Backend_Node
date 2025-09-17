const express = require('express');
const router = express.Router();

const districtController = require('../controllers/districtController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

// Stats and active
router.get('/stats/overview', authenticate, districtController.stats);
router.get('/status/active', authenticate, districtController.active);

// Search and relations
router.get('/search/:searchTerm', authenticate, validatePagination, districtController.search);
router.get('/by-state/:stateId', authenticate, validatePagination, districtController.byState);
router.get('/:id/police-stations', authenticate, validateId, validatePagination, districtController.policeStations);
router.get('/:id/sub-divisions', authenticate, validateId, validatePagination, districtController.subDivisions);

// CRUD
router.get('/', authenticate, validatePagination, districtController.list);
router.get('/:id', authenticate, validateId, districtController.detail);
router.post('/', authenticate, districtController.create);
router.put('/:id', authenticate, validateId, districtController.update);
router.delete('/:id', authenticate, validateId, districtController.remove);

// Activation
router.post('/:id/activate', authenticate, validateId, districtController.activate);
router.post('/:id/deactivate', authenticate, validateId, districtController.deactivate);

module.exports = router;