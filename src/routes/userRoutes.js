const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateId } = require('../middleware/validationMiddleware');

router.get('/test', (req, res) => {
  res.json({ message: 'User routes are working!', timestamp: new Date() });
});

router.get('/', authenticate, validatePagination, userController.search);
router.get('/active', authenticate, userController.active);

router.post('/:id/toggle-status', authenticate, validateId, userController.toggleStatus);
router.post('/:id/verify', authenticate, validateId, userController.verify);
router.post('/:id/change-password', authenticate, validateId, userController.changePassword);

router.get('/:id', authenticate, validateId, userController.detail);
router.post('/', authenticate, userController.create);
router.put('/:id', authenticate, validateId, userController.update);
router.delete('/:id', authenticate, validateId, userController.remove);

module.exports = router;