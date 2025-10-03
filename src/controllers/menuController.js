const MenuService = require('../services/menuService');

// GET /api/menus - Get all menus with pagination
async function list(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'priority',  // CHANGE: 'displayOrder' → 'priority'
      sortOrder = 'ASC',
      search,
      status
      // REMOVE: parentId (line 8)
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search,
      status
      // REMOVE: parentId (line 18)
    };
    const result = await MenuService.getAllMenus(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Menus retrieved successfully',
      data: result.menus,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve menus',
      error: error.message
    });
  }
}

// GET /api/menus/:id - Get menu by ID
async function detail(req, res) {
  try {
    const { id } = req.params;
    const menu = await MenuService.getMenuById(id);
    
    if (!menu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Menu retrieved successfully',
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve menu',
      error: error.message
    });
  }
}

// POST /api/menus - Create new menu
async function create(req, res) {
  try {
    const menuData = {
      menuName: req.body.menu_name || req.body.menuName,  
      menuUrl: req.body.menu_url || req.body.menuUrl,   
      priority: req.body.priority || 0,
      active: req.body.active !== undefined ? req.body.active : true,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const menu = await MenuService.createMenu(menuData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Menu created successfully',
      data: menu
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Menu with this name or URL already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create menu',
      error: error.message
    });
  }
}

// PUT /api/menus/:id - Update menu
async function update(req, res) {
  try {
    const { id } = req.params;
    const menuData = {
      ...req.body,
      updated_by: req.user.id  // CHANGE: updatedBy → updated_by
    };

    const menu = await MenuService.updateMenu(id, menuData);
    
    if (!menu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Menu updated successfully',
      data: menu
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Menu with this name or URL already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update menu',
      error: error.message
    });
  }
}

// DELETE /api/menus/:id - Delete menu
async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await MenuService.deleteMenu(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Menu deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete menu',
      error: error.message
    });
  }
}

// GET /api/menus/hierarchy - Get menu hierarchy
// COMMENTED OUT: requires associations
/*
async function hierarchy(req, res) {
  try {
    const { status } = req.query;
    const menus = await MenuService.getMenuHierarchy(status);
    
    res.json({
      status: 'SUCCESS',
      message: 'Menu hierarchy retrieved successfully',
      data: menus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve menu hierarchy',
      error: error.message
    });
  }
}
*/

// GET /api/menus/user/:userId - Get user-specific menus
async function userMenus(req, res) {
  try {
    const { userId } = req.params;
    const roleId = req.user.roleId;
    const menus = await MenuService.getUserMenus(roleId);
    res.json({
      status: 'SUCCESS',
      message: 'User menus retrieved successfully',
      data: menus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve user menus',
      error: error.message
    });
  }
}

// GET /api/menus/user - Get menus for current authenticated user
async function userMenusSelf(req, res) {
  try {
    const roleId = req.user.roleId;  // CHANGE: userId → roleId
    const menus = await MenuService.getUserMenus(roleId);
    res.json({
      status: 'SUCCESS',
      message: 'Current user menus retrieved successfully',
      data: menus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve current user menus',
      error: error.message
    });
  }
}

// GET /api/menus/role/:roleId - Get role-specific menus
// COMMENTED OUT: requires associations
/*
async function roleMenus(req, res) {
  try {
    const { roleId } = req.params;
    const menus = await MenuService.getRoleMenus(roleId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Role menus retrieved successfully',
      data: menus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve role menus',
      error: error.message
    });
  }
}
*/

// GET /api/menus/parent/:parentId - Get child menus
async function children(req, res) {
  try {
    const { parentId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'priority',  // CHANGE: 'displayOrder' → 'priority'
      sortOrder = 'ASC' 
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    };

    const result = await MenuService.getChildMenus(parentId, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Child menus retrieved successfully',
      data: result.menus,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve child menus',
      error: error.message
    });
  }
}

// GET /api/menus/root - Get root menus
// COMMENTED OUT: requires associations
/*
async function root(req, res) {
  try {
    const { status } = req.query;
    const menus = await MenuService.getRootMenus(status);
    
    res.json({
      status: 'SUCCESS',
      message: 'Root menus retrieved successfully',
      data: menus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve root menus',
      error: error.message
    });
  }
}
*/

// GET /api/menus/search/:searchTerm - Search menus
async function search(req, res) {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 10, status, roleId } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm,
      status,
      roleId
    };

    const result = await MenuService.searchMenus(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Menus search completed',
      data: result.menus,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to search menus',
      error: error.message
    });
  }
}

// GET /api/menus/active - Get all active menus
async function active(req, res) {
  try {
    const { roleId, parentId } = req.query;
    const menus = await MenuService.getActiveMenus();
    
    res.json({
      status: 'SUCCESS',
      message: 'Active menus retrieved successfully',
      data: menus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active menus',
      error: error.message
    });
  }
}

