const ModuleService = require('../services/moduleService');

// GET /api/modules - Get all modules with pagination
async function list(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
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

    const result = await ModuleService.getAllModules(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Modules retrieved successfully',
      data: result.modules,
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
      message: 'Failed to retrieve modules',
      error: error.message
    });
  }
}

// GET /api/modules/:id - Get module by ID
async function detail(req, res) {
  try {
    const { id } = req.params;
    const module = await ModuleService.getModuleById(id);
    
    if (!module) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Module not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Module retrieved successfully',
      data: module
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve module',
      error: error.message
    });
  }
}

// POST /api/modules - Create new module
async function create(req, res) {
  try {
    const moduleData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const module = await ModuleService.createModule(moduleData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Module created successfully',
      data: module
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Module with this name or code already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create module',
      error: error.message
    });
  }
}

// PUT /api/modules/:id - Update module
async function update(req, res) {
  try {
    const { id } = req.params;
    const moduleData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const module = await ModuleService.updateModule(id, moduleData);
    
    if (!module) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Module not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Module updated successfully',
      data: module
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Module with this name or code already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update module',
      error: error.message
    });
  }
}

// DELETE /api/modules/:id - Delete module
async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await ModuleService.deleteModule(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Module not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Module deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete module',
      error: error.message
    });
  }
}

// GET /api/modules/:id/topics - Get topics by module
async function topics(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    };

    const result = await ModuleService.getTopicsByModule(id, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Module topics retrieved successfully',
      data: result.topics,
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
      message: 'Failed to retrieve module topics',
      error: error.message
    });
  }
}

// GET /api/modules/search/:searchTerm - Search modules
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

    const result = await ModuleService.searchModules(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Modules search completed',
      data: result.modules,
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
      message: 'Failed to search modules',
      error: error.message
    });
  }
}

// GET /api/modules/active - Get all active modules
async function active(req, res) {
  try {
    const modules = await ModuleService.getActiveModules();
    
    res.json({
      status: 'SUCCESS',
      message: 'Active modules retrieved successfully',
      data: modules
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active modules',
      error: error.message
    });
  }
}

// POST /api/modules/:id/activate - Activate module
async function activate(req, res) {
  try {
    const { id } = req.params;
    const module = await ModuleService.activateModule(id, req.user.id);
    
    if (!module) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Module not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Module activated successfully',
      data: module
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate module',
      error: error.message
    });
  }
}

// POST /api/modules/:id/deactivate - Deactivate module
async function deactivate(req, res) {
  try {
    const { id } = req.params;
    const module = await ModuleService.deactivateModule(id, req.user.id);
    
    if (!module) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Module not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Module deactivated successfully',
      data: module
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate module',
      error: error.message
    });
  }
}

// GET /api/modules/statistics - Get module statistics
async function stats(req, res) {
  try {
    const statistics = await ModuleService.getModuleStatistics();
    
    res.json({
      status: 'SUCCESS',
      message: 'Module statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve module statistics',
      error: error.message
    });
  }
}

// PUT /api/modules/:id/order - Update module display order
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;
    
    if (typeof displayOrder !== 'number') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Display order must be a number'
      });
    }

    const module = await ModuleService.updateModuleOrder(id, displayOrder, req.user.id);
    
    if (!module) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Module not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Module order updated successfully',
      data: module
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update module order',
      error: error.message
    });
  }
}

// GET /api/modules/:id/permissions - Get module permissions
async function permissions(req, res) {
  try {
    const { id } = req.params;
    const permissions = await ModuleService.getModulePermissions(id);
    
    res.json({
      status: 'SUCCESS',
      message: 'Module permissions retrieved successfully',
      data: permissions
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve module permissions',
      error: error.message
    });
  }
}

// POST /api/modules/:id/clone - Clone module
async function clone(req, res) {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Name and code are required for cloning'
      });
    }

    const clonedModule = await ModuleService.cloneModule(id, {
      name,
      code,
      description,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    if (!clonedModule) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Module not found'
      });
    }

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Module cloned successfully',
      data: clonedModule
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Module with this name or code already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to clone module',
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
  topics,
  search,
  active,
  activate,
  deactivate,
  stats,
  updateOrder,
  permissions,
  clone
};
