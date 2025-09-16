const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Role } = require('../models');
const { hashPassword, comparePassword, generateOTP, formatResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

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
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
    }

    const { email, password } = req.body;

    // Find user with role
    const user = await User.findOne({
      where: { email, active: true },
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    if (!user) {
      return res.status(401).json(formatResponse(false, 'Invalid email or password'));
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(formatResponse(false, 'Invalid email or password'));
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        roleId: user.roleId 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Update user token and validity
    await user.update({
      token,
      tokenValidity: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    // Remove password from response
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNo: user.mobileNo,
      roleId: user.roleId,
      role: user.role,
      isFirst: user.isFirst,
      verified: user.verified
    };

    res.json(formatResponse(true, 'Login successful', {
      user: userResponse,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }));

    logger.info(`User ${email} logged in successfully`);
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

// Sign up endpoint
router.post('/signup', signUpValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
    }

    const { email, password, firstName, lastName, mobileNo, roleId, stateId, rangeId, districtId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json(formatResponse(false, 'User with this email already exists'));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP for verification
    const otp = generateOTP();
    const otpValidity = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      mobileNo,
      roleId,
      stateId,
      rangeId,
      districtId,
      otp,
      otpValidity,
      verified: false,
      isFirst: true,
      active: true
    });

    // TODO: Send OTP via SMS/Email
    logger.info(`OTP for user ${email}: ${otp}`);

    res.status(201).json(formatResponse(true, 'User registered successfully. Please verify with OTP sent to your mobile.', {
      userId: user.id,
      email: user.email,
      otpSent: true
    }));

    logger.info(`User ${email} registered successfully`);
  } catch (error) {
    logger.error('Sign up error:', error);
    next(error);
  }
});

// Forgot password endpoint
router.post('/forgotPassword', forgotPasswordValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email, active: true } });
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User with this email not found'));
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpValidity = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user with OTP
    await user.update({
      otp,
      otpValidity
    });

    // TODO: Send OTP via SMS/Email
    logger.info(`Password reset OTP for user ${email}: ${otp}`);

    res.json(formatResponse(true, 'Password reset OTP sent to your registered mobile number.', {
      email: user.email,
      otpSent: true
    }));

    logger.info(`Password reset OTP sent to user ${email}`);
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
});

// Verify OTP endpoint
router.post('/verifyOtp', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email, active: true } });
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    if (user.otp !== otp) {
      return res.status(400).json(formatResponse(false, 'Invalid OTP'));
    }

    // Check OTP validity (10 minutes)
    const now = new Date();
    const otpValidityTime = new Date(user.otpValidity);
    const diffInMinutes = (now - otpValidityTime) / (1000 * 60);

    if (diffInMinutes > 10) {
      return res.status(400).json(formatResponse(false, 'OTP has expired'));
    }

    // Update user as verified
    await user.update({
      verified: true,
      otp: null,
      otpValidity: null
    });

    res.json(formatResponse(true, 'OTP verified successfully'));

    logger.info(`OTP verified for user ${email}`);
  } catch (error) {
    logger.error('OTP verification error:', error);
    next(error);
  }
});

// Reset password endpoint
router.post('/resetPassword', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
    }

    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email, active: true } });
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    if (user.otp !== otp) {
      return res.status(400).json(formatResponse(false, 'Invalid OTP'));
    }

    // Check OTP validity
    const now = new Date();
    const otpValidityTime = new Date(user.otpValidity);
    const diffInMinutes = (now - otpValidityTime) / (1000 * 60);

    if (diffInMinutes > 10) {
      return res.status(400).json(formatResponse(false, 'OTP has expired'));
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await user.update({
      password: hashedPassword,
      otp: null,
      otpValidity: null,
      isFirst: false
    });

    res.json(formatResponse(true, 'Password reset successfully'));

    logger.info(`Password reset for user ${email}`);
  } catch (error) {
    logger.error('Password reset error:', error);
    next(error);
  }
});

module.exports = router;