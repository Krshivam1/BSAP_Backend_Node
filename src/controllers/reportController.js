const express = require('express');
const router = express.Router();
const { reportService } = require('../services');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route POST /api/reports/generate
 * @desc Generate detailed report
 * @access Private
 */
router.post('/generate', authenticate, async (req, res) => {
  try {
    const reportRequest = req.body;
    const report = await reportService.getReportDetailed(reportRequest);

    res.json({
      status: report.status,
      message: report.message,
      data: {
        labels: report.labels,
        datasets: report.datasets,
        questions: report.questions
      }
    });

  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to generate report',
      error: error.message
    });
  }
});

/**
 * @route POST /api/reports/excel
 * @desc Generate Excel report
 * @access Private
 */
router.post('/excel', authenticate, async (req, res) => {
  try {
    const reportRequest = req.body;
    const excelBuffer = await reportService.generateExcelReport(reportRequest);

    const filename = `performance_report_${Date.now()}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);

  } catch (error) {
    logger.error('Error generating Excel report:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to generate Excel report',
      error: error.message
    });
  }
});

/**
 * @route GET /api/reports/excel
 * @desc Generate Excel report via GET (with base64 encoded data)
 * @access Private
 */
router.get('/excel', authenticate, async (req, res) => {
  try {
    const { data } = req.query;
    
    if (!data) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Data parameter is required'
      });
    }

    // Decode base64 data
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const reportRequest = JSON.parse(decodedData);

    const excelBuffer = await reportService.generateExcelReport(reportRequest);

    const filename = `performance_report_${Date.now()}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);

  } catch (error) {
    logger.error('Error generating Excel report via GET:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to generate Excel report',
      error: error.message
    });
  }
});

/**
 * @route POST /api/reports/district-excel
 * @desc Generate district-specific Excel report
 * @access Private
 */
router.post('/district-excel', authenticate, async (req, res) => {
  try {
    const reportRequest = req.body;
    const excelBuffer = await reportService.generateDistrictReport(reportRequest);

    const filename = `district_report_${Date.now()}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);

  } catch (error) {
    logger.error('Error generating district Excel report:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to generate district Excel report',
      error: error.message
    });
  }
});

/**
 * @route GET /api/reports/district-excel
 * @desc Generate district Excel report via GET (with base64 encoded data)
 * @access Private
 */
router.get('/district-excel', authenticate, async (req, res) => {
  try {
    const { data } = req.query;
    
    if (!data) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Data parameter is required'
      });
    }

    // Decode base64 data
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const reportRequest = JSON.parse(decodedData);

    const excelBuffer = await reportService.generateDistrictReport(reportRequest);

    const filename = `district_report_${Date.now()}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);

  } catch (error) {
    logger.error('Error generating district Excel report via GET:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to generate district Excel report',
      error: error.message
    });
  }
});

/**
 * @route GET /api/reports/view
 * @desc View report (similar to generate but for viewing)
 * @access Private
 */
router.get('/view', authenticate, async (req, res) => {
  try {
    const reportRequest = req.query;
    
    // Convert string parameters to appropriate types
    if (reportRequest.stateData) {
      reportRequest.stateData = JSON.parse(reportRequest.stateData);
    }
    if (reportRequest.rangeData) {
      reportRequest.rangeData = JSON.parse(reportRequest.rangeData);
    }
    if (reportRequest.districtData) {
      reportRequest.districtData = JSON.parse(reportRequest.districtData);
    }
    if (reportRequest.moduleData) {
      reportRequest.moduleData = JSON.parse(reportRequest.moduleData);
    }
    if (reportRequest.topicData) {
      reportRequest.topicData = JSON.parse(reportRequest.topicData);
    }
    if (reportRequest.subTopicData) {
      reportRequest.subTopicData = JSON.parse(reportRequest.subTopicData);
    }
    if (reportRequest.questionData) {
      reportRequest.questionData = JSON.parse(reportRequest.questionData);
    }
    if (reportRequest.monthData) {
      reportRequest.monthData = JSON.parse(reportRequest.monthData);
    }

    const report = await reportService.getReportDetailed(reportRequest);

    res.json({
      status: report.status,
      message: report.message,
      data: {
        labels: report.labels,
        datasets: report.datasets,
        questions: report.questions
      }
    });

  } catch (error) {
    logger.error('Error viewing report:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to view report',
      error: error.message
    });
  }
});

