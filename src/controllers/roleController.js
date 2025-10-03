const RoleService = require('../services/roleService');

// GET /api/roles - Get all roles with pagination
async function list(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'roleName', 
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

    const result = await RoleService.getAllRoles(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Roles retrieved successfully',
      data: result.roles,
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
      message: 'Failed to retrieve roles',
      error: error.message
    });
  }
}

// GET /api/roles/:id - Get role by ID
async function detail(req, res) {
  try {
    const { id } = req.params;
    const role = await RoleService.getRoleById(id);
    
    if (!role) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Role not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Role retrieved successfully',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve role',
      error: error.message
    });
  }
}

// POST /api/roles - Create new role
async function create(req, res) {
  try {
    const roleData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const role = await RoleService.createRole(roleData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Role with this name already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create role',
      error: error.message
    });
  }
}

// PUT /api/roles/:id - Update role
async function update(req, res) {
  try {
    const { id } = req.params;
    const roleData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const role = await RoleService.updateRole(id, roleData);
    
    if (!role) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Role not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Role with this name already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update role',
      error: error.message
    });
  }
}

// DELETE /api/roles/:id - Delete role
async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await RoleService.deleteRole(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Role not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete role',
      error: error.message
    });
  }
}

// GET /api/roles/active - Get active roles
async function active(req, res) {
  try {
    const roles = await RoleService.getActiveRoles();
    
    res.json({
      status: 'SUCCESS',
      message: 'Active roles retrieved successfully',
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active roles',
      error: error.message
    });
  }
}

// GET /api/roles/search/:searchTerm - Search roles
async function search(req, res) {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm,
      status
    };

    const result = await RoleService.searchRoles(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Roles search completed',
      data: result.roles,
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
      message: 'Failed to search roles',
      error: error.message
    });
  }
}

// POST /api/roles/:id/activate - Activate role
async function activate(req, res) {
  try {
    const { id } = req.params;
    const role = await RoleService.activateRole(id, req.user.id);
    
    if (!role) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Role not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Role activated successfully',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate role',
      error: error.message
    });
  }
}

// POST /api/roles/:id/deactivate - Deactivate role
async function deactivate(req, res) {
  try {
    const { id } = req.params;
    const role = await RoleService.deactivateRole(id, req.user.id);
    
    if (!role) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Role not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Role deactivated successfully',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate role',
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
  activate,
  deactivate
};