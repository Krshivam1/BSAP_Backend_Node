const express = require('express');
const router = express.Router();

const battalionController = require('../controllers/battalionController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Battalion routes are working!', timestamp: new Date() });
});

// GET /api/battalions - Get all battalions with filtering and pagination
router.get('/', authenticate, validatePagination, battalionController.getAllBattalions);

// GET /api/battalions/by-range/:rangeId - Get battalions by range
router.get('/by-range/:rangeId', authenticate, battalionController.getBattalionsByRange);

// GET /api/battalions/by-district/:districtId - Get battalions by district  
router.get('/by-district/:districtId', authenticate, battalionController.getBattalionsByDistrict);

// GET /api/battalions/active - Get active battalions
router.get('/active', authenticate, battalionController.getActiveBattalions);

// GET /api/battalions/:id - Get battalion by ID
router.get('/:id', authenticate, validateId, battalionController.getBattalionById);

// POST /api/battalions - Create new battalion
router.post('/', authenticate, battalionController.createBattalion);

// PUT /api/battalions/:id - Update battalion
router.put('/:id', authenticate, validateId, battalionController.updateBattalion);

// PATCH /api/battalions/:id/toggle-status - Toggle battalion status
router.patch('/:id/toggle-status', authenticate, validateId, battalionController.toggleBattalionStatus);

// DELETE /api/battalions/:id - Delete battalion (soft delete)
router.delete('/:id', authenticate, validateId, battalionController.deleteBattalion);


module.exports = router;