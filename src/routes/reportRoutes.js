const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     ReportRequest:
 *       type: object
 *       properties:
 *         battalionId:
 *           type: integer
 *           description: Filter by specific battalion ID
 *         battalionIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Filter by multiple battalion IDs (max 50)
 *         rangeId:
 *           type: integer
 *           description: Filter by range ID (all battalions in range)
 *         moduleId:
 *           type: integer
 *           description: Filter by specific module
 *         moduleIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Filter by multiple modules
 *         topicId:
 *           type: integer
 *           description: Filter by specific topic
 *         topicIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Filter by multiple topics
 *         subTopicId:
 *           type: integer
 *           description: Filter by specific sub-topic
 *         subTopicIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Filter by multiple sub-topics
 *         questionId:
 *           type: integer
 *           description: Filter by specific question
 *         questionIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Filter by multiple questions
 *         fromDate:
 *           type: string
 *           format: date-time
 *           description: Start date for filtering
 *         toDate:
 *           type: string
 *           format: date-time
 *           description: End date for filtering
 *         monthYear:
 *           type: string
 *           pattern: ^(0[1-9]|1[0-2])-\d{4}$
 *           example: "10-2024"
 *           description: Filter by specific month-year
 *         financialYear:
 *           type: string
 *           pattern: ^\d{4}-\d{2}$
 *           example: "2024-25"
 *           description: Filter by financial year
 *         quarter:
 *           type: string
 *           enum: [Q1, Q2, Q3, Q4]
 *           description: Filter by quarter
 *         reportType:
 *           type: string
 *           enum: [SUMMARY, DETAILED, COMPARISON, TREND, PERFORMANCE, COMPLIANCE]
 *           description: Type of report to generate
 *           required: true
 *         viewType:
 *           type: string
 *           enum: [TABLE, CHART, BOTH]
 *           default: TABLE
 *           description: Output format type
 *         format:
 *           type: string
 *           enum: [JSON, CSV, PDF, EXCEL]
 *           default: JSON
 *           description: Response format
 *         status:
 *           type: string
 *           enum: [DRAFT, SUBMITTED, APPROVED, REJECTED, PENDING]
 *           description: Filter by submission status
 *         completionStatus:
 *           type: string
 *           enum: [COMPLETE, INCOMPLETE, PARTIAL]
 *           description: Filter by completion status
 *         page:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Page number (zero-based)
 *         size:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 50
 *           description: Number of records per page
 *         sortBy:
 *           type: string
 *           enum: [battalionName, moduleName, topicName, lastUpdated, createdAt, completionRate, value]
 *           default: battalionName
 *           description: Field to sort by
 *         sortDirection:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *           description: Sort direction
 *         groupBy:
 *           type: string
 *           enum: [BATTALION, MODULE, TOPIC, MONTH, QUARTER, YEAR]
 *           description: Group results by specified dimension
 *         aggregationType:
 *           type: string
 *           enum: [SUM, AVG, COUNT, MIN, MAX]
 *           description: Type of aggregation for grouped data
 *         includeCalculatedFields:
 *           type: boolean
 *           default: true
 *           description: Include auto-calculated fields
 *         includeArchivedData:
 *           type: boolean
 *           default: false
 *           description: Include archived data
 *         chartConfig:
 *           type: object
 *           description: Chart configuration settings
 *         exportConfig:
 *           type: object
 *           description: Export configuration settings
 *       required:
 *         - reportType
 */

/**
 * @swagger
 * /api/reports/getReport:
 *   post:
 *     summary: Generate comprehensive performance statistics report
 *     description: |
 *       The main reporting endpoint that generates customizable reports from performance statistics data.
 *       Supports battalion-based filtering, multiple output formats, and various report types.
 *       
 *       **Report Types:**
 *       - SUMMARY: High-level aggregated statistics with completion rates
 *       - DETAILED: Comprehensive row-level data with full pagination
 *       - COMPARISON: Side-by-side comparison format for multiple battalions
 *       - TREND: Time-series analysis showing data changes over time
 *       - PERFORMANCE: Performance metrics with benchmark comparisons
 *       - COMPLIANCE: Compliance and audit reporting with submission status
 *       
 *       **Access Control:**
 *       - Battalion users can only access their assigned battalion data
 *       - Range admins can access all battalions in their range
 *       - System admins can access all data
 *       
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportRequest'
 *           examples:
 *             summaryReport:
 *               summary: Battalion Summary Report
 *               value:
 *                 reportType: "SUMMARY"
 *                 battalionIds: [1, 2, 3]
 *                 moduleId: 2
 *                 monthYear: "10-2024"
 *                 viewType: "BOTH"
 *             detailedReport:
 *               summary: Detailed Performance Report
 *               value:
 *                 reportType: "DETAILED"
 *                 battalionId: 5
 *                 fromDate: "2024-10-01T00:00:00"
 *                 toDate: "2024-10-31T23:59:59"
 *                 page: 0
 *                 size: 100
 *             comparisonReport:
 *               summary: Battalion Comparison Report
 *               value:
 *                 reportType: "COMPARISON"
 *                 battalionIds: [1, 2, 3, 4, 5]
 *                 topicId: 10
 *                 quarter: "Q3"
 *                 financialYear: "2024-25"
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "Report generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     metadata:
 *                       type: object
 *                     data:
 *                       type: array
 *                     summary:
 *                       type: object
 *                     chartData:
 *                       type: object
 *                     pagination:
 *                       type: object
 *                     performance:
 *                       type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: No data found
 *       500:
 *         description: Internal server error
 */
router.post('/getReport', authenticate, reportController.getReport);

/**
 * @swagger
 * /api/reports/export/{reportId}:
 *   get:
 *     summary: Export previously generated report
 *     description: Download a previously generated report in specified format
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: reportId
 *         in: path
 *         required: true
 *         description: Report ID from previous generation
 *         schema:
 *           type: string
 *       - name: format
 *         in: query
 *         required: true
 *         description: Export format
 *         schema:
 *           type: string
 *           enum: [CSV, PDF, EXCEL]
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/:reportId', authenticate, reportController.exportReport);

/**
 * @swagger
 * /api/reports/templates:
 *   get:
 *     summary: Get available report templates
 *     description: Retrieve list of predefined report templates
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 */
router.get('/templates', authenticate, reportController.getReportTemplates);

/**
 * @swagger
 * /api/reports/metadata:
 *   get:
 *     summary: Get report metadata options
 *     description: Get available options for battalions, modules, topics, etc. for report filtering
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Metadata retrieved successfully
 */
router.get('/metadata', authenticate, reportController.getReportMetadata);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Report routes are working!', 
    timestamp: new Date(),
    version: '2.0.0-battalion' 
  });
});

module.exports = router;
