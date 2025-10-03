const { Permission } = require('../models');
const { Op } = require('sequelize');

class PermissionService {
  
  static async getAllPermissions(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'permissionName',
        sortOrder = 'ASC',
        search,
        status
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { permissionName: { [Op.like]: `%${search}%` } },
          { permissionCode: { [Op.like]: `%${search}%` } },
          { permissionUrl: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        whereClause.active = status === 'active';
      }

      const { count, rows } = await Permission.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]]
      });

      return {
        permissions: rows,
        total: count
      };
    } catch (error) {
      console.error('Error in getAllPermissions:', error);
      throw error;
    }
  }

  static async searchPermissions(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status,
        sortBy = 'permissionName',
        sortOrder = 'ASC'
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { permissionName: { [Op.like]: `%${search}%` } },
          { permissionCode: { [Op.like]: `%${search}%` } },
          { permissionUrl: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        whereClause.active = status === 'active';
      }

      const { count, rows } = await Permission.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      return {
        permissions: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('Error in searchPermissions:', error);
      throw error;
    }
  }

  static async getPermissionById(id) {
    try {
      return await Permission.findByPk(id);
    } catch (error) {
      console.error('Error in getPermissionById:', error);
      throw error;
    }
  }

  static async getPermissionByCode(code) {
    try {
      return await Permission.findOne({
        where: { permissionCode: code }
      });
    } catch (error) {
      console.error('Error in getPermissionByCode:', error);
      throw error;
    }
  }

  static async createPermission(permissionData) {
    try {
      if (!permissionData.permissionName || permissionData.permissionName.trim() === '') {
        throw new Error('Permission name is required');
      }

      if (!permissionData.permissionCode || permissionData.permissionCode.trim() === '') {
        throw new Error('Permission code is required');
      }

      permissionData.permissionName = permissionData.permissionName.trim();
      permissionData.permissionCode = permissionData.permissionCode.trim().toUpperCase();
      
      if (permissionData.permissionUrl) {
        permissionData.permissionUrl = permissionData.permissionUrl.trim();
      }

      return await Permission.create(permissionData);
    } catch (error) {
      console.error('Error in createPermission:', error);
      throw error;
    }
  }

  static async updatePermission(id, permissionData) {
    try {
      const permission = await Permission.findByPk(id);
      if (!permission) return null;

      if (permissionData.permissionName) {
        permissionData.permissionName = permissionData.permissionName.trim();
      }

      if (permissionData.permissionCode) {
        permissionData.permissionCode = permissionData.permissionCode.trim().toUpperCase();
      }

      if (permissionData.permissionUrl) {
        permissionData.permissionUrl = permissionData.permissionUrl.trim();
      }

      await permission.update(permissionData);
      return permission;
    } catch (error) {
      console.error('Error in updatePermission:', error);
      throw error;
    }
  }

  static async deletePermission(id) {
    try {
      const permission = await Permission.findByPk(id);
      if (!permission) return false;

      await permission.destroy();
      return true;
    } catch (error) {
      console.error('Error in deletePermission:', error);
      throw error;
    }
  }

  static async getActivePermissions() {
    try {
      return await Permission.findAll({
        where: { active: true },
        order: [['permissionName', 'ASC']]
      });
    } catch (error) {
      console.error('Error in getActivePermissions:', error);
      throw error;
    }
  }

  static async activatePermission(id, updatedBy) {
    try {
      const permission = await Permission.findByPk(id);
      if (!permission) return null;

      await permission.update({
        active: true,
        updatedBy
      });

      return permission;
    } catch (error) {
      console.error('Error in activatePermission:', error);
      throw error;
    }
  }

  // Deactivate permission
  static async deactivatePermission(id, updatedBy) {
    try {
      const permission = await Permission.findByPk(id);
      if (!permission) return null;

      await permission.update({
        active: false,
        updatedBy
      });

      return permission;
    } catch (error) {
      console.error('Error in deactivatePermission:', error);
      throw error;
    }
  }

  static async getPermissionStatistics() {
    try {
      const [
        totalPermissions,
        activePermissions
      ] = await Promise.all([
        Permission.count(),
        Permission.count({ where: { active: true } })
      ]);

      return {
        totalPermissions,
        activePermissions,
        inactivePermissions: totalPermissions - activePermissions
      };
    } catch (error) {
      console.error('Error in getPermissionStatistics:', error);
      throw error;
    }
  }

  static async togglePermissionStatus(id, active) {
    try {
      const permission = await Permission.findByPk(id);
      if (!permission) return null;

      await permission.update({ active });
      return permission;
    } catch (error) {
      console.error('Error in togglePermissionStatus:', error);
      throw error;
    }
  }
}

module.exports = PermissionService;