// POST /api/menus/:id/activate - Activate menu
async function activate(req, res) {
  try {
    const { id } = req.params;
    const menu = await MenuService.activateMenu(id, req.user.id);
    
    if (!menu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Menu activated successfully',
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate menu',
      error: error.message
    });
  }
}

// POST /api/menus/:id/deactivate - Deactivate menu
async function deactivate(req, res) {
  try {
    const { id } = req.params;
    const menu = await MenuService.deactivateMenu(id, req.user.id);
    
    if (!menu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Menu deactivated successfully',
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate menu',
      error: error.message
    });
  }
}

// PUT /api/menus/:id/order - Update menu display order
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { priority } = req.body;  // CHANGE: displayOrder → priority
    
    if (typeof priority !== 'number') {  // CHANGE: displayOrder → priority
      return res.status(400).json({
        status: 'ERROR',
        message: 'Priority must be a number'  // CHANGE message
      });
    }

    const menu = await MenuService.updateMenuOrder(id, priority, req.user.id);  // CHANGE: displayOrder → priority
    
    if (!menu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Menu priority updated successfully',  // CHANGE message
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update menu order',
      error: error.message
    });
  }
}

// PUT /api/menus/reorder - Reorder menus
// COMMENTED OUT: requires associations
/*
async function reorder(req, res) {
  try {
    const { parentId, menuOrders } = req.body;
    
    if (!Array.isArray(menuOrders)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Menu orders array is required'
      });
    }

    const updatedMenus = await MenuService.reorderMenus(parentId, menuOrders, req.user.id);
    
    res.json({
      status: 'SUCCESS',
      message: 'Menus reordered successfully',
      data: updatedMenus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to reorder menus',
      error: error.message
    });
  }
}
*/

// GET /api/menus/sidebar/:userId - Get sidebar menu for user
// COMMENTED OUT: requires associations
/*
async function sidebar(req, res) {
  try {
    const { userId } = req.params;
    const sidebarMenu = await MenuService.getSidebarMenu(userId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sidebar menu retrieved successfully',
      data: sidebarMenu
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve sidebar menu',
      error: error.message
    });
  }
}
*/

// GET /api/menus/breadcrumb/:menuId - Get breadcrumb for menu
// COMMENTED OUT: requires associations
/*
async function breadcrumb(req, res) {
  try {
    const { menuId } = req.params;
    const breadcrumb = await MenuService.getMenuBreadcrumb(menuId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Menu breadcrumb retrieved successfully',
      data: breadcrumb
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve menu breadcrumb',
      error: error.message
    });
  }
}
*/

// GET /api/menus/statistics - Get menu statistics
// COMMENTED OUT: requires associations
/*
async function stats(req, res) {
  try {
    const statistics = await MenuService.getMenuStatistics();
    
    res.json({
      status: 'SUCCESS',
      message: 'Menu statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve menu statistics',
      error: error.message
    });
  }
}
*/

// POST /api/menus/:id/permissions - Assign permissions to menu
// COMMENTED OUT: requires associations
/*
async function assignPermissions(req, res) {
  try {
    const { id } = req.params;
    const { roleIds } = req.body;
    
    if (!Array.isArray(roleIds)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Role IDs array is required'
      });
    }

    const result = await MenuService.assignMenuPermissions(id, roleIds, req.user.id);
    
    res.json({
      status: 'SUCCESS',
      message: 'Menu permissions assigned successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to assign menu permissions',
      error: error.message
    });
  }
}
*/

// DELETE /api/menus/:id/permissions/:roleId - Remove menu permission
// COMMENTED OUT: requires associations
/*
async function removePermission(req, res) {
  try {
    const { id, roleId } = req.params;
    const removed = await MenuService.removeMenuPermission(id, roleId);
    
    if (!removed) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu permission not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Menu permission removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to remove menu permission',
      error: error.message
    });
  }
}
*/

module.exports = {
  list,
  detail,
  create,
  update,
  remove,
  // hierarchy,          // COMMENTED OUT: requires associations
  userMenus,
  userMenusSelf,
  // roleMenus,          // COMMENTED OUT: requires associations
  children,
  // root,               // COMMENTED OUT: requires associations
  search,
  active,
  activate,
  deactivate,
  updateOrder,
  // reorder,            // COMMENTED OUT: requires associations
  // sidebar,            // COMMENTED OUT: requires associations
  // breadcrumb,         // COMMENTED OUT: requires associations
  // stats,              // COMMENTED OUT: requires associations
  // assignPermissions,  // COMMENTED OUT: requires associations
  // removePermission    // COMMENTED OUT: requires associations
};
