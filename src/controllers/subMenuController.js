const SubMenuService = require('../services/subMenuService');

// GET /api/sub-menus - Get all sub-menus with pagination
async function list(req, res) {
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
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search,
      status,
      menuId,
      parentId
    };

    const result = await SubMenuService.getAllSubMenus(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-menus retrieved successfully',
      data: result.subMenus,
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
      message: 'Failed to retrieve sub-menus',
      error: error.message
    });
  }
}

// GET /api/sub-menus/:id - Get sub-menu by ID
async function detail(req, res) {
  try {
    const { id } = req.params;
    const subMenu = await SubMenuService.getSubMenuById(id);
    
    if (!subMenu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-menu retrieved successfully',
      data: subMenu
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve sub-menu',
      error: error.message
    });
  }
}

// POST /api/sub-menus - Create new sub-menu
async function create(req, res) {
  try {
    const subMenuData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const subMenu = await SubMenuService.createSubMenu(subMenuData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Sub-menu created successfully',
      data: subMenu
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Sub-menu with this name or URL already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create sub-menu',
      error: error.message
    });
  }
}

// PUT /api/sub-menus/:id - Update sub-menu
async function update(req, res) {
  try {
    const { id } = req.params;
    const subMenuData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const subMenu = await SubMenuService.updateSubMenu(id, subMenuData);
    
    if (!subMenu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-menu updated successfully',
      data: subMenu
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Sub-menu with this name or URL already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update sub-menu',
      error: error.message
    });
  }
}

// DELETE /api/sub-menus/:id - Delete sub-menu
async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await SubMenuService.deleteSubMenu(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-menu deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete sub-menu',
      error: error.message
    });
  }
}

// GET /api/sub-menus/active - Get active sub-menus
async function active(req, res) {
  try {
    const { menuId, parentId } = req.query;
    const subMenus = await SubMenuService.getActiveSubMenus(menuId, parentId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Active sub-menus retrieved successfully',
      data: subMenus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active sub-menus',
      error: error.message
    });
  }
}

// GET /api/sub-menus/search/:searchTerm - Search sub-menus
async function search(req, res) {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 10, status, menuId, parentId } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm,
      status,
      menuId,
      parentId
    };

    const result = await SubMenuService.searchSubMenus(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-menus search completed',
      data: result.subMenus,
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
      message: 'Failed to search sub-menus',
      error: error.message
    });
  }
}

// GET /api/sub-menus/by-menu/:menuId - Get sub-menus by menu
async function byMenu(req, res) {
  try {
    const { menuId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'priority', 
      sortOrder = 'ASC',
      status
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      status
    };

    const result = await SubMenuService.getSubMenusByMenu(menuId, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-menus by menu retrieved successfully',
      data: result.subMenus,
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
      message: 'Failed to retrieve sub-menus by menu',
      error: error.message
    });
  }
}

// GET /api/sub-menus/by-parent/:parentId - Get sub-menus by parent
async function byParent(req, res) {
  try {
    const { parentId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'priority', 
      sortOrder = 'ASC',
      status
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      status
    };

    const result = await SubMenuService.getSubMenusByParent(parentId, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-menus by parent retrieved successfully',
      data: result.subMenus,
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
      message: 'Failed to retrieve sub-menus by parent',
      error: error.message
    });
  }
}

// POST /api/sub-menus/:id/activate - Activate sub-menu
async function activate(req, res) {
  try {
    const { id } = req.params;
    const subMenu = await SubMenuService.activateSubMenu(id, req.user.id);
    
    if (!subMenu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-menu activated successfully',
      data: subMenu
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate sub-menu',
      error: error.message
    });
  }
}

// POST /api/sub-menus/:id/deactivate - Deactivate sub-menu
async function deactivate(req, res) {
  try {
    const { id } = req.params;
    const subMenu = await SubMenuService.deactivateSubMenu(id, req.user.id);
    
    if (!subMenu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-menu deactivated successfully',
      data: subMenu
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate sub-menu',
      error: error.message
    });
  }
}

// PUT /api/sub-menus/:id/order - Update sub-menu priority
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    
    if (typeof priority !== 'number') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Priority must be a number'
      });
    }

    const subMenu = await SubMenuService.updateSubMenuOrder(id, priority, req.user.id);
    
    if (!subMenu) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-menu not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-menu priority updated successfully',
      data: subMenu
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update sub-menu priority',
      error: error.message
    });
  }
}

module.exports = {
  list,
  detail,
  create,
  update,
  remove,
  active,
  search,
  byMenu,
  byParent,
  activate,
  deactivate,
  updateOrder
};