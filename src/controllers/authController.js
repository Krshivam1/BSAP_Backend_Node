const { authService } = require('../services');
const logger = require('../utils/logger');

// Controller handlers: handle req/res and delegate to services

async function login(req, res) {
  try {
    const result = await authService.doLogin(req.body);

    // Set HTTP-only cookie for token
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Optional userId cookie
    res.cookie('userId', result.user.id, { maxAge: 24 * 60 * 60 * 1000 });

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
    const statusCode = /invalid|incorrect/i.test(error.message) ? 401 : 400;
    res.status(statusCode).json({ status: 'ERROR', message: error.message });
  }
}

async function signup(req, res) {
  try {
    const result = await authService.doSignUp(req.body);
    res.status(201).json({
      status: 'SUCCESS',
      message: 'User registered successfully. Please verify with OTP sent to your mobile.',
      data: {
        userId: result.userId,
        email: result.email,
        otpSent: result.otpSent
      }
    });
  } catch (error) {
    logger.error('Signup error:', error);
    const statusCode = /already exists/i.test(error.message) ? 409 : 400;
    res.status(statusCode).json({ status: 'ERROR', message: error.message });
  }
}

async function logout(req, res) {
  try {
    // Clear auth cookies (if any). Optionally we could also invalidate token server-side.
    res.clearCookie('token');
    res.clearCookie('userId');
    res.json({ status: 'SUCCESS', message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Logout failed', error: error.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'ERROR', message: 'Email is required' });
    }
    const result = await authService.doForgotPassword(email);
    res.json({
      status: 'SUCCESS',
      message: 'Password reset OTP sent to your registered mobile number.',
      data: { otpSent: result.otpSent, email: result.email }
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    const statusCode = /not found/i.test(error.message) ? 404 : 500;
    res.status(statusCode).json({ status: 'ERROR', message: error.message });
  }
}

async function verifyOtp(req, res) {
  try {
    await authService.verifyOTP(req.body);
    res.json({ status: 'SUCCESS', message: 'OTP verified successfully', data: { verified: true } });
  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(400).json({ status: 'ERROR', message: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    await authService.resetPassword(req.body);
    res.json({ status: 'SUCCESS', message: 'Password reset successfully', data: { passwordReset: true } });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(400).json({ status: 'ERROR', message: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'ERROR', message: 'Current password and new password are required' });
    }
    await authService.changePassword({ userId, currentPassword, newPassword });
    res.json({ status: 'SUCCESS', message: 'Password changed successfully', data: { passwordChanged: true } });
  } catch (error) {
    logger.error('Change password error:', error);
    const statusCode = /current password is incorrect/i.test(error.message) ? 401 : 400;
    res.status(statusCode).json({ status: 'ERROR', message: error.message });
  }
}

async function refreshToken(req, res) {
  try {
    // Expect Bearer token in Authorization header
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null;
    if (!token) {
      return res.status(400).json({ status: 'ERROR', message: 'Authorization token is required' });
    }

    const result = await authService.refreshToken(token);
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.json({ status: 'SUCCESS', message: 'Token refreshed successfully', data: { token: result.token } });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ status: 'ERROR', message: 'Token refresh failed', error: error.message });
  }
}

async function me(req, res) {
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
    res.status(500).json({ status: 'ERROR', message: 'Failed to retrieve user profile', error: error.message });
  }
}

async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ status: 'ERROR', message: 'Email and OTP are required' });
    }
    await authService.verifyOTP({ email, otp });
    res.json({ status: 'SUCCESS', message: 'Email verified successfully', data: { verified: true } });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(400).json({ status: 'ERROR', message: error.message });
  }
}

module.exports = {
  login,
  signup,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  refreshToken,
  me,
  verifyEmail
};