/**
 * @route GET /api/reports/user/:userId/summary
 * @desc Get user performance summary
 * @access Private
 */
router.get('/user/:userId/summary', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { monthYear, questionIds } = req.query;

    const filters = {
      monthYear,
      questionIds: questionIds ? JSON.parse(questionIds) : undefined
    };

    const summary = await reportService.getUserPerformanceSummary(parseInt(userId), filters);

    res.json({
      status: 'SUCCESS',
      message: 'User performance summary retrieved successfully',
      data: summary
    });

  } catch (error) {
    logger.error('Error getting user performance summary:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve user performance summary',
      error: error.message
    });
  }
});

/**
 * @route POST /api/reports/custom
 * @desc Generate custom report with specific parameters
 * @access Private
 */
router.post('/custom', authenticate, async (req, res) => {
  try {
    const {
      reportType,
      filters,
      dateRange,
      groupBy,
      aggregationType = 'SUM'
    } = req.body;

    // Validate report type
    const validReportTypes = ['performance', 'user', 'location', 'trend'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid report type'
      });
    }

    // Build report request based on type and filters
    const reportRequest = {
      ...filters,
      startMonthData: dateRange?.startMonth,
      endMonthData: dateRange?.endMonth,
      aggregationType
    };

    const report = await reportService.getReportDetailed(reportRequest);

    res.json({
      status: report.status,
      message: report.message,
      data: {
        labels: report.labels,
        datasets: report.datasets,
        questions: report.questions,
        reportType,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error generating custom report:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to generate custom report',
      error: error.message
    });
  }
});

/**
 * @route GET /api/reports/templates
 * @desc Get available report templates
 * @access Private
 */
router.get('/templates', authenticate, async (req, res) => {
  try {
    const templates = [
      {
        id: 'monthly_performance',
        name: 'Monthly Performance Report',
        description: 'Performance statistics grouped by month',
        parameters: ['monthData', 'questionData', 'locationData']
      },
      {
        id: 'district_comparison',
        name: 'District Comparison Report',
        description: 'Compare performance across districts',
        parameters: ['districtData', 'questionData', 'monthData']
      },
      {
        id: 'user_performance',
        name: 'User Performance Report',
        description: 'Individual user performance analysis',
        parameters: ['userId', 'questionData', 'dateRange']
      },
      {
        id: 'trend_analysis',
        name: 'Trend Analysis Report',
        description: 'Performance trends over time',
        parameters: ['questionData', 'dateRange', 'groupBy']
      }
    ];

    res.json({
      status: 'SUCCESS',
      message: 'Report templates retrieved successfully',
      data: templates
    });

  } catch (error) {
    logger.error('Error getting report templates:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve report templates',
      error: error.message
    });
  }
});

/**
 * @route POST /api/reports/schedule
 * @desc Schedule a report for periodic generation
 * @access Private (Admin only)
 */
router.post('/schedule', authenticate, async (req, res) => {
  try {
    const {
      name,
      reportRequest,
      schedule, // cron expression
      recipients, // email addresses
      format = 'excel'
    } = req.body;

    const createdBy = req.user.id;

    // TODO: Implement report scheduling
    // This would typically involve:
    // 1. Storing the schedule in database
    // 2. Setting up a cron job
    // 3. Email service integration

    res.json({
      status: 'SUCCESS',
      message: 'Report scheduling feature coming soon',
      data: {
        name,
        schedule,
        format,
        createdBy
      }
    });

  } catch (error) {
    logger.error('Error scheduling report:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to schedule report',
      error: error.message
    });
  }
});

module.exports = router;
