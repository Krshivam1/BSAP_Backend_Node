const PermissionService = require('../services/permissionService');

// GET /api/permissions - Search and list permissions
async function search(req, res) {
  try {
    const { page = 1, limit = 10, status, search, sortBy, sortOrder } = req.query;
    
    console.log('Search request received:', { page, limit, status, search, sortBy, sortOrder });

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: search || '',
      status,
      sortBy: sortBy || 'permissionName',
      sortOrder: sortOrder || 'ASC'
    };

    const result = await PermissionService.searchPermissions(options);
    
    res.json({
      status: 'SUCCESS',
      message: search ? 'Permissions search completed' : 'Permissions retrieved successfully',
      data: result.permissions,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to search permissions',
      error: error.message
    });
  }
}

// GET /api/permissions/list - Alternative list endpoint (if needed)
async function list(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'permissionName', 
      sortOrder = 'ASC',
      search,
      status
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search,
      status
    };

    const result = await PermissionService.getAllPermissions(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Permissions retrieved successfully',
      data: result.permissions,
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
      message: 'Failed to retrieve permissions',
      error: error.message
    });
  }
}

// GET /api/permissions/:id - Get permission by ID
async function detail(req, res) {
  try {
    const { id } = req.params;
    const permission = await PermissionService.getPermissionById(id);
    
    if (!permission) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Permission not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Permission retrieved successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve permission',
      error: error.message
    });
  }
}

// POST /api/permissions - Create new permission
async function create(req, res) {
  try {
    const permissionData = {
      permissionName: req.body.permissionName || req.body.permission_name,
      permissionCode: req.body.permissionCode || req.body.permission_code,
      permissionUrl: req.body.permissionUrl || req.body.permission_url,
      active: req.body.active !== undefined ? req.body.active : true,
      createdBy: req.user?.id || 1, 
      updatedBy: req.user?.id || 1
    };

    // Validate required fields
    if (!permissionData.permissionName) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Permission name is required'
      });
    }

    if (!permissionData.permissionCode) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Permission code is required'
      });
    }

    const permission = await PermissionService.createPermission(permissionData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Permission with this name or code already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create permission',
      error: error.message
    });
  }
}

// PUT /api/permissions/:id - Update permission
async function update(req, res) {
  try {
    const { id } = req.params;
    
    const permissionData = {
      ...req.body,
      updatedBy: req.user?.id || 1
    };

    if (req.body.permission_name) permissionData.permissionName = req.body.permission_name;
    if (req.body.permission_code) permissionData.permissionCode = req.body.permission_code;
    if (req.body.permission_url) permissionData.permissionUrl = req.body.permission_url;

    const permission = await PermissionService.updatePermission(id, permissionData);
    
    if (!permission) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Permission not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Permission updated successfully',
      data: permission
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Permission with this name or code already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update permission',
      error: error.message
    });
  }
}

// DELETE /api/permissions/:id - Delete permission
async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await PermissionService.deletePermission(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Permission not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete permission',
      error: error.message
    });
  }
}

// GET /api/permissions/active - Get active permissions
async function active(req, res) {
  try {
    const permissions = await PermissionService.getActivePermissions();
    
    res.json({
      status: 'SUCCESS',
      message: 'Active permissions retrieved successfully',
      data: permissions
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active permissions',
      error: error.message
    });
  }
}

// GET /api/permissions/by-code/:code - Get permission by code
async function byCode(req, res) {
  try {
    const { code } = req.params;
    const permission = await PermissionService.getPermissionByCode(code);
    
    if (!permission) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Permission not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Permission retrieved successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve permission by code',
      error: error.message
    });
  }
}

// POST /api/permissions/:id/activate - Activate permission
async function activate(req, res) {
  try {
    const { id } = req.params;
    const permission = await PermissionService.activatePermission(id, req.user?.id || 1);
    
    if (!permission) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Permission not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Permission activated successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate permission',
      error: error.message
    });
  }
}

// POST /api/permissions/:id/deactivate - Deactivate permission
async function deactivate(req, res) {
  try {
    const { id } = req.params;
    const permission = await PermissionService.deactivatePermission(id, req.user?.id || 1);
    
    if (!permission) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Permission not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Permission deactivated successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate permission',
      error: error.message
    });
  }
}

async function toggleStatus(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const permission = await PermissionService.togglePermissionStatus(id, active);
    
    if (!permission) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Permission not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: `Permission ${active ? 'activated' : 'deactivated'} successfully`,
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to toggle permission status',
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
  byCode,
  activate,
  deactivate,
  toggleStatus
};