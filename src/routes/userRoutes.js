const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { User, Role, State, Range, District } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { formatResponse, getPagination, getPagingData, hashPassword } = require('../utils/helpers');
const logger = require('../utils/logger');

const router = express.Router();

// Get all users with pagination and filtering
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { page, size, stateId, rangeId, districtId, roleId, search } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereCondition = { active: true };
    
    if (stateId) whereCondition.stateId = stateId;
    if (rangeId) whereCondition.rangeId = rangeId;
    if (districtId) whereCondition.districtId = districtId;
    if (roleId) whereCondition.roleId = roleId;

    // Add search functionality
    if (search) {
      const { Op } = require('sequelize');
      whereCondition[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobileNo: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereCondition,
      include: [
        { model: Role, as: 'role' },
        { model: State, as: 'state' },
        { model: Range, as: 'range' },
        { model: District, as: 'district' }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'token', 'otp'] }
    });

    const response = getPagingData(users, page, limit);
    res.json(formatResponse(true, 'Users retrieved successfully', response));
  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      include: [
        { model: Role, as: 'role' },
        { model: State, as: 'state' },
        { model: Range, as: 'range' },
        { model: District, as: 'district' }
      ],
      attributes: { exclude: ['password', 'token', 'otp'] }
    });

    if (!user || !user.active) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    // Check if user can access this profile
    if (req.user.id !== parseInt(id) && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role.roleName)) {
      return res.status(403).json(formatResponse(false, 'Access denied'));
    }

    res.json(formatResponse(true, 'User retrieved successfully', user));
  } catch (error) {
    logger.error('Get user by ID error:', error);
    next(error);
  }
});

// Create new user
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('mobileNo').notEmpty().withMessage('Mobile number is required'),
  body('roleId').isInt().withMessage('Role ID must be an integer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
    }

    const { email, firstName, lastName, mobileNo, roleId, stateId, rangeId, districtId, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json(formatResponse(false, 'User with this email already exists'));
    }

    // Hash password (use default if not provided)
    const defaultPassword = password || 'password123';
    const hashedPassword = await hashPassword(defaultPassword);

    const user = await User.create({
      email,
      firstName,
      lastName,
      mobileNo,
      roleId,
      stateId,
      rangeId,
      districtId,
      password: hashedPassword,
      verified: true,
      isFirst: true,
      active: true,
      createdBy: req.user.id
    });

    // Fetch user with associations
    const createdUser = await User.findByPk(user.id, {
      include: [
        { model: Role, as: 'role' },
        { model: State, as: 'state' },
        { model: Range, as: 'range' },
        { model: District, as: 'district' }
      ],
      attributes: { exclude: ['password', 'token', 'otp'] }
    });

    res.status(201).json(formatResponse(true, 'User created successfully', createdUser));
    logger.info(`User ${email} created by ${req.user.email}`);
  } catch (error) {
    logger.error('Create user error:', error);
    next(error);
  }
});

// Update user
router.put('/:id', authenticate, [
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if user can update this profile
    if (req.user.id !== parseInt(id) && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role.roleName)) {
      return res.status(403).json(formatResponse(false, 'Access denied'));
    }

    const user = await User.findByPk(id);
    if (!user || !user.active) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    // If email is being updated, check for conflicts
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updates.email } });
      if (existingUser) {
        return res.status(400).json(formatResponse(false, 'User with this email already exists'));
      }
    }

    // Hash password if provided
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
      updates.isFirst = false;
    }

    updates.updatedBy = req.user.id;

    await user.update(updates);

    // Fetch updated user with associations
    const updatedUser = await User.findByPk(id, {
      include: [
        { model: Role, as: 'role' },
        { model: State, as: 'state' },
        { model: Range, as: 'range' },
        { model: District, as: 'district' }
      ],
      attributes: { exclude: ['password', 'token', 'otp'] }
    });

    res.json(formatResponse(true, 'User updated successfully', updatedUser));
    logger.info(`User ${user.email} updated by ${req.user.email}`);
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
});

// Delete user (soft delete)
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user || !user.active) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    // Prevent self-deletion
    if (req.user.id === parseInt(id)) {
      return res.status(400).json(formatResponse(false, 'Cannot delete your own account'));
    }

    await user.update({
      active: false,
      updatedBy: req.user.id
    });

    res.json(formatResponse(true, 'User deleted successfully'));
    logger.info(`User ${user.email} deleted by ${req.user.email}`);
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
});

// Change password
router.post('/:id/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', null, errors.array()));
    }

    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Check if user can change this password
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json(formatResponse(false, 'Access denied'));
    }

    const user = await User.findByPk(id);
    if (!user || !user.active) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    // Verify current password
    const { comparePassword } = require('../utils/helpers');
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json(formatResponse(false, 'Current password is incorrect'));
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    await user.update({
      password: hashedPassword,
      isFirst: false,
      updatedBy: req.user.id
    });

    res.json(formatResponse(true, 'Password changed successfully'));
    logger.info(`Password changed for user ${user.email}`);
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
});

module.exports = router;