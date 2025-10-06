const BattalionService = require('../services/battalionService');

// GET /api/battalions - Get all battalions with filtering and pagination
async function getAllBattalions(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      rangeId, 
      districtId,
      sortBy = 'battalionName',
      sortOrder = 'ASC'
    } = req.query;

    console.log('Battalion search request:', { page, limit, search, status, rangeId, districtId, sortBy, sortOrder });

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: search || '',
      status,
      rangeId: rangeId ? parseInt(rangeId) : undefined,
      districtId: districtId ? parseInt(districtId) : undefined,
      sortBy,
      sortOrder
    };

    const result = await BattalionService.getAllBattalions(options);
    
    res.json({
      status: 'SUCCESS',
      message: search ? 'Battalions search completed' : 'Battalions retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Battalion search error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve battalions',
      error: error.message
    });
  }
}

// GET /api/battalions/:id - Get battalion by ID
async function getBattalionById(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Valid battalion ID is required'
      });
    }

    const battalion = await BattalionService.getBattalionById(parseInt(id));
    
    res.json({
      status: 'SUCCESS',
      message: 'Battalion retrieved successfully',
      data: battalion
    });
  } catch (error) {
    console.error('Get battalion error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Battalion not found'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve battalion',
      error: error.message
    });
  }
}

// POST /api/battalions - Create new battalion
async function createBattalion(req, res) {
  try {
    const battalionData = req.body;
    const createdBy = req.user?.id || 1; // Get from auth middleware
    
    // Validate required fields
    if (!battalionData.battalionName) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Battalion name is required'
      });
    }

    console.log('Creating battalion:', battalionData);

    const battalion = await BattalionService.createBattalion(battalionData, createdBy);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Battalion created successfully',
      data: battalion
    });
  } catch (error) {
    console.error('Create battalion error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        status: 'ERROR',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create battalion',
      error: error.message
    });
  }
}

// PUT /api/battalions/:id - Update battalion
async function updateBattalion(req, res) {
  try {
    const { id } = req.params;
    const battalionData = req.body;
    const updatedBy = req.user?.id || 1; // Get from auth middleware
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Valid battalion ID is required'
      });
    }

    console.log('Updating battalion:', id, battalionData);

    const battalion = await BattalionService.updateBattalion(parseInt(id), battalionData, updatedBy);
    
    res.json({
      status: 'SUCCESS',
      message: 'Battalion updated successfully',
      data: battalion
    });
  } catch (error) {
    console.error('Update battalion error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Battalion not found'
      });
    }
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        status: 'ERROR',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update battalion',
      error: error.message
    });
  }
}

// DELETE /api/battalions/:id - Delete battalion (soft delete)
async function deleteBattalion(req, res) {
  try {
    const { id } = req.params;
    const deletedBy = req.user?.id || 1; // Get from auth middleware
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Valid battalion ID is required'
      });
    }

    console.log('Deleting battalion:', id);

    const result = await BattalionService.deleteBattalion(parseInt(id), deletedBy);
    
    res.json({
      status: 'SUCCESS',
      message: result.message
    });
  } catch (error) {
    console.error('Delete battalion error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Battalion not found'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete battalion',
      error: error.message
    });
  }
}

// PATCH /api/battalions/:id/toggle-status - Toggle battalion status
async function toggleBattalionStatus(req, res) {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || 1; // Get from auth middleware
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Valid battalion ID is required'
      });
    }

    console.log('Toggling battalion status:', id);

    const battalion = await BattalionService.toggleBattalionStatus(parseInt(id), updatedBy);
    
    res.json({
      status: 'SUCCESS',
      message: 'Battalion status toggled successfully',
      data: battalion
    });
  } catch (error) {
    console.error('Toggle battalion status error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Battalion not found'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to toggle battalion status',
      error: error.message
    });
  }
}

// GET /api/battalions/by-range/:rangeId - Get battalions by range
async function getBattalionsByRange(req, res) {
  try {
    const { rangeId } = req.params;
    
    if (!rangeId || isNaN(rangeId)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Valid range ID is required'
      });
    }

    const battalions = await BattalionService.getBattalionsByRange(parseInt(rangeId));
    
    res.json({
      status: 'SUCCESS',
      message: 'Battalions by range retrieved successfully',
      data: battalions
    });
  } catch (error) {
    console.error('Get battalions by range error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve battalions by range',
      error: error.message
    });
  }
}

// GET /api/battalions/by-district/:districtId - Get battalions by district
async function getBattalionsByDistrict(req, res) {
  try {
    const { districtId } = req.params;
    
    if (!districtId || isNaN(districtId)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Valid district ID is required'
      });
    }

    const battalions = await BattalionService.getBattalionsByDistrict(parseInt(districtId));
    
    res.json({
      status: 'SUCCESS',
      message: 'Battalions by district retrieved successfully',
      data: battalions
    });
  } catch (error) {
    console.error('Get battalions by district error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve battalions by district',
      error: error.message
    });
  }
}

module.exports = {
  getAllBattalions,
  getBattalionById,
  createBattalion,
  updateBattalion,
  deleteBattalion,
  toggleBattalionStatus,
  getBattalionsByRange,
  getBattalionsByDistrict
};