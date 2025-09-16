const express = require('express');
const router = express.Router();
const MenuService = require('../services/menuService');
const { authenticate } = require('../middleware/auth');
const { validateMenu, validatePagination } = require('../middleware/validationMiddleware');

// GET /api/menus - Get all menus with pagination
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'displayOrder', 
      sortOrder = 'ASC',
      search,
      status,
      parentId 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search,
      status,
      parentId
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
});

// GET /api/menus/:id - Get menu by ID
router.get('/:id', authenticate, async (req, res) => {
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
});

// POST /api/menus - Create new menu
router.post('/', authenticate, validateMenu, async (req, res) => {
  try {
    const menuData = {
      ...req.body,
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
});

// PUT /api/menus/:id - Update menu
router.put('/:id', authenticate, validateMenu, async (req, res) => {
  try {
    const { id } = req.params;
    const menuData = {
      ...req.body,
      updatedBy: req.user.id
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
});

// DELETE /api/menus/:id - Delete menu
router.delete('/:id', authenticate, async (req, res) => {
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
});

// GET /api/menus/hierarchy - Get menu hierarchy
router.get('/structure/hierarchy', authenticate, async (req, res) => {
  try {
    const { roleId } = req.query;
    const menus = await MenuService.getMenuHierarchy(roleId);
    
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
});

// GET /api/menus/user/:userId - Get user-specific menus
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const menus = await MenuService.getUserMenus(userId);
    
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
});

// GET /api/menus/role/:roleId - Get role-specific menus
router.get('/role/:roleId', authenticate, async (req, res) => {
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
});

// GET /api/menus/parent/:parentId - Get child menus
router.get('/parent/:parentId', authenticate, validatePagination, async (req, res) => {
  try {
    const { parentId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'displayOrder', 
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
});

// GET /api/menus/root - Get root menus
router.get('/level/root', authenticate, async (req, res) => {
  try {
    const { roleId } = req.query;
    const menus = await MenuService.getRootMenus(roleId);
    
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
});

// GET /api/menus/search/:searchTerm - Search menus
router.get('/search/:searchTerm', authenticate, validatePagination, async (req, res) => {
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
});

// GET /api/menus/active - Get all active menus
router.get('/status/active', authenticate, async (req, res) => {
  try {
    const { roleId, parentId } = req.query;
    const menus = await MenuService.getActiveMenus(roleId, parentId);
    
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
});

// POST /api/menus/:id/activate - Activate menu
router.post('/:id/activate', authenticate, async (req, res) => {
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
});

// POST /api/menus/:id/deactivate - Deactivate menu
router.post('/:id/deactivate', authenticate, async (req, res) => {
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
});

// PUT /api/menus/:id/order - Update menu display order
router.put('/:id/order', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;
    
    if (typeof displayOrder !== 'number') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Display order must be a number'
      });
    }

    const menu = await MenuService.updateMenuOrder(id, displayOrder, req.user.id);
    
    if (!menu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Menu order updated successfully',
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update menu order',
      error: error.message
    });
  }
});

// PUT /api/menus/reorder - Reorder menus
router.put('/reorder', authenticate, async (req, res) => {
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
});

// GET /api/menus/sidebar/:userId - Get sidebar menu for user
router.get('/sidebar/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const sidebarMenu = await MenuService.getSidebarMenuForUser(userId);
    
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
});

// GET /api/menus/breadcrumb/:menuId - Get breadcrumb for menu
router.get('/breadcrumb/:menuId', authenticate, async (req, res) => {
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
});

// GET /api/menus/statistics - Get menu statistics
router.get('/stats/overview', authenticate, async (req, res) => {
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
});

// POST /api/menus/:id/permissions - Assign permissions to menu
router.post('/:id/permissions', authenticate, async (req, res) => {
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
});

// DELETE /api/menus/:id/permissions/:roleId - Remove menu permission
router.delete('/:id/permissions/:roleId', authenticate, async (req, res) => {
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
});

module.exports = router;
