const express = require('express');
const router = express.Router();

const stateController = require('../controllers/stateController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

// router.get('/test', (req, res) => {
//   res.json({ message: 'State routes are working!', timestamp: new Date() });
// });

router.get('/', authenticate, validatePagination, stateController.search);
router.get('/active', authenticate, stateController.active);

router.post('/:id/activate', authenticate, validateId, stateController.activate);
router.post('/:id/deactivate', authenticate, validateId, stateController.deactivate);
router.post('/:id/toggle-status', authenticate, validateId, stateController.toggleStatus);

router.get('/:id', authenticate, validateId, stateController.detail);
router.post('/', authenticate, stateController.create);
router.put('/:id', authenticate, validateId, stateController.update);
router.delete('/:id', authenticate, validateId, stateController.remove);

module.exports = router;