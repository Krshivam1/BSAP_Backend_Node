const express = require('express');
const router = express.Router();

const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

router.get('/test', (req, res) => {
  res.json({ message: 'Role routes are working!', timestamp: new Date() });
});

router.get('/active', authenticate, roleController.active);
router.get('/search/:searchTerm', authenticate, validatePagination, roleController.search);

router.post('/:id/activate', authenticate, validateId, roleController.activate);
router.post('/:id/deactivate', authenticate, validateId, roleController.deactivate);

router.get('/', authenticate, validatePagination, roleController.list);
router.get('/:id', authenticate, validateId, roleController.detail);
router.post('/', authenticate, roleController.create);
router.put('/:id', authenticate, validateId, roleController.update);
router.delete('/:id', authenticate, validateId, roleController.remove);

module.exports = router;