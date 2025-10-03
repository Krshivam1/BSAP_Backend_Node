const StateService = require('../services/stateService');

async function search(req, res) {
  try {
    const { page = 1, limit = 10, status, search, sortBy, sortOrder } = req.query;
    
    console.log('State search request:', { page, limit, status, search, sortBy, sortOrder });

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: search || '',
      status,
      sortBy: sortBy || 'stateName',
      sortOrder: sortOrder || 'ASC'
    };

    const result = await StateService.getAllStates(options);
    
    res.json({
      status: 'SUCCESS',
      message: search ? 'States search completed' : 'States retrieved successfully',
      data: result.states,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error) {
    console.error('State search error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to search states',
      error: error.message
    });
  }
}

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

async function create(req, res) {
  try {
    const stateData = {
      stateName: req.body.stateName || req.body.state_name,
      stateDescription: req.body.stateDescription || req.body.state_description,
      active: req.body.active !== undefined ? req.body.active : true,
      createdBy: req.user?.id || 1,
      updatedBy: req.user?.id || 1
    };

    if (!stateData.stateName) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'State name is required'
      });
    }

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
        message: 'State with this name already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create state',
      error: error.message
    });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    
    const stateData = {
      ...req.body,
      updatedBy: req.user?.id || 1
    };

    if (req.body.state_name) stateData.stateName = req.body.state_name;
    if (req.body.state_description) stateData.stateDescription = req.body.state_description;

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
        message: 'State with this name already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update state',
      error: error.message
    });
  }
}

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

async function activate(req, res) {
  try {
    const { id } = req.params;
    const state = await StateService.activateState(id, req.user?.id || 1);
    
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

async function deactivate(req, res) {
  try {
    const { id } = req.params;
    const state = await StateService.deactivateState(id, req.user?.id || 1);
    
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

async function toggleStatus(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const state = await StateService.toggleStateStatus(id, active);
    
    if (!state) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'State not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: `State ${active ? 'activated' : 'deactivated'} successfully`,
      data: state
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to toggle state status',
      error: error.message
    });
  }
}

module.exports = {
  search,
  detail,
  create,
  update,
  remove,
  active,
  activate,
  deactivate,
  toggleStatus
};