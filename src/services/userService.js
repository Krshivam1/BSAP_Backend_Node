const { User, Role, State, Range, District } = require('../models');
const { hashPassword, getPagination, getPagingData } = require('../utils/helpers');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class UserService {
  /**
   * Get all users with pagination and filtering
   * @param {Object} filters - Filtering options
   * @returns {Object} Paginated users data
   */
  async getAllUsers(filters = {}) {
    const { page, size, stateId, rangeId, districtId, roleId, search, active = true } = filters;
    const { limit, offset } = getPagination(page, size);

    const whereCondition = { active };
    
    if (stateId) whereCondition.stateId = stateId;
    if (rangeId) whereCondition.rangeId = rangeId;
    if (districtId) whereCondition.districtId = districtId;
    if (roleId) whereCondition.roleId = roleId;

    // Add search functionality
    if (search) {
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

    return getPagingData(users, page, limit);
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Object} User data
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      include: [
        { model: Role, as: 'role' },
        { model: State, as: 'state' },
        { model: Range, as: 'range' },
        { model: District, as: 'district' }
      ],
      attributes: { exclude: ['password', 'token', 'otp'] }
    });

    if (!user || !user.active) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {number} createdBy - ID of user creating this user
   * @returns {Object} Created user
   */
  async createUser(userData, createdBy) {
    const { 
      email, 
      firstName, 
      lastName, 
      mobileNo, 
      roleId, 
      stateId, 
      rangeId, 
      districtId, 
      password = 'password123' 
    } = userData;

    // Validation
    if (!email || !firstName || !lastName || !mobileNo || !roleId) {
      throw new Error('Email, first name, last name, mobile number and role are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

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
      createdBy
    });

    // Fetch user with associations
    const createdUser = await this.getUserById(user.id);

    logger.info(`User ${email} created by user ID ${createdBy}`);
    return createdUser;
  }

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} updateData - Update data
   * @param {number} updatedBy - ID of user making the update
   * @returns {Object} Updated user
   */
  async updateUser(userId, updateData, updatedBy) {
    const user = await User.findByPk(userId);
    if (!user || !user.active) {
      throw new Error('User not found');
    }

    // If email is being updated, check for conflicts
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updateData.email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
      updateData.isFirst = false;
    }

    updateData.updatedBy = updatedBy;

    await user.update(updateData);

    // Fetch updated user with associations
    const updatedUser = await this.getUserById(userId);

    logger.info(`User ${user.email} updated by user ID ${updatedBy}`);
    return updatedUser;
  }

  /**
   * Delete user (soft delete)
   * @param {number} userId - User ID
   * @param {number} deletedBy - ID of user performing the deletion
   * @returns {Object} Response
   */
  async deleteUser(userId, deletedBy) {
    const user = await User.findByPk(userId);
    if (!user || !user.active) {
      throw new Error('User not found');
    }

    await user.update({
      active: false,
      updatedBy: deletedBy
    });

    logger.info(`User ${user.email} deleted by user ID ${deletedBy}`);
    
    return {
      success: true,
      message: 'User deleted successfully'
    };
  }

  /**
   * Get users by role
   * @param {number} roleId - Role ID
   * @returns {Array} Users with specified role
   */
  async getUsersByRole(roleId) {
    const users = await User.findAll({
      where: { 
        roleId,
        active: true 
      },
      include: [
        { model: Role, as: 'role' },
        { model: State, as: 'state' },
        { model: Range, as: 'range' },
        { model: District, as: 'district' }
      ],
      attributes: { exclude: ['password', 'token', 'otp'] },
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    return users;
  }

  /**
   * Get users by location
   * @param {Object} location - Location filters
   * @returns {Array} Users in specified location
   */
  async getUsersByLocation(location) {
    const { stateId, rangeId, districtId } = location;
    
    const whereCondition = { active: true };
    if (stateId) whereCondition.stateId = stateId;
    if (rangeId) whereCondition.rangeId = rangeId;
    if (districtId) whereCondition.districtId = districtId;

    const users = await User.findAll({
      where: whereCondition,
      include: [
        { model: Role, as: 'role' },
        { model: State, as: 'state' },
        { model: Range, as: 'range' },
        { model: District, as: 'district' }
      ],
      attributes: { exclude: ['password', 'token', 'otp'] },
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    return users;
  }

  /**
   * Search users
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Array} Matching users
   */
  async searchUsers(searchTerm, filters = {}) {
    const whereCondition = { 
      active: true,
      [Op.or]: [
        { firstName: { [Op.like]: `%${searchTerm}%` } },
        { lastName: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
        { mobileNo: { [Op.like]: `%${searchTerm}%` } }
      ]
    };

    // Apply additional filters
    if (filters.roleId) whereCondition.roleId = filters.roleId;
    if (filters.stateId) whereCondition.stateId = filters.stateId;
    if (filters.rangeId) whereCondition.rangeId = filters.rangeId;
    if (filters.districtId) whereCondition.districtId = filters.districtId;

    const users = await User.findAll({
      where: whereCondition,
      include: [
        { model: Role, as: 'role' },
        { model: State, as: 'state' },
        { model: Range, as: 'range' },
        { model: District, as: 'district' }
      ],
      attributes: { exclude: ['password', 'token', 'otp'] },
      order: [['firstName', 'ASC'], ['lastName', 'ASC']],
      limit: 50 // Limit search results
    });

    return users;
  }

  /**
   * Get user statistics
   * @returns {Object} User statistics
   */
  async getUserStatistics() {
    const totalUsers = await User.count({ where: { active: true } });
    const verifiedUsers = await User.count({ where: { active: true, verified: true } });
    const unverifiedUsers = await User.count({ where: { active: true, verified: false } });
    
    // Users by role
    const usersByRole = await User.findAll({
      where: { active: true },
      include: [{ model: Role, as: 'role' }],
      attributes: ['roleId', [User.sequelize.fn('COUNT', User.sequelize.col('User.id')), 'count']],
      group: ['roleId', 'role.id'],
      raw: true
    });

    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.count({
      where: {
        active: true,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      recentUsers,
      usersByRole
    };
  }

  /**
   * Activate/Deactivate user
   * @param {number} userId - User ID
   * @param {boolean} status - Active status
   * @param {number} updatedBy - ID of user making the change
   * @returns {Object} Response
   */
  async toggleUserStatus(userId, status, updatedBy) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({
      active: status,
      updatedBy
    });

    const action = status ? 'activated' : 'deactivated';
    logger.info(`User ${user.email} ${action} by user ID ${updatedBy}`);

    return {
      success: true,
      message: `User ${action} successfully`
    };
  }

  /**
   * Bulk operations on users
   * @param {Array} userIds - Array of user IDs
   * @param {string} operation - Operation type (activate, deactivate, delete)
   * @param {number} performedBy - ID of user performing the operation
   * @returns {Object} Response
   */
  async bulkUserOperation(userIds, operation, performedBy) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs array is required');
    }

    const updateData = { updatedBy: performedBy };
    
    switch (operation) {
      case 'activate':
        updateData.active = true;
        break;
      case 'deactivate':
        updateData.active = false;
        break;
      case 'delete':
        updateData.active = false;
        break;
      default:
        throw new Error('Invalid operation');
    }

    const [updatedCount] = await User.update(updateData, {
      where: {
        id: { [Op.in]: userIds }
      }
    });

    logger.info(`Bulk ${operation} performed on ${updatedCount} users by user ID ${performedBy}`);

    return {
      success: true,
      message: `${operation} performed on ${updatedCount} users`,
      affectedCount: updatedCount
    };
  }
}

module.exports = new UserService();