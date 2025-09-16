const express = require('express');
const router = express.Router();
const { cidCrimeDataService } = require('../services');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCrimeDataCreate, validateCrimeDataUpdate } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');

/**
 * @route GET /api/cid-crime-data
 * @desc Get all CID crime data with pagination and filtering
 * @access Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      active: req.query.active !== undefined ? req.query.active === 'true' : true,
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
      categoryTypeId: req.query.categoryTypeId ? parseInt(req.query.categoryTypeId) : undefined,
      districtId: req.query.districtId ? parseInt(req.query.districtId) : undefined,
      policeStationId: req.query.policeStationId ? parseInt(req.query.policeStationId) : undefined,
      subDivisionId: req.query.subDivisionId ? parseInt(req.query.subDivisionId) : undefined,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      search: req.query.search
    };

    const result = await cidCrimeDataService.getAllCrimeData(filters);

    res.json({
      status: 'SUCCESS',
      message: 'CID crime data retrieved successfully',
      data: result.data,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });

  } catch (error) {
    logger.error('Error getting CID crime data:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve CID crime data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/cid-crime-data/:id
 * @desc Get CID crime data by ID
 * @access Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const crimeData = await cidCrimeDataService.getCrimeDataById(parseInt(id));

    res.json({
      status: 'SUCCESS',
      message: 'CID crime data retrieved successfully',
      data: crimeData
    });

  } catch (error) {
    logger.error('Error getting CID crime data:', error);
    const statusCode = error.message === 'Crime data not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/cid-crime-data
 * @desc Create new CID crime data
 * @access Private
 */
router.post('/', authMiddleware, validateCrimeDataCreate, async (req, res) => {
  try {
    const crimeData = req.body;
    const createdBy = req.user.id;

    const result = await cidCrimeDataService.createCrimeData(crimeData, createdBy);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'CID crime data created successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error creating CID crime data:', error);
    const statusCode = error.message.includes('already exists') ? 409 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/cid-crime-data/:id
 * @desc Update CID crime data
 * @access Private
 */
router.put('/:id', authMiddleware, validateCrimeDataUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedBy = req.user.id;

    const result = await cidCrimeDataService.updateCrimeData(parseInt(id), updateData, updatedBy);

    res.json({
      status: 'SUCCESS',
      message: 'CID crime data updated successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error updating CID crime data:', error);
    const statusCode = error.message === 'Crime data not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/cid-crime-data/:id
 * @desc Delete CID crime data (soft delete)
 * @access Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user.id;

    const result = await cidCrimeDataService.deleteCrimeData(parseInt(id), deletedBy);

    res.json({
      status: 'SUCCESS',
      message: result.message
    });

  } catch (error) {
    logger.error('Error deleting CID crime data:', error);
    const statusCode = error.message === 'Crime data not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route GET /api/cid-crime-data/statistics
 * @desc Get CID crime statistics
 * @access Private
 */
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const filters = {
      districtId: req.query.districtId ? parseInt(req.query.districtId) : undefined,
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      year: req.query.year ? parseInt(req.query.year) : undefined
    };

    const statistics = await cidCrimeDataService.getCrimeStatistics(filters);

    res.json({
      status: 'SUCCESS',
      message: 'CID crime statistics retrieved successfully',
      data: statistics
    });

  } catch (error) {
    logger.error('Error getting CID crime statistics:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve CID crime statistics',
      error: error.message
    });
  }
});

/**
 * @route GET /api/cid-crime-data/search/:searchTerm
 * @desc Search CID crime data
 * @access Private
 */
router.get('/search/:searchTerm', authMiddleware, async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const filters = {
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
      districtId: req.query.districtId ? parseInt(req.query.districtId) : undefined,
      limit: parseInt(req.query.limit) || 50
    };

    const results = await cidCrimeDataService.searchCrimeData(searchTerm, filters);

    res.json({
      status: 'SUCCESS',
      message: 'Search completed successfully',
      data: results
    });

  } catch (error) {
    logger.error('Error searching CID crime data:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Search failed',
      error: error.message
    });
  }
});

