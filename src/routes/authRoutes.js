const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');
const { formatResponse } = require('../utils/helpers');

const router = express.Router();

// Login validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Sign up validation rules
const signUpValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('mobileNo').notEmpty().withMessage('Mobile number is required')
];

// Forgot password validation rules
const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email')
];

// Login endpoint
router.post('/login', loginValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
  }
  return authController.login(req, res);
});

// Sign up endpoint
router.post('/signup', signUpValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
  }
  return authController.signup(req, res);
});

// Forgot password endpoint
router.post('/forgotPassword', forgotPasswordValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
  }
  return authController.forgotPassword(req, res);
});

// Verify OTP endpoint
router.post('/verifyOtp', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
  }
  return authController.verifyOtp(req, res);
});

// Reset password endpoint
router.post('/resetPassword', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
  }
  return authController.resetPassword(req, res);
});

// Authenticated endpoints
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticate, authController.me);
router.post('/verify-email', authController.verifyEmail);

module.exports = router;