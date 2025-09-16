const express = require('express');
const router = express.Router();
const { performanceStatisticService } = require('../services');
const { authenticate } = require('../middleware/auth');
const { validateStatisticsCreate, validateOTP } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');

/**
 * @swagger
 * /performance-statistics:
 *   get:
 *     tags: [Performance]
 *     summary: Get performance statistics
 *     description: Retrieve performance statistics with comprehensive filtering and pagination options
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: userId
 *         in: query
 *         description: Filter by user ID
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: questionId
 *         in: query
 *         description: Filter by question ID
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: moduleId
 *         in: query
 *         description: Filter by module ID
 *         schema:
 *           type: integer
 *           example: 2
 *       - name: topicId
 *         in: query
 *         description: Filter by topic ID
 *         schema:
 *           type: integer
 *           example: 3
 *       - name: subTopicId
 *         in: query
 *         description: Filter by sub-topic ID
 *         schema:
 *           type: integer
 *           example: 4
 *       - name: stateId
 *         in: query
 *         description: Filter by state ID
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: rangeId
 *         in: query
 *         description: Filter by range ID
 *         schema:
 *           type: integer
 *           example: 2
 *       - name: districtId
 *         in: query
 *         description: Filter by district ID
 *         schema:
 *           type: integer
 *           example: 3
 *       - name: status
 *         in: query
 *         description: Filter by completion status
 *         schema:
 *           type: string
 *           enum: [COMPLETED, IN_PROGRESS, ABANDONED]
 *           example: COMPLETED
 *       - name: monthYear
 *         in: query
 *         description: Filter by month and year (YYYY-MM format)
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}$'
 *           example: '2025-09'
 *     responses:
 *       200:
 *         description: Performance statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         statistics:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/PerformanceStatistic'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalRecords:
 *                               type: integer
 *                               example: 150
 *                             averageScore:
 *                               type: number
 *                               format: float
 *                               example: 78.5
 *                             totalUsers:
 *                               type: integer
 *                               example: 25
 *             examples:
 *               performanceSuccess:
 *                 summary: Successful performance statistics response
 *                 value:
 *                   success: true
 *                   message: "Performance statistics retrieved successfully"
 *                   data:
 *                     statistics:
 *                       - id: 1
 *                         score: 85.5
 *                         maxScore: 100
 *                         percentage: 85.5
 *                         timeTaken: 3600
 *                         status: "COMPLETED"
 *                         submissionDate: "2025-09-15T10:30:00.000Z"
 *                         user:
 *                           firstName: "John"
 *                           lastName: "Doe"
 *                         module:
 *                           name: "Crime Investigation"
 *                     pagination:
 *                       page: 1
 *                       limit: 20
 *                       total: 150
 *                       totalPages: 8
 *                       hasNext: true
 *                       hasPrev: false
 *                     summary:
 *                       totalRecords: 150
 *                       averageScore: 78.5
 *                       totalUsers: 25
 *                   timestamp: "2025-09-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 * @route GET /api/performance-statistics
 * @desc Get performance statistics with pagination and filtering
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      userId: req.query.userId ? parseInt(req.query.userId) : undefined,
      questionId: req.query.questionId ? parseInt(req.query.questionId) : undefined,
      moduleId: req.query.moduleId ? parseInt(req.query.moduleId) : undefined,
      topicId: req.query.topicId ? parseInt(req.query.topicId) : undefined,
      subTopicId: req.query.subTopicId ? parseInt(req.query.subTopicId) : undefined,
      stateId: req.query.stateId ? parseInt(req.query.stateId) : undefined,
      rangeId: req.query.rangeId ? parseInt(req.query.rangeId) : undefined,
      districtId: req.query.districtId ? parseInt(req.query.districtId) : undefined,
      status: req.query.status,
      monthYear: req.query.monthYear
    };

    const result = await performanceStatisticService.getWithPagination(filters);

    res.json({
      status: 'SUCCESS',
      message: 'Performance statistics retrieved successfully',
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
    logger.error('Error getting performance statistics:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve performance statistics',
      error: error.message
    });
  }
});

/**
 * @route GET /api/performance-statistics/:id
 * @desc Get performance statistic by ID
 * @access Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    // Get single performance statistic by finding in paginated results
    const result = await performanceStatisticService.getWithPagination({ 
      page: 1, 
      limit: 1,
      // Add filter for specific ID if service supports it
    });

    if (result.data.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Performance statistic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Performance statistic retrieved successfully',
      data: result.data[0]
    });

  } catch (error) {
    logger.error('Error getting performance statistic:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve performance statistic',
      error: error.message
    });
  }
});

/**
 * @route POST /api/performance-statistics
 * @desc Create new performance statistic
 * @access Private
 */