/**
 * @route GET /api/cid-crime-data/by-status/:active
 * @desc Get crimes by active status
 * @access Private
 */
router.get('/by-status/:active', authMiddleware, async (req, res) => {
  try {
    const { active } = req.params;
    const isActive = active === 'true';

    const crimeData = await cidCrimeDataService.getCrimesByActiveStatus(isActive);

    res.json({
      status: 'SUCCESS',
      message: 'Crime data retrieved successfully',
      data: crimeData
    });

  } catch (error) {
    logger.error('Error getting crimes by status:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve crime data',
      error: error.message
    });
  }
});

/**
 * @route POST /api/cid-crime-data/:id/victims
 * @desc Add victim to crime data
 * @access Private
 */
router.post('/:id/victims', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const victimData = req.body;
    const createdBy = req.user.id;

    const victim = await cidCrimeDataService.addVictim(parseInt(id), victimData, createdBy);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Victim added successfully',
      data: victim
    });

  } catch (error) {
    logger.error('Error adding victim:', error);
    const statusCode = error.message === 'Crime data not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/cid-crime-data/:id/accused
 * @desc Add accused to crime data
 * @access Private
 */
router.post('/:id/accused', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const accusedData = req.body;
    const createdBy = req.user.id;

    const accused = await cidCrimeDataService.addAccused(parseInt(id), accusedData, createdBy);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Accused added successfully',
      data: accused
    });

  } catch (error) {
    logger.error('Error adding accused:', error);
    const statusCode = error.message === 'Crime data not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/cid-crime-data/:id/deceased
 * @desc Add deceased to crime data
 * @access Private
 */
router.post('/:id/deceased', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deceasedData = req.body;
    const createdBy = req.user.id;

    const deceased = await cidCrimeDataService.addDeceased(parseInt(id), deceasedData, createdBy);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Deceased added successfully',
      data: deceased
    });

  } catch (error) {
    logger.error('Error adding deceased:', error);
    const statusCode = error.message === 'Crime data not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route GET /api/cid-crime-data/district/:districtId
 * @desc Get crimes by district
 * @access Private
 */
router.get('/district/:districtId', authMiddleware, async (req, res) => {
  try {
    const { districtId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      districtId: parseInt(districtId),
      active: true
    };

    const result = await cidCrimeDataService.getAllCrimeData(filters);

    res.json({
      status: 'SUCCESS',
      message: 'District crime data retrieved successfully',
      data: result.data,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });

  } catch (error) {
    logger.error('Error getting district crime data:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve district crime data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/cid-crime-data/category/:categoryId
 * @desc Get crimes by category
 * @access Private
 */
router.get('/category/:categoryId', authMiddleware, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      categoryId: parseInt(categoryId),
      active: true
    };

    const result = await cidCrimeDataService.getAllCrimeData(filters);

    res.json({
      status: 'SUCCESS',
      message: 'Category crime data retrieved successfully',
      data: result.data,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });

  } catch (error) {
    logger.error('Error getting category crime data:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve category crime data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/cid-crime-data/export/excel
 * @desc Export crime data to Excel
 * @access Private
 */
router.get('/export/excel', authMiddleware, async (req, res) => {
  try {
    const filters = {
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
      districtId: req.query.districtId ? parseInt(req.query.districtId) : undefined,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      active: true
    };

    // Get all crime data (without pagination for export)
    const allFilters = { ...filters, page: 1, limit: 10000 };
    const result = await cidCrimeDataService.getAllCrimeData(allFilters);

    // TODO: Implement Excel generation
    // const excelBuffer = await excelGenerator.generateCrimeDataExcel(result.data);
    
    res.json({
      status: 'SUCCESS',
      message: 'Excel export feature coming soon',
      data: {
        totalRecords: result.total,
        filters
      }
    });

  } catch (error) {
    logger.error('Error exporting crime data:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to export crime data',
      error: error.message
    });
  }
});

module.exports = router;