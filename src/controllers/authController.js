const express = require('express');
const router = express.Router();
const { authService } = require('../services');
const authMiddleware = require('../middleware/authMiddleware');
const { validateLogin, validateSignup, validatePasswordReset, validateOTP } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user with email/username and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             loginExample:
 *               summary: Example login request
 *               value:
 *                 username: "john.doe"
 *                 password: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponse'
 *             examples:
 *               loginSuccess:
 *                 summary: Successful login response
 *                 value:
 *                   success: true
 *                   message: "Login successful"
 *                   data:
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       id: 1
 *                       username: "john.doe"
 *                       email: "john.doe@example.com"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                     expiresIn: 3600
 *                   timestamp: "2025-09-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid credentials error
 *                 value:
 *                   success: false
 *                   message: "Invalid credentials"
 *                   error:
 *                     code: "INVALID_CREDENTIALS"
 *                   timestamp: "2025-09-15T10:30:00.000Z"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set HTTP-only cookie for token
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Set user ID cookie (if needed for compatibility)
    res.cookie('userId', result.user.id, {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      status: 'SUCCESS',
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
        isFirstLogin: result.user.isFirst
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    const statusCode = error.message === 'Invalid credentials' ? 401 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: User registration
 *     description: Register a new user account (may require admin privileges depending on configuration)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *           examples:
 *             signupExample:
 *               summary: Example signup request
 *               value:
 *                 username: "jane.smith"
 *                 email: "jane.smith@example.com"
 *                 password: "SecurePassword123!"
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 mobile: "+91-9876543211"
 *                 designation: "Sub Inspector"
 *                 roleId: 2
 *                 stateId: 1
 *                 districtId: 1
 *                 rangeId: 1
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         verificationSent:
 *                           type: boolean
 *                           example: true
 *             examples:
 *               signupSuccess:
 *                 summary: Successful registration response
 *                 value:
 *                   success: true
 *                   message: "User registered successfully. Please verify your email."
 *                   data:
 *                     user:
 *                       id: 2
 *                       username: "jane.smith"
 *                       email: "jane.smith@example.com"
 *                       firstName: "Jane"
 *                       lastName: "Smith"
 *                       isActive: false
 *                     verificationSent: true
 *                   timestamp: "2025-09-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               userExists:
 *                 summary: User already exists error
 *                 value:
 *                   success: false
 *                   message: "User with this email already exists"
 *                   error:
 *                     code: "USER_EXISTS"
 *                   timestamp: "2025-09-15T10:30:00.000Z"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route POST /api/auth/signup
 * @desc User registration
 * @access Public (or Admin only - depending on requirements)
 */
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const userData = req.body;
    const result = await authService.signup(userData);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: result.user,
        verificationSent: true
      }
    });

  } catch (error) {
    logger.error('Signup error:', error);
    const statusCode = error.message.includes('already exists') ? 409 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Logout user and invalidate their authentication token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               logoutSuccess:
 *                 summary: Successful logout response
 *                 value:
 *                   success: true
 *                   message: "Logout successful"
 *                   data: null
 *                   timestamp: "2025-09-15T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route POST /api/auth/logout
 * @desc User logout
 * @access Private
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await authService.logout(userId);

    // Clear cookies
    res.clearCookie('token');
    res.clearCookie('userId');

    res.json({
      status: 'SUCCESS',
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Logout failed',
      error: error.message
    });
  }
});

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email is required'
      });
    }

    const result = await authService.forgotPassword(email);

    res.json({
      status: 'SUCCESS',
      message: 'Password reset OTP sent to your email',
      data: {
        otpSent: true,
        email: email
      }
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/auth/verify-otp
 * @desc Verify OTP for password reset
 * @access Public
 */
router.post('/verify-otp', validateOTP, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyPasswordResetOTP(email, otp);

    res.json({
      status: 'SUCCESS',
      message: 'OTP verified successfully',
      data: {
        verified: true,
        resetToken: result.resetToken
      }
    });

  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(400).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with OTP
 * @access Public
 */
router.post('/reset-password', validatePasswordReset, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);

    res.json({
      status: 'SUCCESS',
      message: 'Password reset successful',
      data: {
        passwordReset: true
      }
    });

  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(400).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change password for logged-in user
 * @access Private
 */
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Current password and new password are required'
      });
    }

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    res.json({
      status: 'SUCCESS',
      message: 'Password changed successfully',
      data: {
        passwordChanged: true
      }
    });

  } catch (error) {
    logger.error('Change password error:', error);
    const statusCode = error.message === 'Invalid current password' ? 401 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh JWT token
 * @access Private
 */
router.post('/refresh-token', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await authService.refreshToken(userId);

    // Update cookie with new token
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      status: 'SUCCESS',
      message: 'Token refreshed successfully',
      data: {
        token: result.token,
        user: result.user
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      status: 'ERROR',
      message: 'Token refresh failed',
      error: error.message
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      status: 'SUCCESS',
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          mobileNo: user.mobileNo,
          verified: user.verified,
          isFirst: user.isFirst,
          active: user.active,
          role: user.role,
          state: user.state,
          range: user.range,
          district: user.district
        }
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve user profile',
      error: error.message
    });
  }
});

/**
 * @route POST /api/auth/verify-email
 * @desc Verify email address
 * @access Public
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email and OTP are required'
      });
    }

    const result = await authService.verifyEmail(email, otp);

    res.json({
      status: 'SUCCESS',
      message: 'Email verified successfully',
      data: {
        verified: true,
        user: result.user
      }
    });

  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(400).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend email verification OTP
 * @access Public
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email is required'
      });
    }

    const result = await authService.resendVerificationOTP(email);

    res.json({
      status: 'SUCCESS',
      message: 'Verification OTP sent successfully',
      data: {
        otpSent: true,
        email: email
      }
    });

  } catch (error) {
    logger.error('Resend verification error:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/auth/check-session
 * @desc Check if user session is valid
 * @access Private
 */
router.post('/check-session', authMiddleware, async (req, res) => {
  try {
    res.json({
      status: 'SUCCESS',
      message: 'Session is valid',
      data: {
        valid: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    logger.error('Session check error:', error);
    res.status(401).json({
      status: 'ERROR',
      message: 'Invalid session'
    });
  }
});

/**
 * @route GET /api/auth/user-permissions
 * @desc Get user permissions and role information
 * @access Private
 */
router.get('/user-permissions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const permissions = await authService.getUserPermissions(userId);

    res.json({
      status: 'SUCCESS',
      message: 'User permissions retrieved successfully',
      data: permissions
    });

  } catch (error) {
    logger.error('Get permissions error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve user permissions',
      error: error.message
    });
  }
});

module.exports = router;