router.post('/', authenticate, validateStatisticsCreate, async (req, res) => {
  try {
    const statisticData = req.body;
    const createdBy = req.user.id;

    const statistic = await performanceStatisticService.create(statisticData);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Performance statistic created successfully',
      data: statistic
    });

  } catch (error) {
    logger.error('Error creating performance statistic:', error);
    res.status(400).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/performance-statistics/save-statistics
 * @desc Save multiple performance statistics
 * @access Private
 */
router.post('/save-statistics', authenticate, async (req, res) => {
  try {
    const { statistics } = req.body;
    const createdBy = req.user.id;

    if (!statistics || !Array.isArray(statistics)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Statistics array is required'
      });
    }

    // Add createdBy to each statistic
    const statisticsWithCreator = statistics.map(stat => ({
      ...stat,
      createdBy
    }));

    const result = await performanceStatisticService.bulkCreate(statisticsWithCreator);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Performance statistics saved successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error saving performance statistics:', error);
    res.status(400).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/performance-statistics/:id
 * @desc Update performance statistic
 * @access Private
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedBy = req.user.id;

    updateData.updatedBy = updatedBy;

    const statistic = await performanceStatisticService.update(parseInt(id), updateData);

    res.json({
      status: 'SUCCESS',
      message: 'Performance statistic updated successfully',
      data: statistic
    });

  } catch (error) {
    logger.error('Error updating performance statistic:', error);
    const statusCode = error.message === 'Performance statistic not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/performance-statistics/:id
 * @desc Delete performance statistic (soft delete)
 * @access Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await performanceStatisticService.delete(parseInt(id));

    res.json({
      status: 'SUCCESS',
      message: result.message
    });

  } catch (error) {
    logger.error('Error deleting performance statistic:', error);
    const statusCode = error.message === 'Performance statistic not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/performance-statistics/:id/make-active
 * @desc Make performance statistic active/inactive
 * @access Private
 */
router.post('/:id/make-active', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { active = true } = req.body;
    const updatedBy = req.user.id;

    const result = await performanceStatisticService.update(parseInt(id), { 
      active, 
      updatedBy 
    });

    res.json({
      status: 'SUCCESS',
      message: `Performance statistic ${active ? 'activated' : 'deactivated'} successfully`,
      data: result
    });

  } catch (error) {
    logger.error('Error updating performance statistic status:', error);
    const statusCode = error.message === 'Performance statistic not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route GET /api/performance-statistics/user/:userId
 * @desc Get performance statistics by user ID
 * @access Private
 */
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const statistics = await performanceStatisticService.getByUserId(parseInt(userId));

    res.json({
      status: 'SUCCESS',
      message: 'User performance statistics retrieved successfully',
      data: statistics
    });

  } catch (error) {
    logger.error('Error getting user performance statistics:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve user performance statistics',
      error: error.message
    });
  }
});

/**
 * @route GET /api/performance-statistics/user/:userId/month/:monthYear
 * @desc Get performance statistics by user ID and month
 * @access Private
 */
router.get('/user/:userId/month/:monthYear', authenticate, async (req, res) => {
  try {
    const { userId, monthYear } = req.params;
    const statistics = await performanceStatisticService.getByUserIdAndMonth(
      parseInt(userId), 
      monthYear
    );

    res.json({
      status: 'SUCCESS',
      message: 'User monthly performance statistics retrieved successfully',
      data: statistics
    });

  } catch (error) {
    logger.error('Error getting user monthly performance statistics:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve user monthly performance statistics',
      error: error.message
    });
  }
});

/**
 * @route GET /api/performance-statistics/summary
 * @desc Get performance statistics summary
 * @access Private
 */
router.get('/summary', authenticate, async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId ? parseInt(req.query.userId) : undefined,
      stateId: req.query.stateId ? parseInt(req.query.stateId) : undefined,
      rangeId: req.query.rangeId ? parseInt(req.query.rangeId) : undefined,
      districtId: req.query.districtId ? parseInt(req.query.districtId) : undefined,
      monthYear: req.query.monthYear
    };

    const summary = await performanceStatisticService.getSummary(filters);

    res.json({
      status: 'SUCCESS',
      message: 'Performance statistics summary retrieved successfully',
      data: summary
    });

  } catch (error) {
    logger.error('Error getting performance statistics summary:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve performance statistics summary',
      error: error.message
    });
  }
});

/**
 * @route GET /api/performance-statistics/labels
 * @desc Get all unique month-year labels
 * @access Private
 */
router.get('/labels', authenticate, async (req, res) => {
  try {
    const labels = await performanceStatisticService.getAllLabels();

    res.json({
      status: 'SUCCESS',
      message: 'Labels retrieved successfully',
      data: labels
    });

  } catch (error) {
    logger.error('Error getting labels:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve labels',
      error: error.message
    });
  }
});

/**
 * @route POST /api/performance-statistics/labels/filter
 * @desc Get labels by filters
 * @access Private
 */
router.post('/labels/filter', authenticate, async (req, res) => {
  try {
    const filters = req.body;
    const labels = await performanceStatisticService.getLabelsByFilters(filters);

    res.json({
      status: 'SUCCESS',
      message: 'Filtered labels retrieved successfully',
      data: labels
    });

  } catch (error) {
    logger.error('Error getting filtered labels:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve filtered labels',
      error: error.message
    });
  }
});

/**
 * @route POST /api/performance-statistics/report-values
 * @desc Get values for report generation
 * @access Private
 */
router.post('/report-values', authenticate, async (req, res) => {
  try {
    const filters = req.body;
    const values = await performanceStatisticService.getValuesForReport(filters);

    res.json({
      status: 'SUCCESS',
      message: 'Report values retrieved successfully',
      data: values
    });

  } catch (error) {
    logger.error('Error getting report values:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve report values',
      error: error.message
    });
  }
});

/**
 * @route GET /api/performance-statistics/count/user/:userId/date/:date
 * @desc Get count by user ID and date
 * @access Private
 */
router.get('/count/user/:userId/date/:date', authenticate, async (req, res) => {
  try {
    const { userId, date } = req.params;
    const count = await performanceStatisticService.getCountByUserIdAndDate(
      parseInt(userId), 
      date
    );

    res.json({
      status: 'SUCCESS',
      message: 'Count retrieved successfully',
      data: { count }
    });

  } catch (error) {
    logger.error('Error getting count:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve count',
      error: error.message
    });
  }
});

/**
 * @route GET /api/performance-statistics/success-count/user/:userId/date/:date
 * @desc Get success count by user ID and date
 * @access Private
 */
router.get('/success-count/user/:userId/date/:date', authenticate, async (req, res) => {
  try {
    const { userId, date } = req.params;
    const count = await performanceStatisticService.getSuccessCountByUserIdAndDate(
      parseInt(userId), 
      date
    );

    res.json({
      status: 'SUCCESS',
      message: 'Success count retrieved successfully',
      data: { count }
    });

  } catch (error) {
    logger.error('Error getting success count:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve success count',
      error: error.message
    });
  }
});

module.exports = router;
