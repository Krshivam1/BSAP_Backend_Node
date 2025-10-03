const { User, State, Role, District, Range } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

class UserService {
  
  static async getAllUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'firstName',
        sortOrder = 'ASC',
        search,
        status,
        roleId,
        stateId
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { mobileNo: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        whereClause.active = status === 'active';
      }

      if (roleId) {
        whereClause.roleId = roleId;
      }

      if (stateId) {
        whereClause.stateId = stateId;
      }

      const include = [
        {
          model: State,
          as: 'state', 
          attributes: ['id', 'stateName'],
          required: false
        },
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'roleName'],
          required: false
        },
        {
          model: District,
          as: 'district', 
          attributes: ['id', 'districtName'],
          required: false
        },
        {
          model: Range,
          as: 'range', 
          attributes: ['id', 'rangeName'],
          required: false
        }
      ];

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]],
        include: include,
        attributes: { exclude: ['password', 'token', 'otp'] } 
      });

      return {
        users: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const include = [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'stateName'],
          required: false
        },
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'roleName'],
          required: false
        },
        {
          model: District,
          as: 'district',
          attributes: ['id', 'districtName'],
          required: false
        },
        {
          model: Range,
          as: 'range',
          attributes: ['id', 'rangeName'], 
          required: false
        }
      ];

      return await User.findByPk(id, {
        include: include,
        attributes: { exclude: ['password', 'token', 'otp'] }
      });
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  // Get user by email 
  static async getUserByEmail(email) {
    try {
      const include = [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'roleName', 'permissions'],
          required: false
        }
      ];

      return await User.findOne({
        where: { email },
        include: include
      });
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData) {
    try {
      if (!userData.firstName || userData.firstName.trim() === '') {
        throw new Error('First name is required');
      }

      if (!userData.lastName || userData.lastName.trim() === '') {
        throw new Error('Last name is required');
      }

      if (!userData.email || userData.email.trim() === '') {
        throw new Error('Email is required');
      }

      if (!userData.password || userData.password.trim() === '') {
        throw new Error('Password is required');
      }

      if (!userData.mobileNo || userData.mobileNo.trim() === '') {
        throw new Error('Mobile number is required');
      }

      if (!userData.roleId) {
        throw new Error('Role is required');
      }

      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
      }

      userData.firstName = userData.firstName.trim();
      userData.lastName = userData.lastName.trim();
      userData.email = userData.email.trim().toLowerCase();
      userData.mobileNo = userData.mobileNo.trim();

      if (userData.contactNo) {
        userData.contactNo = userData.contactNo.trim();
      }

      return await User.create(userData);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  static async updateUser(id, userData) {
    try {
      const user = await User.findByPk(id);
      if (!user) return null;

      if (userData.email && userData.email !== user.email) {
        const existingUser = await User.findOne({ where: { email: userData.email } });
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
      }

      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
      }

      if (userData.firstName) userData.firstName = userData.firstName.trim();
      if (userData.lastName) userData.lastName = userData.lastName.trim();
      if (userData.email) userData.email = userData.email.trim().toLowerCase();
      if (userData.mobileNo) userData.mobileNo = userData.mobileNo.trim();
      if (userData.contactNo) userData.contactNo = userData.contactNo.trim();

      await user.update(userData);
      return await this.getUserById(id); 
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) return false;

      await user.destroy();
      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  static async getActiveUsers() {
    try {
      const include = [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'roleName'],
          required: false
        }
      ];

      return await User.findAll({
        where: { active: true },
        order: [['firstName', 'ASC']],
        include: include,
        attributes: { exclude: ['password', 'token', 'otp'] }
      });
    } catch (error) {
      console.error('Error in getActiveUsers:', error);
      throw error;
    }
  }

  static async toggleUserStatus(id, active) {
    try {
      const user = await User.findByPk(id);
      if (!user) return null;

      await user.update({ active });
      return await this.getUserById(id);
    } catch (error) {
      console.error('Error in toggleUserStatus:', error);
      throw error;
    }
  }

  static async verifyUser(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) return null;

      await user.update({ verified: true });
      return await this.getUserById(id);
    } catch (error) {
      console.error('Error in verifyUser:', error);
      throw error;
    }
  }

  static async updatePassword(id, newPassword) {
    try {
      const user = await User.findByPk(id);
      if (!user) return null;

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await user.update({ password: hashedPassword, isFirst: false });
      return true;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw error;
    }
  }

  static async getUserStatistics() {
    try {
      const [
        totalUsers,
        activeUsers,
        verifiedUsers
      ] = await Promise.all([
        User.count(),
        User.count({ where: { active: true } }),
        User.count({ where: { verified: true } })
      ]);

      return {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers
      };
    } catch (error) {
      console.error('Error in getUserStatistics:', error);
      throw error;
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserService;