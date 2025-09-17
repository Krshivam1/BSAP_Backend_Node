const RangeService = require('../services/rangeService');

// GET /api/ranges - Get all ranges with pagination
async function list(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      search,
      districtId,
      stateId 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search,
      districtId,
      stateId
    };

    const result = await RangeService.getAllRanges(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Ranges retrieved successfully',
      data: result.ranges,
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
      message: 'Failed to retrieve ranges',
      error: error.message
    });
  }
}

// GET /api/ranges/:id - Get range by ID
async function detail(req, res) {
  try {
    const { id } = req.params;
    const range = await RangeService.getRangeById(id);
    
    if (!range) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Range not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Range retrieved successfully',
      data: range
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve range',
      error: error.message
    });
  }
}

// POST /api/ranges - Create new range
async function create(req, res) {
  try {
    const rangeData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const range = await RangeService.createRange(rangeData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Range created successfully',
      data: range
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Range with this name or code already exists in this district'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create range',
      error: error.message
    });
  }
}

// PUT /api/ranges/:id - Update range
async function update(req, res) {
  try {
    const { id } = req.params;
    const rangeData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const range = await RangeService.updateRange(id, rangeData);
    
    if (!range) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Range not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Range updated successfully',
      data: range
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Range with this name or code already exists in this district'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update range',
      error: error.message
    });
  }
}

// DELETE /api/ranges/:id - Delete range
async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await RangeService.deleteRange(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Range not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Range deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete range',
      error: error.message
    });
  }
}

// GET /api/ranges/by-district/:districtId - Get ranges by district
async function byDistrict(req, res) {
  try {
    const { districtId } = req.params;
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    };

    const result = await RangeService.getRangesByDistrict(districtId, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Ranges retrieved successfully',
      data: result.ranges,
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
      message: 'Failed to retrieve ranges',
      error: error.message
    });
  }
}

// GET /api/ranges/by-state/:stateId - Get ranges by state
async function byState(req, res) {
  try {
    const { stateId } = req.params;
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    };

    const result = await RangeService.getRangesByState(stateId, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Ranges retrieved successfully',
      data: result.ranges,
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
      message: 'Failed to retrieve ranges',
      error: error.message
    });
  }
}

// GET /api/ranges/search/:searchTerm - Search ranges
async function search(req, res) {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 10, districtId, stateId } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm,
      districtId,
      stateId
    };

    const result = await RangeService.searchRanges(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Ranges search completed',
      data: result.ranges,
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
      message: 'Failed to search ranges',
      error: error.message
    });
  }
}

// GET /api/ranges/:id/police-stations - Get police stations by range
async function policeStations(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await RangeService.getPoliceStationsByRange(id, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Police stations retrieved successfully',
      data: result.policeStations,
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
      message: 'Failed to retrieve police stations',
      error: error.message
    });
  }
}

// GET /api/ranges/active - Get all active ranges
async function active(req, res) {
  try {
    const { districtId, stateId } = req.query;
    const ranges = await RangeService.getActiveRanges(districtId, stateId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Active ranges retrieved successfully',
      data: ranges
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active ranges',
      error: error.message
    });
  }
}

// POST /api/ranges/:id/activate - Activate range
async function activate(req, res) {
  try {
    const { id } = req.params;
    const range = await RangeService.activateRange(id, req.user.id);
    
    if (!range) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Range not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Range activated successfully',
      data: range
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate range',
      error: error.message
    });
  }
}

// POST /api/ranges/:id/deactivate - Deactivate range
async function deactivate(req, res) {
  try {
    const { id } = req.params;
    const range = await RangeService.deactivateRange(id, req.user.id);
    
    if (!range) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Range not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Range deactivated successfully',
      data: range
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate range',
      error: error.message
    });
  }
}

// GET /api/ranges/statistics - Get range statistics
async function stats(req, res) {
  try {
    const { districtId, stateId } = req.query;
    const statistics = await RangeService.getRangeStatistics(districtId, stateId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Range statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve range statistics',
      error: error.message
    });
  }
}

// GET /api/ranges/:id/users - Get users assigned to range
async function users(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await RangeService.getUsersByRange(id, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Range users retrieved successfully',
      data: result.users,
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
      message: 'Failed to retrieve range users',
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
  byDistrict,
  byState,
  search,
  policeStations,
  active,
  activate,
  deactivate,
  stats,
  users
};
