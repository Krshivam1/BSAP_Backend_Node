const { Role } = require('../models');
const { Op } = require('sequelize');

class RoleService {
  
  // Get all roles with pagination and filtering
  static async getAllRoles(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'roleName',
        sortOrder = 'ASC',
        search,
        status
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { roleName: { [Op.like]: `%${search}%` } }
        ];
      }

      // Status filter
      if (status) {
        whereClause.active = status === 'active';
      }

      const { count, rows } = await Role.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });

      return {
        roles: rows,
        total: count
      };
    } catch (error) {
      console.error('Error in getAllRoles:', error);
      throw error;
    }
  }

  // Get role by ID
  static async getRoleById(id) {
    try {
      return await Role.findByPk(id);
    } catch (error) {
      console.error('Error in getRoleById:', error);
      throw error;
    }
  }

  // Create new role
  static async createRole(roleData) {
    try {
      return await Role.create(roleData);
    } catch (error) {
      console.error('Error in createRole:', error);
      throw error;
    }
  }

  // Update role
  static async updateRole(id, roleData) {
    try {
      const role = await Role.findByPk(id);
      if (!role) return null;

      await role.update(roleData);
      return role;
    } catch (error) {
      console.error('Error in updateRole:', error);
      throw error;
    }
  }

  // Delete role
  static async deleteRole(id) {
    try {
      const role = await Role.findByPk(id);
      if (!role) return false;

      await role.destroy();
      return true;
    } catch (error) {
      console.error('Error in deleteRole:', error);
      throw error;
    }
  }

  // Get active roles
  static async getActiveRoles() {
    try {
      return await Role.findAll({
        where: { active: true },
        order: [['roleName', 'ASC']]
      });
    } catch (error) {
      console.error('Error in getActiveRoles:', error);
      throw error;
    }
  }

  // Search roles
  static async searchRoles(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {
        roleName: { [Op.like]: `%${search}%` }
      };

      if (status) {
        whereClause.active = status === 'active';
      }

      const { count, rows } = await Role.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['roleName', 'ASC']]
      });

      return {
        roles: rows,
        total: count
      };
    } catch (error) {
      console.error('Error in searchRoles:', error);
      throw error;
    }
  }

  // Activate role
  static async activateRole(id, updatedBy) {
    try {
      const role = await Role.findByPk(id);
      if (!role) return null;

      await role.update({
        active: true,
        updatedBy
      });

      return role;
    } catch (error) {
      console.error('Error in activateRole:', error);
      throw error;
    }
  }

  // Deactivate role
  static async deactivateRole(id, updatedBy) {
    try {
      const role = await Role.findByPk(id);
      if (!role) return null;

      await role.update({
        active: false,
        updatedBy
      });

      return role;
    } catch (error) {
      console.error('Error in deactivateRole:', error);
      throw error;
    }
  }

  // Get role statistics
  static async getRoleStatistics() {
    try {
      const [
        totalRoles,
        activeRoles
      ] = await Promise.all([
        Role.count(),
        Role.count({ where: { active: true } })
      ]);

      return {
        totalRoles,
        activeRoles,
        inactiveRoles: totalRoles - activeRoles
      };
    } catch (error) {
      console.error('Error in getRoleStatistics:', error);
      throw error;
    }
  }
}

module.exports = RoleService;