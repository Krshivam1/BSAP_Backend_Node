const DistrictService = require('../services/districtService');

// GET /api/districts - Get all districts with pagination
async function list(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      search,
      stateId 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search,
      stateId
    };

    const result = await DistrictService.getAllDistricts(options);
    
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

// GET /api/districts/:id - Get district by ID
async function detail(req, res) {
  try {
    const { id } = req.params;
    const district = await DistrictService.getDistrictById(id);
    
    if (!district) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'District not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'District retrieved successfully',
      data: district
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve district',
      error: error.message
    });
  }
}

// POST /api/districts - Create new district
async function create(req, res) {
  try {
    const districtData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const district = await DistrictService.createDistrict(districtData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'District created successfully',
      data: district
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'District with this name or code already exists in this state'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create district',
      error: error.message
    });
  }
}

// PUT /api/districts/:id - Update district
async function update(req, res) {
  try {
    const { id } = req.params;
    const districtData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const district = await DistrictService.updateDistrict(id, districtData);
    
    if (!district) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'District not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'District updated successfully',
      data: district
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'District with this name or code already exists in this state'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update district',
      error: error.message
    });
  }
}

// DELETE /api/districts/:id - Delete district
async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await DistrictService.deleteDistrict(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'District not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'District deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete district',
      error: error.message
    });
  }
}

// GET /api/districts/by-state/:stateId - Get districts by state
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

    const result = await DistrictService.getDistrictsByState(stateId, options);
    
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

// GET /api/districts/search/:searchTerm - Search districts
async function search(req, res) {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 10, stateId } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm,
      stateId
    };

    const result = await DistrictService.searchDistricts(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Districts search completed',
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
      message: 'Failed to search districts',
      error: error.message
    });
  }
}

// GET /api/districts/:id/police-stations - Get police stations by district
async function policeStations(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await DistrictService.getPoliceStationsByDistrict(id, options);
    
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

// GET /api/districts/:id/sub-divisions - Get sub-divisions by district
async function subDivisions(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await DistrictService.getSubDivisionsByDistrict(id, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-divisions retrieved successfully',
      data: result.subDivisions,
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
      message: 'Failed to retrieve sub-divisions',
      error: error.message
    });
  }
}

// GET /api/districts/active - Get all active districts
async function active(req, res) {
  try {
    const { stateId } = req.query;
    const districts = await DistrictService.getActiveDistricts(stateId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Active districts retrieved successfully',
      data: districts
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active districts',
      error: error.message
    });
  }
}

// POST /api/districts/:id/activate - Activate district
async function activate(req, res) {
  try {
    const { id } = req.params;
    const district = await DistrictService.activateDistrict(id, req.user.id);
    
    if (!district) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'District not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'District activated successfully',
      data: district
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate district',
      error: error.message
    });
  }
}

// POST /api/districts/:id/deactivate - Deactivate district
async function deactivate(req, res) {
  try {
    const { id } = req.params;
    const district = await DistrictService.deactivateDistrict(id, req.user.id);
    
    if (!district) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'District not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'District deactivated successfully',
      data: district
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate district',
      error: error.message
    });
  }
}

// GET /api/districts/statistics - Get district statistics
async function stats(req, res) {
  try {
    const { stateId } = req.query;
    const statistics = await DistrictService.getDistrictStatistics(stateId);
    
    res.json({
      status: 'SUCCESS',
      message: 'District statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve district statistics',
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
  byState,
  search,
  policeStations,
  subDivisions,
  active,
  activate,
  deactivate,
  stats
};