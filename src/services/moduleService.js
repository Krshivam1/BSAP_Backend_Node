const { Module, SubMenu, Topic } = require('../models');
const { Op } = require('sequelize');

class ModuleService {
  
  // Get all modules with pagination and filtering
  static async getAllModules(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'priority',
      sortOrder = 'ASC',
      search,
      active
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { moduleName: { [Op.like]: `%${search}%` } }
      ];
    }

    if (active !== undefined) {
      whereClause.active = active;
    }

    const { count, rows } = await Module.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      modules: rows.map(module => module.toJSON()),
      total: count
    };
  }

  // Get module by ID
  static async getModuleById(id) {
    return await Module.findByPk(id);
  }

  // Create new module
  static async createModule(moduleData) {
    // First create the SubMenu
    const subMenu = await SubMenu.create({ 
      menuId: 5,
      menuName: moduleData.moduleName, 
      menuUrl: '#',
      priority: moduleData.priority || 0,
      active: moduleData.active !== undefined ? moduleData.active : true, 
      createdBy: moduleData.createdBy,
      updatedBy: moduleData.createdBy
    });

    // Then create the Module with the SubMenu ID
    const module = await Module.create({
      ...moduleData,
      subMenuId: subMenu.id
    });

    return module;
  }

  // Update module
  static async updateModule(id, moduleData) {
    const module = await Module.findByPk(id);
    if (!module) return null;

    // If module has a subMenuId, update the corresponding SubMenu
    if (module.subMenuId) {
      const subMenu = await SubMenu.findByPk(module.subMenuId);
      if (subMenu) {
        await subMenu.update({
          menuName: moduleData.moduleName || subMenu.menuName,
          priority: moduleData.priority !== undefined ? moduleData.priority : subMenu.priority,
          active: moduleData.active !== undefined ? moduleData.active : subMenu.active,
          updatedBy: moduleData.updatedBy || moduleData.createdBy
        });
      }
    }

    // Update the module
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
      active
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { moduleName: { [Op.like]: `%${search}%` } }
      ]
    };

    if (active !== undefined) {
      whereClause.active = active;
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
      order: [['moduleName', 'ASC']]
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
      where: { active: true },
      order: [['priority', 'ASC']],
      attributes: ['id', 'moduleName', 'priority', 'active']
    });
  }

  // Activate module
  static async activateModule(id, updatedBy) {
    const module = await Module.findByPk(id);
    if (!module) return null;

    await module.update({
      active: true,
      updatedBy
    });

    return module;
  }

  // Deactivate module
  static async deactivateModule(id, updatedBy) {
    const module = await Module.findByPk(id);
    if (!module) return null;

    await module.update({
      active: false,
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
      Module.count({ where: { active: true } }),
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
        'moduleName',
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
        'moduleName',
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
        moduleName: module.moduleName,
        topicCount: parseInt(module.dataValues.topicCount) || 0
      })),
      permissionCounts: permissionCounts.map(module => ({
        id: module.id,
        moduleName: module.moduleName,
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

  // Get all active modules - only ID and Name ordered by name
  static async getAllModule() {
    return await Module.findAll({
      where: { active: true },
      attributes: ['id', 'moduleName'],
      order: [['moduleName', 'ASC']]
    });
  }

  // Get active modules by priority (used for performance statistics form generation)
  static async findByPriority(subMenuId = null) {
    const whereClause = { active: true };
    
    if (subMenuId) {
      whereClause.subMenuId = subMenuId;
    }

    return await Module.findAll({
      where: whereClause,
      include: [
        {
          model: Topic,
          as: 'topics',
          where: { active: true },
          required: false,
          include: [
            {
              model: SubTopic,
              as: 'subTopics',
              where: { active: true },
              required: false,
              order: [['priority', 'ASC']]
            },
            {
              model: Question,
              as: 'questions',
              where: { active: true },
              required: false,
              order: [['priority', 'ASC']]
            }
          ],
          order: [['priority', 'ASC']]
        }
      ],
      order: [['priority', 'ASC']]
    });
  }

}

module.exports = ModuleService;