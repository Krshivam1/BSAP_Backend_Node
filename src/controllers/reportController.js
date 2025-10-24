const reportService = require('../services/reportService');
const logger = require('../utils/logger');

/**
 * Main report generation endpoint
 * POST /api/reports/getReport
 */
async function getReport(req, res) {
  const startTime = Date.now();
  
  try {
    // Log the request
    logger.info('Report generation request received', {
      userId: req.user.id,
      userRole: req.user.role,
      battalionId: req.user.battalionId,
      rangeId: req.user.rangeId,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    const { reportType } = req.body;
    if (!reportType) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Report type is required',
        error: {
          code: 'VALIDATION_ERROR',
          type: 'REQUEST_VALIDATION',
          details: {
            reportType: 'Report type is required and must be one of: SUMMARY, DETAILED, COMPARISON, TREND, PERFORMANCE, COMPLIANCE'
          }
        },
        timestamp: new Date().toISOString()
      });
    }

    // Validate report type
    const validReportTypes = ['SUMMARY', 'DETAILED', 'COMPARISON', 'TREND', 'PERFORMANCE', 'COMPLIANCE'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid report type',
        error: {
          code: 'VALIDATION_ERROR',
          type: 'REQUEST_VALIDATION',
          details: {
            reportType: `Report type must be one of: ${validReportTypes.join(', ')}`
          }
        },
        timestamp: new Date().toISOString()
      });
    }

    // Apply user-based access restrictions
    const requestWithUserContext = applyUserAccessRestrictions(req.body, req.user);

    // Validate pagination parameters
    const validationErrors = validatePaginationAndFilters(requestWithUserContext);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Request validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          type: 'REQUEST_VALIDATION',
          details: validationErrors
        },
        timestamp: new Date().toISOString()
      });
    }

    // Generate report
    const reportResult = await reportService.generateReport(requestWithUserContext, req.user);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Log successful generation
    logger.info('Report generated successfully', {
      userId: req.user.id,
      reportType: requestWithUserContext.reportType,
      recordsReturned: reportResult.data ? reportResult.data.length : 0,
      processingTimeMs: processingTime,
      reportId: reportResult.metadata?.reportId
    });

    // Return successful response
    res.json({
      status: 'SUCCESS',
      message: 'Report generated successfully',
      data: reportResult,
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    // Log error
    logger.error('Report generation failed', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime,
      requestBody: req.body
    });

    // Handle specific error types
    if (error.message.includes('No data found')) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'No data found for the specified criteria',
        error: {
          code: 'NO_DATA_FOUND',
          type: 'DATA_RETRIEVAL',
          details: {
            reason: error.message,
            suggestions: [
              'Try expanding the date range',
              'Remove some filters to broaden the search',
              'Check if data has been submitted for the selected period'
            ],
            filtersApplied: req.body
          }
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('Access denied') || error.message.includes('Unauthorized')) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Access denied',
        error: {
          code: 'UNAUTHORIZED',
          type: 'ACCESS_DENIED',
          details: {
            reason: error.message,
            userRole: req.user?.role,
            allowedBattalions: req.user?.battalionId ? [req.user.battalionId] : [],
            requestedBattalions: req.body.battalionIds || (req.body.battalionId ? [req.body.battalionId] : [])
          }
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('timeout') || processingTime > 30000) {
      return res.status(408).json({
        status: 'ERROR',
        message: 'Request timed out',
        error: {
          code: 'TIMEOUT',
          type: 'PERFORMANCE',
          details: {
            reason: 'Query execution exceeded maximum allowed time of 30 seconds',
            executionTime: `${processingTime}ms`,
            suggestions: [
              'Reduce the date range',
              'Add more specific filters',
              'Use pagination with smaller page sizes',
              'Consider using SUMMARY report type instead of DETAILED'
            ]
          }
        },
        timestamp: new Date().toISOString()
      });
    }

    // Generic server error
    res.status(500).json({
      status: 'ERROR',
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        type: 'SYSTEM',
        details: {
          reason: 'An unexpected error occurred while generating the report',
          errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          supportMessage: 'Please contact support with the error ID if the problem persists'
        }
      },
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Export report endpoint
 * GET /api/reports/export/:reportId
 */
async function exportReport(req, res) {
  try {
    const { reportId } = req.params;
    const { format } = req.query;

    if (!reportId || !format) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Report ID and format are required'
      });
    }

    const validFormats = ['CSV', 'PDF', 'EXCEL'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Invalid format. Must be one of: ${validFormats.join(', ')}`
      });
    }

    const exportResult = await reportService.exportReport(reportId, format, req.user);

    // Set appropriate headers for file download
    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    res.setHeader('Content-Length', exportResult.buffer.length);

    res.send(exportResult.buffer);

  } catch (error) {
    logger.error('Report export failed', {
      userId: req.user?.id,
      reportId: req.params.reportId,
      format: req.query.format,
      error: error.message
    });

    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to export report',
      error: error.message
    });
  }
}

/**
 * Get report templates endpoint
 * GET /api/reports/templates
 */
async function getReportTemplates(req, res) {
  try {
    const templates = await reportService.getReportTemplates(req.user);

    res.json({
      status: 'SUCCESS',
      message: 'Report templates retrieved successfully',
      data: templates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to retrieve report templates', {
      userId: req.user?.id,
      error: error.message
    });

    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve report templates',
      error: error.message
    });
  }
}

/**
 * Get report metadata endpoint
 * GET /api/reports/metadata
 */
async function getReportMetadata(req, res) {
  try {
    const metadata = await reportService.getReportMetadata(req.user);

    res.json({
      status: 'SUCCESS',
      message: 'Report metadata retrieved successfully',
      data: metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to retrieve report metadata', {
      userId: req.user?.id,
      error: error.message
    });

    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve report metadata',
      error: error.message
    });
  }
}

/**
 * Apply user-based access restrictions to report request
 */
function applyUserAccessRestrictions(request, user) {
  const restrictedRequest = { ...request };

  // Apply role-based restrictions
  switch (user.role) {
    case 'BATTALION_USER':
      // Battalion users can only access their own battalion data
      restrictedRequest.battalionId = user.battalionId;
      restrictedRequest.battalionIds = [user.battalionId];
      break;
      
    case 'RANGE_ADMIN':
      // Range admins can access all battalions in their range
      if (restrictedRequest.rangeId && restrictedRequest.rangeId !== user.rangeId) {
        throw new Error('Access denied: User cannot access data from other ranges');
      }
      restrictedRequest.rangeId = user.rangeId;
      break;
      
    case 'SYSTEM_ADMIN':
      // System admins have full access - no restrictions
      break;
      
    default:
      // Default to battalion-level access
      restrictedRequest.battalionId = user.battalionId;
      restrictedRequest.battalionIds = [user.battalionId];
  }

  // Validate battalion access if specific battalions are requested
  if (restrictedRequest.battalionIds && user.role !== 'SYSTEM_ADMIN') {
    for (const battalionId of restrictedRequest.battalionIds) {
      if (user.role === 'BATTALION_USER' && battalionId !== user.battalionId) {
        throw new Error(`Access denied: User cannot access battalion ID ${battalionId}`);
      }
    }
  }

  return restrictedRequest;
}

/**
 * Validate pagination and filter parameters
 */
function validatePaginationAndFilters(request) {
  const errors = {};

  // Validate pagination
  if (request.page !== undefined && request.page < 0) {
    errors.page = 'Page number must be non-negative';
  }

  if (request.size !== undefined && (request.size < 1 || request.size > 1000)) {
    errors.size = 'Page size must be between 1 and 1000';
  }

  // Validate date range
  if (request.fromDate && request.toDate) {
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      errors.dateFormat = 'Date format must be yyyy-MM-dd\'T\'HH:mm:ss';
    } else if (fromDate > toDate) {
      errors.dateRange = 'fromDate cannot be after toDate';
    }
  }

  // Validate battalion IDs limit
  if (request.battalionIds && request.battalionIds.length > 50) {
    errors.battalionIds = 'Maximum 50 battalions allowed';
  }

  // Validate sort parameters
  const validSortFields = ['battalionName', 'moduleName', 'topicName', 'lastUpdated', 'createdAt', 'completionRate', 'value'];
  if (request.sortBy && !validSortFields.includes(request.sortBy)) {
    errors.sortBy = `Sort field must be one of: ${validSortFields.join(', ')}`;
  }

  const validSortDirections = ['ASC', 'DESC'];
  if (request.sortDirection && !validSortDirections.includes(request.sortDirection)) {
    errors.sortDirection = `Sort direction must be one of: ${validSortDirections.join(', ')}`;
  }

  // Validate group by and aggregation
  if (request.groupBy && request.aggregationType) {
    const validGroupBy = ['BATTALION', 'MODULE', 'TOPIC', 'MONTH', 'QUARTER', 'YEAR'];
    const validAggregation = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX'];
    
    if (!validGroupBy.includes(request.groupBy)) {
      errors.groupBy = `Group by must be one of: ${validGroupBy.join(', ')}`;
    }
    
    if (!validAggregation.includes(request.aggregationType)) {
      errors.aggregationType = `Aggregation type must be one of: ${validAggregation.join(', ')}`;
    }
  }

  return errors;
}

module.exports = {
  getReport,
  exportReport,
  getReportTemplates,
  getReportMetadata
};
