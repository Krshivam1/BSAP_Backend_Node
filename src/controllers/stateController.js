const StateService = require('../services/stateService');

// GET /api/states - Get all states with pagination
async function list(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      search 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search
    };

    const result = await StateService.getAllStates(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'States retrieved successfully',
      data: result.states,
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
      message: 'Failed to retrieve states',
      error: error.message
    });
  }
}

// GET /api/states/:id - Get state by ID
async function detail(req, res) {
  try {
    const { id } = req.params;
    const state = await StateService.getStateById(id);
    
    if (!state) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'State not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'State retrieved successfully',
      data: state
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve state',
      error: error.message
    });
  }
}

// POST /api/states - Create new state
async function create(req, res) {
  try {
    const stateData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const state = await StateService.createState(stateData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'State created successfully',
      data: state
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'State with this name or code already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create state',
      error: error.message
    });
  }
}

// PUT /api/states/:id - Update state
async function update(req, res) {
  try {
    const { id } = req.params;
    const stateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const state = await StateService.updateState(id, stateData);
    
    if (!state) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'State not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'State updated successfully',
      data: state
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'State with this name or code already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update state',
      error: error.message
    });
  }
}

// DELETE /api/states/:id - Delete state
async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await StateService.deleteState(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'State not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'State deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete state',
      error: error.message
    });
  }
}

// GET /api/states/search/:searchTerm - Search states
async function search(req, res) {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm
    };

    const result = await StateService.searchStates(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'States search completed',
      data: result.states,
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
      message: 'Failed to search states',
      error: error.message
    });
  }
}

// GET /api/states/:id/districts - Get districts by state
async function districts(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await StateService.getDistrictsByState(id, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Districts retrieved successfully',
      data: result.districts,
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
      message: 'Failed to retrieve districts',
      error: error.message
    });
  }
}

// GET /api/states/active - Get all active states
async function active(req, res) {
  try {
    const states = await StateService.getActiveStates();
    
    res.json({
      status: 'SUCCESS',
      message: 'Active states retrieved successfully',
      data: states
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active states',
      error: error.message
    });
  }
}

// POST /api/states/:id/activate - Activate state
async function activate(req, res) {
  try {
    const { id } = req.params;
    const state = await StateService.activateState(id, req.user.id);
    
    if (!state) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'State not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'State activated successfully',
      data: state
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate state',
      error: error.message
    });
  }
}

// POST /api/states/:id/deactivate - Deactivate state
async function deactivate(req, res) {
  try {
    const { id } = req.params;
    const state = await StateService.deactivateState(id, req.user.id);
    
    if (!state) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'State not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'State deactivated successfully',
      data: state
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate state',
      error: error.message
    });
  }
}

// GET /api/states/statistics - Get state statistics
async function stats(req, res) {
  try {
    const statistics = await StateService.getStateStatistics();
    
    res.json({
      status: 'SUCCESS',
      message: 'State statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve state statistics',
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
  search,
  districts,
  active,
  activate,
  deactivate,
  stats
};
