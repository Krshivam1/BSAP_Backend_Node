const { SubMenu, Menu } = require('../models');
const { Op } = require('sequelize');

class SubMenuService {
  
  // Get all sub-menus with pagination and filtering
  static async getAllSubMenus(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'priority',
        sortOrder = 'ASC',
        search,
        status,
        menuId,
        parentId
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { menuName: { [Op.like]: `%${search}%` } },
          { menuUrl: { [Op.like]: `%${search}%` } }
        ];
      }

      // Status filter
      if (status) {
        whereClause.active = status === 'active';
      }

      // Menu filter
      if (menuId) {
        whereClause.menuId = menuId;
      }

      // Parent filter
      if (parentId !== undefined) {
        whereClause.subMenuId = parentId === 'null' ? null : parentId;
      }

      const include = [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName'],
          required: false
        }
      ];

      const { count, rows } = await SubMenu.findAndCountAll({
        where: whereClause,
        include,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        distinct: true
      });

      // Transform the data to include parentMenu
      const transformedRows = rows.map(subMenu => {
        const subMenuData = subMenu.toJSON();
        return {
          ...subMenuData,
          parentMenu: subMenuData.menu ? subMenuData.menu.menuName : null,
          menu: undefined // Remove the menu object since we're using parentMenu
        };
      });

      return {
        subMenus: transformedRows,
        total: count
      };
    } catch (error) {
      console.error('Error in getAllSubMenus:', error);
      throw error;
    }
  }

  // Get sub-menu by ID
  static async getSubMenuById(id) {
    try {
      const include = [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName'],
          required: false
        }
      ];

      const subMenu = await SubMenu.findByPk(id, { include });
      
      if (!subMenu) return null;

      // Transform the data to include parentMenu
      const subMenuData = subMenu.toJSON();
      return {
        ...subMenuData,
        parentMenu: subMenuData.menu ? subMenuData.menu.menuName : null,
        menu: undefined // Remove the menu object since we're using parentMenu
      };
    } catch (error) {
      console.error('Error in getSubMenuById:', error);
      throw error;
    }
  }

  // Create new sub-menu
  static async createSubMenu(subMenuData) {
    try {
      // Set priority if not provided
      if (!subMenuData.priority && subMenuData.priority !== 0) {
        const maxPriority = await SubMenu.max('priority', {
          where: { 
            menuId: subMenuData.menuId,
            subMenuId: subMenuData.subMenuId || null
          }
        });
        subMenuData.priority = (maxPriority || 0) + 1;
      }

      return await SubMenu.create(subMenuData);
    } catch (error) {
      console.error('Error in createSubMenu:', error);
      throw error;
    }
  }

  // Update sub-menu
  static async updateSubMenu(id, subMenuData) {
    try {
      const subMenu = await SubMenu.findByPk(id);
      if (!subMenu) return null;

      await subMenu.update(subMenuData);
      return subMenu;
    } catch (error) {
      console.error('Error in updateSubMenu:', error);
      throw error;
    }
  }

  // Delete sub-menu
  static async deleteSubMenu(id) {
    try {
      const subMenu = await SubMenu.findByPk(id);
      if (!subMenu) return false;

      await subMenu.destroy();
      return true;
    } catch (error) {
      console.error('Error in deleteSubMenu:', error);
      throw error;
    }
  }

  // Get active sub-menus
  static async getActiveSubMenus(menuId = null, parentId = null) {
    try {
      const whereClause = { active: true };

      if (menuId) {
        whereClause.menuId = menuId;
      }

      // Only add subMenuId filter if parentId is explicitly provided
      if (parentId !== null && parentId !== undefined) {
        whereClause.subMenuId = parentId === 'null' ? null : parentId;
      }

      const include = [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName', 'priority'],
          required: false
        }
      ];

      const subMenus = await SubMenu.findAll({
        where: whereClause,
        include,
        order: [
          [{ model: Menu, as: 'menu' }, 'priority', 'ASC'],
          ['priority', 'ASC']
        ]
      });

      // Transform the data to include parentMenu
      return subMenus.map(subMenu => {
        const subMenuData = subMenu.toJSON();
        return {
          ...subMenuData,
          parentMenu: subMenuData.menu ? subMenuData.menu.menuName : null,
          menu: undefined // Remove the menu object since we're using parentMenu
        };
      });
    } catch (error) {
      console.error('Error in getActiveSubMenus:', error);
      throw error;
    }
  }

  // Search sub-menus
  static async searchSubMenus(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        menuId,
        parentId
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {
        [Op.or]: [
          { menuName: { [Op.like]: `%${search}%` } },
          { menuUrl: { [Op.like]: `%${search}%` } }
        ]
      };

      if (status) {
        whereClause.active = status === 'active';
      }

      if (menuId) {
        whereClause.menuId = menuId;
      }

      if (parentId !== undefined) {
        whereClause.subMenuId = parentId === 'null' ? null : parentId;
      }

      const include = [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName'],
          required: false
        }
      ];

      const { count, rows } = await SubMenu.findAndCountAll({
        where: whereClause,
        include,
        limit,
        offset,
        order: [['menuName', 'ASC']],
        distinct: true
      });

      // Transform the data to include parentMenu
      const transformedRows = rows.map(subMenu => {
        const subMenuData = subMenu.toJSON();
        return {
          ...subMenuData,
          parentMenu: subMenuData.menu ? subMenuData.menu.menuName : null,
          menu: undefined // Remove the menu object since we're using parentMenu
        };
      });

      return {
        subMenus: transformedRows,
        total: count
      };
    } catch (error) {
      console.error('Error in searchSubMenus:', error);
      throw error;
    }
  }

  // Get sub-menus by menu
  static async getSubMenusByMenu(menuId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'priority',
        sortOrder = 'ASC',
        status
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = { menuId };

      if (status) {
        whereClause.active = status === 'active';
      }

      const include = [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName'],
          required: false
        }
      ];

      const { count, rows } = await SubMenu.findAndCountAll({
        where: whereClause,
        include,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        distinct: true
      });

      // Transform the data to include parentMenu
      const transformedRows = rows.map(subMenu => {
        const subMenuData = subMenu.toJSON();
        return {
          ...subMenuData,
          parentMenu: subMenuData.menu ? subMenuData.menu.menuName : null,
          menu: undefined // Remove the menu object since we're using parentMenu
        };
      });

      return {
        subMenus: transformedRows,
        total: count
      };
    } catch (error) {
      console.error('Error in getSubMenusByMenu:', error);
      throw error;
    }
  }

  // Get sub-menus by parent
  static async getSubMenusByParent(parentId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'priority',
        sortOrder = 'ASC',
        status
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = { subMenuId: parentId === 'null' ? null : parentId };

      if (status) {
        whereClause.active = status === 'active';
      }

      const include = [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName'],
          required: false
        }
      ];

      const { count, rows } = await SubMenu.findAndCountAll({
        where: whereClause,
        include,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        distinct: true
      });

      // Transform the data to include parentMenu
      const transformedRows = rows.map(subMenu => {
        const subMenuData = subMenu.toJSON();
        return {
          ...subMenuData,
          parentMenu: subMenuData.menu ? subMenuData.menu.menuName : null,
          menu: undefined // Remove the menu object since we're using parentMenu
        };
      });

      return {
        subMenus: transformedRows,
        total: count
      };
    } catch (error) {
      console.error('Error in getSubMenusByParent:', error);
      throw error;
    }
  }

  // Activate sub-menu
  static async activateSubMenu(id, updatedBy) {
    try {
      const subMenu = await SubMenu.findByPk(id);
      if (!subMenu) return null;

      await subMenu.update({
        active: true,
        updatedBy
      });

      return subMenu;
    } catch (error) {
      console.error('Error in activateSubMenu:', error);
      throw error;
    }
  }

  // Deactivate sub-menu
  static async deactivateSubMenu(id, updatedBy) {
    try {
      const subMenu = await SubMenu.findByPk(id);
      if (!subMenu) return null;

      await subMenu.update({
        active: false,
        updatedBy
      });

      return subMenu;
    } catch (error) {
      console.error('Error in deactivateSubMenu:', error);
      throw error;
    }
  }

  // Update sub-menu order
  static async updateSubMenuOrder(id, priority, updatedBy) {
    try {
      const subMenu = await SubMenu.findByPk(id);
      if (!subMenu) return null;

      await subMenu.update({
        priority,
        updatedBy
      });

      return subMenu;
    } catch (error) {
      console.error('Error in updateSubMenuOrder:', error);
      throw error;
    }
  }
}

module.exports = SubMenuService;