const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { formatResponse } = require('../utils/helpers');

const router = express.Router();

// Get all users with pagination and filtering
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.getUsers);

// Get user by ID
router.get('/:id', authenticate, userController.getUserById);

// Create new user
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('mobileNo').notEmpty().withMessage('Mobile number is required'),
  body('roleId').isInt().withMessage('Role ID must be an integer')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
  }
  return userController.createUser(req, res);
});

// Update user
router.put('/:id', authenticate, [
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
  }
  return userController.updateUser(req, res);
});

// Delete user (soft delete)
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.deleteUser);

// Change password
router.post('/:id/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
  }
  const { id } = req.params;
  if (req.user.id !== parseInt(id, 10)) {
    return res.status(403).json(formatResponse(false, 'Access denied'));
  }
  return authController.changePassword(req, res);
});

module.exports = router;