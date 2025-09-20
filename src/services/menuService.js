const { Menu, Role, RoleMenu, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models')

class MenuService {
  
  // Get all menus with pagination and filtering
  static async getAllMenus(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      search,
      status,
      parentId,
      level
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { path: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      whereClause.isActive = status === 'active';
    }

    if (parentId !== undefined) {
      whereClause.parentId = parentId === 'null' ? null : parentId;
    }

    if (level !== undefined) {
      whereClause.level = level;
    }

    const { count, rows } = await Menu.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Menu,
          as: 'parent',
          attributes: ['id', 'name', 'path']
        },
        {
          model: Menu,
          as: 'children',
          attributes: ['id', 'name', 'path', 'displayOrder']
        }
      ],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      menus: rows,
      total: count
    };
  }

  // Get menu by ID
  static async getMenuById(id) {
    return await Menu.findByPk(id, {
      include: [
        {
          model: Menu,
          as: 'parent',
          attributes: ['id', 'name', 'path']
        },
        {
          model: Menu,
          as: 'children',
          attributes: ['id', 'name', 'path', 'displayOrder'],
          order: [['displayOrder', 'ASC']]
        },
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ]
    });
  }

  // Create new menu
  static async createMenu(menuData) {
    // Calculate level based on parent
    if (menuData.parentId) {
      const parent = await Menu.findByPk(menuData.parentId);
      if (parent) {
        menuData.level = parent.level + 1;
      }
    } else {
      menuData.level = 0;
    }

    // Set display order if not provided
    if (!menuData.displayOrder) {
      const maxOrder = await Menu.max('displayOrder', {
        where: { parentId: menuData.parentId || null }
      });
      menuData.displayOrder = (maxOrder || 0) + 1;
    }

    return await Menu.create(menuData);
  }

  // Update menu
  static async updateMenu(id, menuData) {
    const menu = await Menu.findByPk(id);
    if (!menu) return null;

    // Recalculate level if parent changed
    if (menuData.parentId !== undefined && menuData.parentId !== menu.parentId) {
      if (menuData.parentId) {
        const parent = await Menu.findByPk(menuData.parentId);
        if (parent) {
          menuData.level = parent.level + 1;
        }
      } else {
        menuData.level = 0;
      }
    }

    await menu.update(menuData);
    return await this.getMenuById(id);
  }

  // Delete menu
  static async deleteMenu(id) {
    const menu = await Menu.findByPk(id);
    if (!menu) return false;

    // Check if menu has children
    const childCount = await Menu.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new Error('Cannot delete menu with child menus');
    }

    await menu.destroy();
    return true;
  }

  // Get menu hierarchy
  static async getMenuHierarchy(status = 'active') {
    const whereClause = {};
    if (status === 'active') {
      whereClause.isActive = true;
    }

    const menus = await Menu.findAll({
      where: whereClause,
      order: [['level', 'ASC'], ['displayOrder', 'ASC']]
    });

    return this.buildHierarchy(menus);
  }

  // Build hierarchy from flat menu array
  static buildHierarchy(menus, parentId = null) {
    const children = menus
      .filter(menu => menu.parentId === parentId)
      .map(menu => ({
        ...menu.toJSON(),
        children: this.buildHierarchy(menus, menu.id)
      }));

    return children;
  }

  // Get user menus based on roles
  // static async getUserMenus(userId, includeHierarchy = true) {
  //   const user = await User.findByPk(userId, {
  //     include: [{
  //       model: Role,
  //       as: 'role',
  //       include: [{
  //         model: Menu,
  //         as: 'menus',
  //         where: { active: true },
  //         required: false
  //       }]
  //     }]
  //   });
  //   if (!user || !user.role) {
  //     return [];
  //   }

  //   // Collect all menus from user's role
  //   const menus = user.role.menus.filter(menu => {
  //     return menu.active;
  //   });

  //   if (!menus.length) {
  //     return [];
  //   }
  //   return menus.sort((a, b) => a.priority - b.priority);
  // }


   static async getUserMenus(roleId) {
    try {
      // Get all menus that the role has access to from role_menu table
      const menuQuery = `
        SELECT DISTINCT
          m.id as menu_id,
          m.menu_name as menu_name,
          m.menu_url as menu_url,
          m.priority as menu_priority
        FROM role_menu rm
        INNER JOIN menu m ON rm.menu_id = m.id AND m.active = '1'
        WHERE rm.role_id = :roleId AND rm.active = '1'
        ORDER BY m.priority ASC
      `;

      const menuResults = await Menu.sequelize.query(menuQuery, {
        replacements: { roleId },
        type: Menu.sequelize.QueryTypes.SELECT
      });

      // Get all submenus that the role has access to from roleSubmenu table
      const submenuQuery = `
        SELECT DISTINCT
          m.id as menu_id,
          m.menu_name as menu_name,
          m.menu_url as menu_url,
          m.priority as menu_priority,
          sm.id as submenu_id,
          sm.menu_name as submenu_name,
          sm.menu_url as submenu_url,
          sm.priority as submenu_priority,
          sm.sub_menu_id as parent_submenu_id,
          psm.menu_name as parent_submenu_name,
          psm.menu_url as parent_submenu_url,
          psm.priority as parent_submenu_priority
        FROM role_sub_menu rs
        INNER JOIN sub_menu sm ON rs.sub_menu_id = sm.id AND sm.active = '1'
        INNER JOIN menu m ON sm.menu_id = m.id AND m.active = '1'
        LEFT JOIN sub_menu psm ON sm.sub_menu_id = psm.id AND psm.active = '1'
        WHERE rs.role_id = :roleId AND rs.active = '1'
        ORDER BY m.priority ASC, 
                 COALESCE(psm.priority, 999) ASC, 
                 sm.priority ASC
      `;

      const submenuResults = await Menu.sequelize.query(submenuQuery, {
        replacements: { roleId },
        type: Menu.sequelize.QueryTypes.SELECT
      });

      // Build hierarchical structure
      const menuMap = new Map();

      // First, add all menus that the role has access to
      menuResults.forEach(menuRow => {
        menuMap.set(menuRow.menu_id, {
          id: menuRow.menu_id,
          name: menuRow.menu_name,
          url: menuRow.menu_url,
          priority: menuRow.menu_priority,
          type: 'menu',
          children: []
        });
      });

      // Then add submenus to their respective menus
      submenuResults.forEach(row => {
        const menuId = row.menu_id;
        
        // Create menu if it doesn't exist (in case submenu exists but menu not in role_menu)
        if (!menuMap.has(menuId)) {
          menuMap.set(menuId, {
            id: menuId,
            name: row.menu_name,
            url: row.menu_url,
            priority: row.menu_priority,
            type: 'menu',
            children: []
          });
        }

        const menu = menuMap.get(menuId);

        // If this is a child submenu (has parent_submenu_id)
        if (row.parent_submenu_id) {
          // Find or create parent submenu
          let parentSubmenu = menu.children.find(child => child.id === row.parent_submenu_id);
          
          if (!parentSubmenu) {
            parentSubmenu = {
              id: row.parent_submenu_id,
              name: row.parent_submenu_name,
              url: row.parent_submenu_url,
              priority: row.parent_submenu_priority,
              type: 'submenu',
              parent_id: menuId,
              children: []
            };
            menu.children.push(parentSubmenu);
          }

          // Add child submenu
          const childExists = parentSubmenu.children.find(child => child.id === row.submenu_id);
          if (!childExists) {
            parentSubmenu.children.push({
              id: row.submenu_id,
              name: row.submenu_name,
              url: row.submenu_url,
              priority: row.submenu_priority,
              type: 'child_submenu',
              parent_id: row.parent_submenu_id
            });
          }
        } else {
          // This is a top-level submenu
          const submenuExists = menu.children.find(child => child.id === row.submenu_id);
          if (!submenuExists) {
            menu.children.push({
              id: row.submenu_id,
              name: row.submenu_name,
              url: row.submenu_url,
              priority: row.submenu_priority,
              type: 'submenu',
              parent_id: menuId,
              children: []
            });
          }
        }
      });

      // Convert to array and sort everything
      const finalResult = Array.from(menuMap.values()).map(menu => {
        // Sort submenus
        menu.children.sort((a, b) => a.priority - b.priority);
        
        // Sort child submenus within each submenu
        menu.children.forEach(submenu => {
          if (submenu.children && submenu.children.length > 0) {
            submenu.children.sort((a, b) => a.priority - b.priority);
          }
        });
        
        return menu;
      });

      // Sort main menus
      finalResult.sort((a, b) => a.priority - b.priority);

      return finalResult;

    } catch (error) {
      console.error('Error fetching menus by role:', error);
      throw new Error('Failed to fetch menus for role');
    }
  }

  // Get role menus
  static async getRoleMenus(roleId) {
    const role = await Role.findByPk(roleId, {
      include: [{
        model: Menu,
        as: 'menus',
        order: [['level', 'ASC'], ['displayOrder', 'ASC']]
      }]
    });

    return role ? role.menus : [];
  }

  // Get child menus
  static async getChildMenus(parentId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      status
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = { parentId };

    if (status) {
      whereClause.isActive = status === 'active';
    }

    const { count, rows } = await Menu.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      menus: rows,
      total: count
    };
  }

  // Get root menus
  static async getRootMenus(status = 'active') {
    const whereClause = { parentId: null };
    if (status === 'active') {
      whereClause.isActive = true;
    }

    return await Menu.findAll({
      where: whereClause,
      order: [['displayOrder', 'ASC']],
      include: [{
        model: Menu,
        as: 'children',
        where: { isActive: true },
        required: false,
        order: [['displayOrder', 'ASC']]
      }]
    });
  }

  // Search menus
  static async searchMenus(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      status
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { path: { [Op.like]: `%${search}%` } }
      ]
    };

    if (status) {
      whereClause.isActive = status === 'active';
    }

    const { count, rows } = await Menu.findAndCountAll({
      where: whereClause,
      include: [{
        model: Menu,
        as: 'parent',
        attributes: ['id', 'name']
      }],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      menus: rows,
      total: count
    };
  }

  // Get active menus
  static async getActiveMenus() {
    return await Menu.findAll({
      where: { isActive: true },
      order: [['level', 'ASC'], ['displayOrder', 'ASC']]
    });
  }

  // Activate menu
  static async activateMenu(id, updatedBy) {
    const menu = await Menu.findByPk(id);
    if (!menu) return null;

    await menu.update({
      isActive: true,
      updatedBy
    });

    return menu;
  }

  // Deactivate menu
  static async deactivateMenu(id, updatedBy) {
    const menu = await Menu.findByPk(id);
    if (!menu) return null;

    await menu.update({
      isActive: false,
      updatedBy
    });

    return menu;
  }

  // Update menu order
  static async updateMenuOrder(id, displayOrder, updatedBy) {
    const menu = await Menu.findByPk(id);
    if (!menu) return null;

    await menu.update({
      displayOrder,
      updatedBy
    });

    return menu;
  }

  // Reorder menus
  static async reorderMenus(parentId, menuOrders, updatedBy) {
    const updates = menuOrders.map(({ id, displayOrder }) => 
      Menu.update(
        { displayOrder, updatedBy },
        { where: { id, parentId } }
      )
    );

    await Promise.all(updates);

    return await Menu.findAll({
      where: { parentId },
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get sidebar menu for user
  static async getSidebarMenu(userId) {
    const userMenus = await this.getUserMenus(userId, false);
    
    // Filter only visible sidebar menus
    const sidebarMenus = userMenus.filter(menu => 
      menu.isVisible && (menu.type === 'menu' || menu.type === 'submenu')
    );

    return this.buildHierarchy(sidebarMenus);
  }

  // Get breadcrumb trail
  static async getMenuBreadcrumb(menuId) {
    const breadcrumb = [];
    let currentMenu = await Menu.findByPk(menuId);

    while (currentMenu) {
      breadcrumb.unshift({
        id: currentMenu.id,
        name: currentMenu.name,
        path: currentMenu.path
      });

      if (currentMenu.parentId) {
        currentMenu = await Menu.findByPk(currentMenu.parentId);
      } else {
        break;
      }
    }

    return breadcrumb;
  }

  // Get menu statistics
  static async getMenuStatistics() {
    const [
      totalMenus,
      activeMenus,
      rootMenus,
      menusByLevel
    ] = await Promise.all([
      Menu.count(),
      Menu.count({ where: { isActive: true } }),
      Menu.count({ where: { parentId: null } }),
      Menu.findAll({
        attributes: [
          'level',
          [Menu.sequelize.fn('COUNT', Menu.sequelize.col('id')), 'count']
        ],
        group: ['level'],
        order: [['level', 'ASC']]
      })
    ]);

    return {
      totalMenus,
      activeMenus,
      inactiveMenus: totalMenus - activeMenus,
      rootMenus,
      menusByLevel: menusByLevel.map(item => ({
        level: item.level,
        count: parseInt(item.dataValues.count)
      }))
    };
  }

  // Assign menu permissions
  static async assignMenuPermissions(menuId, roleIds, assignedBy) {
    const menu = await Menu.findByPk(menuId);
    if (!menu) throw new Error('Menu not found');

    // Remove existing permissions
    await RoleMenu.destroy({ where: { menuId } });

    // Add new permissions
    const permissions = roleIds.map(roleId => ({
      menuId,
      roleId,
      createdBy: assignedBy,
      updatedBy: assignedBy
    }));

    await RoleMenu.bulkCreate(permissions);

    return await this.getMenuById(menuId);
  }

  // Remove menu permission
  static async removeMenuPermission(menuId, roleId) {
    const deleted = await RoleMenu.destroy({
      where: { menuId, roleId }
    });

    return deleted > 0;
  }

  // Get menu permissions
  static async getMenuPermissions(menuId) {
    return await RoleMenu.findAll({
      where: { menuId },
      include: [{
        model: Role,
        attributes: ['id', 'name']
      }]
    });
  }

  // Check if user has menu access
  static async hasMenuAccess(userId, menuPath) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'roles',
        include: [{
          model: Menu,
          as: 'menus',
          where: { 
            path: menuPath,
            isActive: true 
          },
          required: false
        }]
      }]
    });

    if (!user) return false;

    return user.roles.some(role => 
      role.menus.some(menu => menu.path === menuPath)
    );
  }

}

module.exports = MenuService;