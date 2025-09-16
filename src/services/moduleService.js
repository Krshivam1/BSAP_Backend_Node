const { Module, Topic, Permission, Role, RolePermission, User } = require('../models');
const { Op } = require('sequelize');

class ModuleService {
  
  // Get all modules with pagination and filtering
  static async getAllModules(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      search,
      isActive
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const { count, rows } = await Module.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Topic,
          as: 'topics',
          attributes: ['id', 'name', 'isActive'],
          required: false
        },
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'isActive'],
          required: false
        }
      ],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      modules: rows.map(module => ({
        ...module.toJSON(),
        topicCount: module.topics ? module.topics.length : 0,
        permissionCount: module.permissions ? module.permissions.length : 0
      })),
      total: count
    };
  }

  // Get module by ID
  static async getModuleById(id) {
    return await Module.findByPk(id, {
      include: [
        {
          model: Topic,
          as: 'topics',
          attributes: ['id', 'name', 'description', 'isActive', 'displayOrder'],
          order: [['displayOrder', 'ASC']]
        },
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'description', 'isActive'],
          order: [['name', 'ASC']]
        }
      ]
    });
  }

  // Create new module
  static async createModule(moduleData) {
    return await Module.create(moduleData);
  }

  // Update module
  static async updateModule(id, moduleData) {
    const module = await Module.findByPk(id);
    if (!module) return null;

    await module.update(moduleData);
    return await this.getModuleById(id);
  }

  // Delete module
  static async deleteModule(id) {
    const module = await Module.findByPk(id);
    if (!module) return false;

    // Check if module has topics
    const topicCount = await Topic.count({ where: { moduleId: id } });
    if (topicCount > 0) {
      throw new Error('Cannot delete module with existing topics');
    }

    // Check if module has permissions
    const permissionCount = await Permission.count({ where: { moduleId: id } });
    if (permissionCount > 0) {
      throw new Error('Cannot delete module with existing permissions');
    }

    await module.destroy();
    return true;
  }

  // Search modules
  static async searchModules(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    };

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const { count, rows } = await Module.findAndCountAll({
      where: whereClause,
      include: [{
        model: Topic,
        as: 'topics',
        attributes: ['id'],
        required: false
      }],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      modules: rows.map(module => ({
        ...module.toJSON(),
        topicCount: module.topics ? module.topics.length : 0
      })),
      total: count
    };
  }

  // Get topics by module
  static async getTopicsByModule(moduleId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await Topic.findAndCountAll({
      where: { moduleId },
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      topics: rows,
      total: count
    };
  }

  // Get permissions by module
  static async getPermissionsByModule(moduleId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await Permission.findAndCountAll({
      where: { moduleId },
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      permissions: rows,
      total: count
    };
  }

  // Get active modules
  static async getActiveModules() {
    return await Module.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC']],
      attributes: ['id', 'name', 'description', 'icon', 'route', 'displayOrder']
    });
  }

  // Activate module
  static async activateModule(id, updatedBy) {
    const module = await Module.findByPk(id);
    if (!module) return null;

    await module.update({
      isActive: true,
      updatedBy
    });

    return module;
  }

  // Deactivate module
  static async deactivateModule(id, updatedBy) {
    const module = await Module.findByPk(id);
    if (!module) return null;

    await module.update({
      isActive: false,
      updatedBy
    });

    return module;
  }

  // Get module statistics
  static async getModuleStatistics() {
    const [
      totalModules,
      activeModules,
      modulesWithTopics,
      modulesWithPermissions
    ] = await Promise.all([
      Module.count(),
      Module.count({ where: { isActive: true } }),
      Module.count({
        include: [{
          model: Topic,
          as: 'topics',
          required: true
        }]
      }),
      Module.count({
        include: [{
          model: Permission,
          as: 'permissions',
          required: true
        }]
      })
    ]);

    const topicCounts = await Module.findAll({
      attributes: [
        'id',
        'name',
        [Module.sequelize.fn('COUNT', Module.sequelize.col('topics.id')), 'topicCount']
      ],
      include: [{
        model: Topic,
        as: 'topics',
        attributes: [],
        required: false
      }],
      group: ['Module.id'],
      order: [[Module.sequelize.literal('topicCount'), 'DESC']]
    });

    const permissionCounts = await Module.findAll({
      attributes: [
        'id',
        'name',
        [Module.sequelize.fn('COUNT', Module.sequelize.col('permissions.id')), 'permissionCount']
      ],
      include: [{
        model: Permission,
        as: 'permissions',
        attributes: [],
        required: false
      }],
      group: ['Module.id'],
      order: [[Module.sequelize.literal('permissionCount'), 'DESC']]
    });

    return {
      totalModules,
      activeModules,
      inactiveModules: totalModules - activeModules,
      modulesWithTopics,
      modulesWithoutTopics: totalModules - modulesWithTopics,
      modulesWithPermissions,
      modulesWithoutPermissions: totalModules - modulesWithPermissions,
      topicCounts: topicCounts.map(module => ({
        id: module.id,
        name: module.name,
        topicCount: parseInt(module.dataValues.topicCount) || 0
      })),
      permissionCounts: permissionCounts.map(module => ({
        id: module.id,
        name: module.name,
        permissionCount: parseInt(module.dataValues.permissionCount) || 0
      }))
    };
  }

  // Get modules with role access
  static async getModulesWithRoleAccess(roleId) {
    return await Module.findAll({
      where: { isActive: true },
      include: [
        {
          model: Permission,
          as: 'permissions',
          where: { isActive: true },
          include: [{
            model: RolePermission,
            as: 'rolePermissions',
            where: { roleId },
            required: false
          }]
        }
      ],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get user modules (based on user roles and permissions)
  static async getUserModules(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'roles',
        where: { isActive: true },
        include: [{
          model: Permission,
          as: 'permissions',
          where: { isActive: true },
          through: { attributes: [] }
        }]
      }]
    });

    if (!user || !user.roles) {
      return [];
    }

    // Get unique module IDs from user permissions
    const moduleIds = new Set();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        if (permission.moduleId) {
          moduleIds.add(permission.moduleId);
        }
      });
    });

    // Get modules with their permitted actions
    return await Module.findAll({
      where: {
        id: { [Op.in]: Array.from(moduleIds) },
        isActive: true
      },
      include: [{
        model: Permission,
        as: 'permissions',
        where: { isActive: true },
        include: [{
          model: RolePermission,
          as: 'rolePermissions',
          where: {
            roleId: { [Op.in]: user.roles.map(role => role.id) }
          }
        }]
      }],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Reorder modules
  static async reorderModules(moduleOrders, updatedBy) {
    const promises = moduleOrders.map(({ id, displayOrder }) => 
      Module.update(
        { displayOrder, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    return await Module.findAll({
      order: [['displayOrder', 'ASC']],
      attributes: ['id', 'name', 'displayOrder']
    });
  }

  // Get modules for dropdown
  static async getModulesForDropdown() {
    return await Module.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'displayOrder'],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Check if module name exists
  static async isNameExists(name, excludeId = null) {
    const whereClause = { name };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await Module.count({ where: whereClause });
    return count > 0;
  }

  // Get module hierarchy with topics and permissions
  static async getModuleHierarchy(moduleId) {
    return await Module.findByPk(moduleId, {
      include: [
        {
          model: Topic,
          as: 'topics',
          where: { isActive: true },
          required: false,
          order: [['displayOrder', 'ASC']]
        },
        {
          model: Permission,
          as: 'permissions',
          where: { isActive: true },
          required: false,
          order: [['name', 'ASC']]
        }
      ]
    });
  }

  // Bulk update modules
  static async bulkUpdateModules(updates, updatedBy) {
    const promises = updates.map(({ id, ...data }) => 
      Module.update(
        { ...data, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    const updatedIds = updates.map(u => u.id);
    return await Module.findAll({
      where: { id: { [Op.in]: updatedIds } },
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get modules with usage statistics
  static async getModulesWithUsage() {
    return await Module.findAll({
      attributes: [
        'id',
        'name',
        'isActive',
        [Module.sequelize.fn('COUNT', Module.sequelize.col('topics.id')), 'topicCount'],
        [Module.sequelize.fn('COUNT', Module.sequelize.col('permissions.id')), 'permissionCount']
      ],
      include: [
        {
          model: Topic,
          as: 'topics',
          attributes: [],
          required: false
        },
        {
          model: Permission,
          as: 'permissions',
          attributes: [],
          required: false
        }
      ],
      group: ['Module.id'],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get next display order
  static async getNextDisplayOrder() {
    const maxOrder = await Module.max('displayOrder');
    return (maxOrder || 0) + 1;
  }

}

module.exports = ModuleService;