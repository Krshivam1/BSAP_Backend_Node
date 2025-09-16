const jwt = require('jsonwebtoken');
const { User, Role, Permission, RolePermission } = require('../models');
const { comparePassword, hashPassword } = require('../utils/helpers');
const otpUtility = require('../utils/otpUtility');
const smsUtil = require('../utils/smsUtil');
const logger = require('../utils/logger');

class AuthService {
  /**
   * User login
   * @param {Object} loginData - Login request data
   * @returns {Object} Login response with user data and token
   */
  async doLogin(loginData) {
    const { username, password } = loginData;

    // Validation
    if (!username || username.trim() === '') {
      throw new Error('Email is required');
    }
    if (!password || password.trim() === '') {
      throw new Error('Password is required');
    }

    // Find user by email/username
    const user = await User.findOne({
      where: { 
        email: username,
        active: true 
      },
      include: [{
        model: Role,
        as: 'role',
        where: { active: true }
      }]
    });

    if (!user) {
      throw new Error('Incorrect username or password!');
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Incorrect username or password!');
    }

    // Check if user is verified
    if (!user.verified) {
      throw new Error('Account Not Verified. Please check email for verification!');
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

    // Update user token
    const tokenValidity = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.update({
      token,
      tokenValidity
    });

    // Get user permissions
    const rolePermissions = await RolePermission.findAll({
      where: { 
        roleId: user.roleId,
        active: true 
      },
      include: [{
        model: Permission,
        as: 'permission'
      }]
    });

    const permissions = rolePermissions.map(rp => rp.permission?.permissionCode).filter(Boolean);

    // Prepare response
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNo: user.mobileNo,
      roleId: user.roleId,
      role: user.role,
      stateId: user.stateId,
      rangeId: user.rangeId,
      districtId: user.districtId,
      isFirst: user.isFirst,
      verified: user.verified,
      permissions
    };

    logger.info(`User ${user.email} logged in successfully`);

    return {
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  }

  /**
   * User registration
   * @param {Object} signUpData - Registration data
   * @returns {Object} Registration response
   */
  async doSignUp(signUpData) {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      mobileNo, 
      roleId, 
      stateId, 
      rangeId, 
      districtId 
    } = signUpData;

    // Validation
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!firstName || !firstName.trim()) {
      throw new Error('First name is required');
    }
    if (!lastName || !lastName.trim()) {
      throw new Error('Last name is required');
    }
    if (!mobileNo || !mobileNo.trim()) {
      throw new Error('Mobile number is required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate mobile number format
    if (!smsUtil.isValidMobileNumber(mobileNo)) {
      throw new Error('Please provide a valid mobile number');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP
    const otp = otpUtility.generateOTP();
    const otpValidity = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      mobileNo: smsUtil.formatMobileNumber(mobileNo),
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

    // Send OTP via SMS
    try {
      await smsUtil.sendOTPSMS(user.mobileNo, otp, 'Performance Statistics');
    } catch (smsError) {
      logger.error('SMS sending failed:', smsError);
      // Don't throw error, just log it
    }

    logger.info(`User ${email} registered successfully`);

    return {
      success: true,
      message: 'User registered successfully. Please verify with OTP sent to your mobile.',
      userId: user.id,
      email: user.email,
      otpSent: true
    };
  }

  /**
   * Forgot password
   * @param {string} email - User email
   * @returns {Object} Response
   */
  async doForgotPassword(email) {
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }

    const user = await User.findOne({ 
      where: { 
        email: email.trim(),
        active: true 
      } 
    });

    if (!user) {
      throw new Error('User with this email not found');
    }

    // Generate OTP for password reset
    const otp = otpUtility.generateOTP();
    const otpValidity = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    await user.update({
      otp,
      otpValidity
    });

    // Send OTP via SMS
    try {
      await smsUtil.sendPasswordResetSMS(user.mobileNo, otp);
    } catch (smsError) {
      logger.error('SMS sending failed:', smsError);
      // Don't throw error, just log it
    }

    logger.info(`Password reset OTP sent to user ${email}`);

    return {
      success: true,
      message: 'Password reset OTP sent to your registered mobile number.',
      email: user.email,
      otpSent: true
    };
  }

  /**
   * Verify OTP
   * @param {Object} otpData - OTP verification data
   * @returns {Object} Response
   */
  async verifyOTP(otpData) {
    const { email, otp } = otpData;

    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    const user = await User.findOne({ 
      where: { 
        email,
        active: true 
      } 
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    // Check OTP validity
    if (otpUtility.isOTPExpired(user.otpValidity)) {
      throw new Error('OTP has expired');
    }

    // Update user as verified
    await user.update({
      verified: true,
      otp: null,
      otpValidity: null
    });

    logger.info(`OTP verified for user ${email}`);

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  }

  /**
   * Reset password
   * @param {Object} resetData - Password reset data
   * @returns {Object} Response
   */
  async resetPassword(resetData) {
    const { email, otp, newPassword } = resetData;

    if (!email || !otp || !newPassword) {
      throw new Error('Email, OTP and new password are required');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    const user = await User.findOne({ 
      where: { 
        email,
        active: true 
      } 
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    // Check OTP validity
    if (otpUtility.isOTPExpired(user.otpValidity)) {
      throw new Error('OTP has expired');
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

    logger.info(`Password reset for user ${email}`);

    return {
      success: true,
      message: 'Password reset successfully'
    };
  }

  /**
   * Change password
   * @param {Object} changeData - Password change data
   * @returns {Object} Response
   */
  async changePassword(changeData) {
    const { userId, currentPassword, newPassword } = changeData;

    if (!userId || !currentPassword || !newPassword) {
      throw new Error('User ID, current password and new password are required');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    const user = await User.findByPk(userId);
    if (!user || !user.active) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await user.update({
      password: hashedPassword,
      isFirst: false
    });

    logger.info(`Password changed for user ${user.email}`);

    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  /**
   * Refresh token
   * @param {string} token - Current token
   * @returns {Object} New token response
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.id, {
        where: { active: true },
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token
      const newToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          roleId: user.roleId 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Update user token
      const tokenValidity = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.update({
        token: newToken,
        tokenValidity
      });

      return {
        success: true,
        message: 'Token refreshed successfully',
        token: newToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      };

    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();