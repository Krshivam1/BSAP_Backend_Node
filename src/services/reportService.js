const { PerformanceStatistic, Battalion, Range, Module, Topic, SubTopic, Question, User } = require('../models');
const { Op, Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');

/**
 * Main report generation service
 */
class ReportService {
  
  /**
   * Generate comprehensive report based on request parameters
   */
  async generateReport(request, user) {
    const startTime = Date.now();
    
    try {
      // Generate unique report ID
      const reportId = this.generateReportId();
      
      // Build query based on request parameters
      const queryOptions = await this.buildQueryOptions(request, user);
      
      // Execute main data query
      const { data, totalCount } = await this.executeDataQuery(queryOptions, request);
      
      // Generate summary statistics if needed
      const summary = await this.generateSummary(data, queryOptions, request);
      
      // Generate chart data if requested
      let chartData = null;
      if (request.viewType === 'CHART' || request.viewType === 'BOTH') {
        chartData = await this.generateChartData(data, request.chartConfig, request.reportType);
      }
      
      // Process data for response
      const processedData = await this.processDataForResponse(data, request);
      
      // Build pagination info
      const pagination = this.buildPaginationInfo(request, totalCount);
      
      // Build metadata
      const metadata = this.buildMetadata(reportId, request, user, startTime);
      
      // Build performance metrics
      const performance = this.buildPerformanceMetrics(startTime, data.length, totalCount);
      
      return {
        metadata,
        data: processedData,
        summary,
        chartData,
        pagination,
        performance
      };
      
    } catch (error) {
      logger.error('Report generation failed in service', {
        error: error.message,
        stack: error.stack,
        request: request,
        userId: user.id
      });
      throw error;
    }
  }

  /**
   * Build Sequelize query options based on request parameters
   */
  async buildQueryOptions(request, user) {
    const whereConditions = {};
    const include = [];
    
    // Always include related models for battalion-based reporting
    include.push(
      {
        model: Battalion,
        as: 'battalion',
        attributes: ['id', 'battalionName', 'battalionHead', 'battalionContactNo', 'rangeId'],
        include: [{
          model: Range,
          as: 'range',
          attributes: ['id', 'rangeName'] // Removed rangeCode - field doesn't exist
        }]
      },
      {
        model: Question,
        as: 'question',
        attributes: ['id', 'question', 'type', 'priority'],
        include: [
          {
            model: Topic,
            as: 'topic',
            attributes: ['id', 'topicName', 'subName', 'formType', 'moduleId'],
            include: [{
              model: Module,
              as: 'module',
              attributes: ['id', 'moduleName'] // Removed description - field doesn't exist
            }]
          },
          {
            model: SubTopic,
            as: 'subTopic',
            attributes: ['id', 'subTopicName'], // Removed description - field doesn't exist
            required: false
          }
        ]
      },
      {
        model: User,
        as: 'CreatedByUser',
        attributes: ['id', 'firstName', 'lastName', 'roleId'],
        required: false
      },
      {
        model: User,
        as: 'UpdatedByUser',
        attributes: ['id', 'firstName', 'lastName', 'roleId'],
        required: false
      }
    );
    
    // Battalion filtering
    if (request.battalionId) {
      whereConditions.battalionId = request.battalionId;
    } else if (request.battalionIds && request.battalionIds.length > 0) {
      whereConditions.battalionId = { [Op.in]: request.battalionIds };
    }
    
    // Range filtering (if no specific battalions specified)
    if (request.rangeId && !request.battalionId && !request.battalionIds) {
      include[0].where = { rangeId: request.rangeId };
    }
    
    // Module filtering
    if (request.moduleId || request.moduleIds) {
      const moduleCondition = {};
      if (request.moduleId) {
        moduleCondition.moduleId = request.moduleId;
      } else if (request.moduleIds && request.moduleIds.length > 0) {
        moduleCondition.moduleId = { [Op.in]: request.moduleIds };
      }
      
      // Apply module filter to the Topic include
      const questionInclude = include.find(inc => inc.model === Question);
      if (questionInclude) {
        const topicInclude = questionInclude.include.find(inc => inc.model === Topic);
        if (topicInclude) {
          topicInclude.where = { ...topicInclude.where, ...moduleCondition };
        }
      }
    }
    
    // Topic filtering
    if (request.topicId || request.topicIds) {
      const topicCondition = {};
      if (request.topicId) {
        topicCondition.topicId = request.topicId;
      } else if (request.topicIds && request.topicIds.length > 0) {
        topicCondition.topicId = { [Op.in]: request.topicIds };
      }
      
      const questionInclude = include.find(inc => inc.model === Question);
      if (questionInclude) {
        questionInclude.where = { ...questionInclude.where, ...topicCondition };
      }
    }
    
    // SubTopic filtering
    if (request.subTopicId || request.subTopicIds) {
      const subTopicCondition = {};
      if (request.subTopicId) {
        subTopicCondition.subTopicId = request.subTopicId;
      } else if (request.subTopicIds && request.subTopicIds.length > 0) {
        subTopicCondition.subTopicId = { [Op.in]: request.subTopicIds };
      }
      
      const questionInclude = include.find(inc => inc.model === Question);
      if (questionInclude) {
        questionInclude.where = { ...questionInclude.where, ...subTopicCondition };
      }
    }
    
    // Question filtering
    if (request.questionId || request.questionIds) {
      if (request.questionId) {
        whereConditions.questionId = request.questionId;
      } else if (request.questionIds && request.questionIds.length > 0) {
        whereConditions.questionId = { [Op.in]: request.questionIds };
      }
    }
    
    // Date filtering
    if (request.fromDate || request.toDate) {
      const dateCondition = {};
      if (request.fromDate) {
        dateCondition[Op.gte] = new Date(request.fromDate);
      }
      if (request.toDate) {
        dateCondition[Op.lte] = new Date(request.toDate);
      }
      whereConditions.created_date = dateCondition;
    }
    
    // Month-year filtering
    if (request.monthYear) {
      whereConditions.monthYear = request.monthYear;
    }
    
    // Financial year filtering
    if (request.financialYear) {
      // Convert financial year to date range
      const [startYear, endYear] = request.financialYear.split('-');
      const financialStartDate = new Date(`${startYear}-04-01`);
      const financialEndDate = new Date(`20${endYear}-03-31`);
      
      whereConditions.created_date = {
        [Op.between]: [financialStartDate, financialEndDate]
      };
    }
    
    // Quarter filtering (requires financial year)
    if (request.quarter && request.financialYear) {
      const quarterDates = this.getQuarterDates(request.quarter, request.financialYear);
      whereConditions.created_date = {
        [Op.between]: [quarterDates.start, quarterDates.end]
      };
    }
    
    // Status filtering
    if (request.status) {
      whereConditions.status = request.status;
    }
    
    // Active records only (unless archived data is requested)
    if (!request.includeArchivedData) {
      whereConditions.active = true;
    }
    
    // Build order clause
    const order = [];
    const sortBy = request.sortBy || 'created_date';
    const sortDirection = request.sortDirection || 'DESC';
    
    // Map sort fields to actual database fields/associations
    switch (sortBy) {
      case 'battalionName':
        order.push([{ model: Battalion, as: 'battalion' }, 'battalionName', sortDirection]);
        break;
      case 'moduleName':
        order.push([
          { model: Question, as: 'question' },
          { model: Topic, as: 'topic' },
          { model: Module, as: 'module' },
          'moduleName',
          sortDirection
        ]);
        break;
      case 'topicName':
        order.push([
          { model: Question, as: 'question' },
          { model: Topic, as: 'topic' },
          'topicName',
          sortDirection
        ]);
        break;
      case 'lastUpdated':
        order.push(['updated_date', sortDirection]);
        break;
      case 'value':
        order.push(['value', sortDirection]);
        break;
      default:
        order.push([sortBy, sortDirection]);
    }
    
    return {
      where: whereConditions,
      include,
      order,
      distinct: true
    };
  }

  /**
   * Execute the main data query
   */
  async executeDataQuery(queryOptions, request) {
    const page = request.page || 0;
    const size = request.size || 50;
    const offset = page * size;
    
    // Get total count
    const totalCount = await PerformanceStatistic.count({
      where: queryOptions.where,
      include: queryOptions.include,
      distinct: true
    });
    
    if (totalCount === 0) {
      throw new Error('No data found for the specified criteria');
    }
    
    // Get paginated data
    const data = await PerformanceStatistic.findAll({
      ...queryOptions,
      limit: size,
      offset: offset
    });
    
    return { data, totalCount };
  }

  /**
   * Generate summary statistics
   */
  async generateSummary(data, queryOptions, request) {
    try {
      // Basic counts
      const overview = {
        totalRecords: data.length,
        totalBattalions: new Set(data.map(d => d.battalionId)).size,
        totalModules: new Set(data.map(d => d.question?.topic?.module?.id)).size,
        totalTopics: new Set(data.map(d => d.question?.topic?.id)).size,
        totalQuestions: new Set(data.map(d => d.questionId)).size,
        totalResponses: data.length
      };
      
      // Status distribution
      const statusDistribution = {};
      data.forEach(record => {
        const status = record.status || 'UNKNOWN';
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      });
      
      // Completion statistics
      const completionStats = {
        totalExpected: data.length,
        totalSubmitted: statusDistribution['SUBMITTED'] || 0,
        totalApproved: statusDistribution['APPROVED'] || 0,
        totalDraft: statusDistribution['DRAFT'] || 0
      };
      
      completionStats.submissionRate = completionStats.totalExpected > 0 
        ? (completionStats.totalSubmitted / completionStats.totalExpected * 100).toFixed(2)
        : 0;
      
      completionStats.approvalRate = completionStats.totalExpected > 0
        ? (completionStats.totalApproved / completionStats.totalExpected * 100).toFixed(2)
        : 0;
      
      // Battalion performance analysis
      const battalionStats = {};
      data.forEach(record => {
        const battalionId = record.battalionId;
        const battalionName = record.battalion?.battalionName || 'Unknown Battalion';
        
        if (!battalionStats[battalionId]) {
          battalionStats[battalionId] = {
            battalionId,
            battalionName,
            totalResponses: 0,
            submittedResponses: 0,
            approvedResponses: 0
          };
        }
        
        battalionStats[battalionId].totalResponses++;
        if (record.status === 'SUBMITTED') battalionStats[battalionId].submittedResponses++;
        if (record.status === 'APPROVED') battalionStats[battalionId].approvedResponses++;
      });
      
      // Calculate completion rates and find top performers
      const battalionPerformance = Object.values(battalionStats).map(stats => ({
        ...stats,
        completionRate: stats.totalResponses > 0 
          ? (stats.submittedResponses / stats.totalResponses * 100).toFixed(2)
          : 0,
        approvalRate: stats.totalResponses > 0
          ? (stats.approvedResponses / stats.totalResponses * 100).toFixed(2)
          : 0
      }));
      
      // Sort by completion rate and get top performers
      const topPerformers = battalionPerformance
        .sort((a, b) => parseFloat(b.completionRate) - parseFloat(a.completionRate))
        .slice(0, 5)
        .map((performer, index) => ({
          rank: index + 1,
          battalionId: performer.battalionId,
          battalionName: performer.battalionName,
          completionRate: parseFloat(performer.completionRate),
          totalResponses: performer.totalResponses,
          performanceGrade: this.calculatePerformanceGrade(parseFloat(performer.completionRate))
        }));
      
      // Generate insights and alerts
      const insights = this.generateInsights(overview, completionStats, battalionPerformance);
      const alerts = this.generateAlerts(battalionPerformance, completionStats);
      const recommendations = this.generateRecommendations(battalionPerformance, completionStats);
      
      return {
        overview,
        completionStatistics: completionStats,
        statusDistribution,
        battalionPerformance: battalionPerformance.slice(0, 10), // Top 10 for summary
        topPerformers,
        insights,
        alerts,
        recommendations,
        generatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Summary generation failed', { error: error.message });
      return {
        overview: { totalRecords: data.length },
        error: 'Failed to generate complete summary statistics'
      };
    }
  }

  /**
   * Generate chart data based on report type and configuration
   */
  async generateChartData(data, chartConfig, reportType) {
    if (!data || data.length === 0) {
      return null;
    }
    
    const defaultConfig = {
      chartType: 'BAR',
      title: 'Performance Statistics Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      showLegend: true,
      showDataLabels: true
    };
    
    const config = { ...defaultConfig, ...chartConfig };
    
    let chartData;
    
    switch (reportType) {
      case 'SUMMARY':
        chartData = this.generateSummaryChartData(data, config);
        break;
      case 'COMPARISON':
        chartData = this.generateComparisonChartData(data, config);
        break;
      case 'TREND':
        chartData = this.generateTrendChartData(data, config);
        break;
      case 'PERFORMANCE':
        chartData = this.generatePerformanceChartData(data, config);
        break;
      default:
        chartData = this.generateDefaultChartData(data, config);
    }
    
    return {
      ...chartData,
      config: config,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate summary chart data (battalion completion rates)
   */
  generateSummaryChartData(data, config) {
    // Group by battalion
    const battalionData = {};
    data.forEach(record => {
      const battalionName = record.battalion?.battalionName || 'Unknown Battalion';
      if (!battalionData[battalionName]) {
        battalionData[battalionName] = { total: 0, submitted: 0 };
      }
      battalionData[battalionName].total++;
      if (record.status === 'SUBMITTED' || record.status === 'APPROVED') {
        battalionData[battalionName].submitted++;
      }
    });
    
    const labels = Object.keys(battalionData);
    const completionRates = labels.map(battalion => 
      battalionData[battalion].total > 0 
        ? (battalionData[battalion].submitted / battalionData[battalion].total * 100).toFixed(2)
        : 0
    );
    
    return {
      chartType: config.chartType,
      title: config.title,
      subtitle: config.subtitle,
      dataset: {
        labels: labels,
        series: [{
          name: 'Completion Rate (%)',
          data: completionRates.map(rate => parseFloat(rate)),
          color: '#36A2EB'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Completion Rate (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Battalions'
            }
          }
        },
        plugins: {
          legend: {
            display: config.showLegend
          },
          datalabels: {
            display: config.showDataLabels
          }
        }
      }
    };
  }

  /**
   * Generate comparison chart data
   */
  generateComparisonChartData(data, config) {
    // Group by battalion and module
    const comparisonData = {};
    
    data.forEach(record => {
      const battalionName = record.battalion?.battalionName || 'Unknown Battalion';
      const moduleName = record.question?.topic?.module?.moduleName || 'Unknown Module';
      
      if (!comparisonData[battalionName]) {
        comparisonData[battalionName] = {};
      }
      if (!comparisonData[battalionName][moduleName]) {
        comparisonData[battalionName][moduleName] = { total: 0, submitted: 0 };
      }
      
      comparisonData[battalionName][moduleName].total++;
      if (record.status === 'SUBMITTED' || record.status === 'APPROVED') {
        comparisonData[battalionName][moduleName].submitted++;
      }
    });
    
    const battalions = Object.keys(comparisonData);
    const modules = [...new Set(Object.values(comparisonData).flatMap(b => Object.keys(b)))];
    
    const series = modules.map((module, index) => ({
      name: module,
      data: battalions.map(battalion => {
        const moduleData = comparisonData[battalion][module];
        return moduleData 
          ? (moduleData.submitted / moduleData.total * 100).toFixed(2)
          : 0;
      }).map(rate => parseFloat(rate)),
      color: this.getChartColor(index)
    }));
    
    return {
      chartType: 'BAR',
      title: 'Battalion vs Module Completion Comparison',
      subtitle: config.subtitle,
      dataset: {
        labels: battalions,
        series: series
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Completion Rate (%)'
            }
          }
        },
        plugins: {
          legend: {
            display: true
          }
        }
      }
    };
  }

  /**
   * Process data for final response
   */
  async processDataForResponse(data, request) {
    return data.map((record, index) => ({
      id: record.id,
      rowNumber: index + 1,
      
      // Battalion information
      battalionId: record.battalionId,
      battalionName: record.battalion?.battalionName || 'Unknown Battalion',
      battalionHead: record.battalion?.battalionHead,
      battalionContactNo: record.battalion?.battalionContactNo,
      
      // Range information
      rangeId: record.battalion?.rangeId,
      rangeName: record.battalion?.range?.rangeName,
      rangeCode: record.battalion?.range?.id || 'N/A', // Using range ID since rangeCode field doesn't exist
      
      // Module information
      moduleId: record.question?.topic?.module?.id,
      moduleName: record.question?.topic?.module?.moduleName,
      moduleDescription: record.question?.topic?.module?.moduleName || 'N/A', // Using moduleName since description field doesn't exist
      
      // Topic information
      topicId: record.question?.topic?.id,
      topicName: record.question?.topic?.topicName,
      topicSubName: record.question?.topic?.topicSubName,
      formType: record.question?.topic?.formType,
      
      // SubTopic information
      subTopicId: record.question?.subTopic?.id,
      subTopicName: record.question?.subTopic?.subTopicName,
      subTopicDescription: record.question?.subTopic?.subTopicName || 'N/A', // Using subTopicName since description field doesn't exist
      
      // Question information
      questionId: record.questionId,
      questionText: record.question?.question,
      questionType: record.question?.type,
      questionSequence: record.question?.sequenceOrder,
      unit: record.question?.unit,
      
      // Performance data
      value: record.value,
      numericValue: this.parseNumericValue(record.value),
      displayValue: record.value,
      status: record.status || 'DRAFT',
      monthYear: record.monthYear,
      
      // Temporal information
      submissionDate: record.submissionDate,
      createdAt: record.created_date,
      updatedAt: record.updated_date,
      
      // User information
      createdBy: record.createdBy,
      createdByName: record.CreatedByUser?.name,
      createdByRole: record.CreatedByUser?.role,
      updatedBy: record.updatedBy,
      updatedByName: record.UpdatedByUser?.name,
      updatedByRole: record.UpdatedByUser?.role,
      
      // Additional metadata
      active: record.active,
      
      // Calculated fields (if requested)
      ...(request.includeCalculatedFields !== false && {
        dataQualityScore: this.calculateDataQualityScore(record),
        completionStatus: this.determineCompletionStatus(record),
        performanceGrade: this.calculatePerformanceGrade(this.parseNumericValue(record.value))
      })
    }));
  }

  /**
   * Build pagination information
   */
  buildPaginationInfo(request, totalCount) {
    const page = request.page || 0;
    const size = request.size || 50;
    const totalPages = Math.ceil(totalCount / size);
    
    return {
      currentPage: page,
      pageSize: size,
      totalPages: totalPages,
      totalElements: totalCount,
      hasNext: page < totalPages - 1,
      hasPrevious: page > 0,
      isFirst: page === 0,
      isLast: page === totalPages - 1,
      numberOfElements: Math.min(size, totalCount - (page * size)),
      firstPage: 0,
      lastPage: Math.max(0, totalPages - 1),
      nextPage: page < totalPages - 1 ? page + 1 : null,
      previousPage: page > 0 ? page - 1 : null,
      pageSizes: [10, 25, 50, 100, 250],
      sortBy: request.sortBy || 'created_date',
      sortDirection: request.sortDirection || 'DESC'
    };
  }

  /**
   * Build report metadata
   */
  buildMetadata(reportId, request, user, startTime) {
    return {
      reportId: reportId,
      reportType: request.reportType,
      generatedAt: new Date().toISOString(),
      generatedBy: user.id,
      generatedByName: user.name,
      generatedByRole: user.role,
      filtersApplied: {
        battalionId: request.battalionId,
        battalionIds: request.battalionIds,
        rangeId: request.rangeId,
        moduleId: request.moduleId,
        moduleIds: request.moduleIds,
        topicId: request.topicId,
        topicIds: request.topicIds,
        subTopicId: request.subTopicId,
        subTopicIds: request.subTopicIds,
        questionId: request.questionId,
        questionIds: request.questionIds,
        fromDate: request.fromDate,
        toDate: request.toDate,
        monthYear: request.monthYear,
        financialYear: request.financialYear,
        quarter: request.quarter,
        status: request.status,
        reportType: request.reportType,
        viewType: request.viewType,
        format: request.format
      },
      reportVersion: '2.0.0-battalion',
      apiVersion: '1.0'
    };
  }

  /**
   * Build performance metrics
   */
  buildPerformanceMetrics(startTime, recordsReturned, totalRecords) {
    const totalTime = Date.now() - startTime;
    
    return {
      queryMetrics: {
        totalQueryTime: `${totalTime}ms`,
        recordsScanned: totalRecords,
        recordsReturned: recordsReturned
      },
      processingMetrics: {
        totalProcessingTime: `${totalTime}ms`
      },
      cacheMetrics: {
        cacheChecked: false, // Implement caching later
        cacheHit: false,
        cacheStored: false
      },
      optimizationSuggestions: this.getOptimizationSuggestions(recordsReturned, totalTime)
    };
  }

  /**
   * Export report in specified format
   */
  async exportReport(reportId, format, user) {
    // Implementation for exporting reports
    // This would typically retrieve cached report data and convert to requested format
    throw new Error('Export functionality not yet implemented');
  }

  /**
   * Get available report templates
   */
  async getReportTemplates(user) {
    return [
      {
        id: 'battalion_summary',
        name: 'Battalion Summary Report',
        description: 'High-level performance summary by battalion',
        reportType: 'SUMMARY',
        defaultFilters: {
          viewType: 'BOTH'
        }
      },
      {
        id: 'battalion_comparison',
        name: 'Battalion Comparison Report',
        description: 'Side-by-side comparison of multiple battalions',
        reportType: 'COMPARISON',
        defaultFilters: {
          viewType: 'CHART'
        }
      },
      {
        id: 'performance_trend',
        name: 'Performance Trend Analysis',
        description: 'Time-series analysis of performance metrics',
        reportType: 'TREND',
        defaultFilters: {
          viewType: 'CHART'
        }
      },
      {
        id: 'compliance_report',
        name: 'Compliance Status Report',
        description: 'Submission and approval status tracking',
        reportType: 'COMPLIANCE',
        defaultFilters: {
          viewType: 'TABLE'
        }
      }
    ];
  }

  /**
   * Get report metadata (available options for filters)
   */
  async getReportMetadata(user) {
    try {
      // Get battalions based on user access
      let battalionQuery = { active: true };
      if (user.role === 'BATTALION_USER') {
        battalionQuery.id = user.battalionId;
      } else if (user.role === 'RANGE_ADMIN') {
        battalionQuery.rangeId = user.rangeId;
      }
      
      const battalions = await Battalion.findAll({
        where: battalionQuery,
        attributes: ['id', 'battalionName', 'rangeId'],
        include: [{
          model: Range,
          as: 'range',
          attributes: ['id', 'rangeName']
        }],
        order: [['battalionName', 'ASC']]
      });
      
      // Get modules
      const modules = await Module.findAll({
        where: { active: true },
        attributes: ['id', 'moduleName'], // Removed description - field doesn't exist
        order: [['priority', 'ASC'], ['moduleName', 'ASC']] // Fixed sequenceOrder to priority
      });
      
      // Get ranges (if user has access)
      let ranges = [];
      if (user.role === 'SYSTEM_ADMIN') {
        ranges = await Range.findAll({
          where: { active: true },
          attributes: ['id', 'rangeName'], // Removed rangeCode - field doesn't exist
          order: [['rangeName', 'ASC']]
        });
      } else if (user.role === 'RANGE_ADMIN') {
        ranges = await Range.findAll({
          where: { id: user.rangeId, active: true },
          attributes: ['id', 'rangeName'] // Removed rangeCode - field doesn't exist
        });
      }
      
      return {
        battalions: battalions.map(b => ({
          id: b.id,
          name: b.battalionName,
          rangeId: b.rangeId,
          rangeName: b.range?.rangeName
        })),
        ranges: ranges.map(r => ({
          id: r.id,
          name: r.rangeName,
          code: r.id // Using range ID as code since rangeCode field doesn't exist
        })),
        modules: modules.map(m => ({
          id: m.id,
          name: m.moduleName,
          description: m.moduleName // Using moduleName as description since description field doesn't exist
        })),
        reportTypes: [
          { value: 'SUMMARY', label: 'Summary Report' },
          { value: 'DETAILED', label: 'Detailed Report' },
          { value: 'COMPARISON', label: 'Comparison Report' },
          { value: 'TREND', label: 'Trend Analysis' },
          { value: 'PERFORMANCE', label: 'Performance Report' },
          { value: 'COMPLIANCE', label: 'Compliance Report' }
        ],
        viewTypes: [
          { value: 'TABLE', label: 'Table Only' },
          { value: 'CHART', label: 'Chart Only' },
          { value: 'BOTH', label: 'Table and Chart' }
        ],
        formats: [
          { value: 'JSON', label: 'JSON Response' },
          { value: 'CSV', label: 'CSV File' },
          { value: 'EXCEL', label: 'Excel File' },
          { value: 'PDF', label: 'PDF Document' }
        ],
        statusOptions: [
          { value: 'DRAFT', label: 'Draft' },
          { value: 'SUBMITTED', label: 'Submitted' },
          { value: 'APPROVED', label: 'Approved' },
          { value: 'REJECTED', label: 'Rejected' },
          { value: 'PENDING', label: 'Pending' }
        ],
        sortOptions: [
          { value: 'battalionName', label: 'Battalion Name' },
          { value: 'moduleName', label: 'Module Name' },
          { value: 'topicName', label: 'Topic Name' },
          { value: 'lastUpdated', label: 'Last Updated' },
          { value: 'createdAt', label: 'Created Date' },
          { value: 'value', label: 'Value' }
        ]
      };
    } catch (error) {
      logger.error('Failed to get report metadata', { error: error.message });
      throw error;
    }
  }

  // Helper methods
  generateReportId() {
    return `RPT_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  getQuarterDates(quarter, financialYear) {
    const [startYear, endYear] = financialYear.split('-');
    const baseYear = parseInt(startYear);
    
    const quarters = {
      'Q1': { start: new Date(`${baseYear}-04-01`), end: new Date(`${baseYear}-06-30`) },
      'Q2': { start: new Date(`${baseYear}-07-01`), end: new Date(`${baseYear}-09-30`) },
      'Q3': { start: new Date(`${baseYear}-10-01`), end: new Date(`${baseYear}-12-31`) },
      'Q4': { start: new Date(`${baseYear + 1}-01-01`), end: new Date(`${baseYear + 1}-03-31`) }
    };
    
    return quarters[quarter] || quarters['Q1'];
  }

  parseNumericValue(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  calculatePerformanceGrade(value) {
    if (value === null || value === undefined) return null;
    if (value >= 90) return 'A+';
    if (value >= 80) return 'A';
    if (value >= 70) return 'B';
    if (value >= 60) return 'C';
    return 'D';
  }

  calculateDataQualityScore(record) {
    let score = 100;
    if (!record.value || record.value.trim() === '') score -= 30;
    if (!record.status || record.status === 'DRAFT') score -= 20;
    if (!record.monthYear) score -= 10;
    return Math.max(0, score);
  }

  determineCompletionStatus(record) {
    if (!record.value || record.value.trim() === '') return 'INCOMPLETE';
    if (record.status === 'SUBMITTED' || record.status === 'APPROVED') return 'COMPLETE';
    return 'PARTIAL';
  }

  generateInsights(overview, completionStats, battalionPerformance) {
    const insights = [];
    
    if (completionStats.submissionRate > 80) {
      insights.push(`Excellent overall submission rate of ${completionStats.submissionRate}%`);
    } else if (completionStats.submissionRate < 50) {
      insights.push(`Low submission rate of ${completionStats.submissionRate}% needs attention`);
    }
    
    const avgCompletionRate = battalionPerformance.reduce((sum, b) => sum + parseFloat(b.completionRate), 0) / battalionPerformance.length;
    if (avgCompletionRate > 85) {
      insights.push('Overall battalion performance is excellent');
    } else if (avgCompletionRate < 60) {
      insights.push('Battalion performance needs improvement across the board');
    }
    
    return insights;
  }

  generateAlerts(battalionPerformance, completionStats) {
    const alerts = [];
    
    const lowPerformers = battalionPerformance.filter(b => parseFloat(b.completionRate) < 50);
    if (lowPerformers.length > 0) {
      alerts.push({
        type: 'WARNING',
        message: `${lowPerformers.length} battalions have completion rate below 50%`,
        severity: 'HIGH',
        affectedBattalions: lowPerformers.map(b => b.battalionName)
      });
    }
    
    if (completionStats.submissionRate < 70) {
      alerts.push({
        type: 'ALERT',
        message: 'Overall submission rate is below target threshold',
        severity: 'MEDIUM'
      });
    }
    
    return alerts;
  }

  generateRecommendations(battalionPerformance, completionStats) {
    const recommendations = [];
    
    const lowPerformers = battalionPerformance.filter(b => parseFloat(b.completionRate) < 70);
    if (lowPerformers.length > 0) {
      recommendations.push('Provide additional training and support to underperforming battalions');
      recommendations.push('Implement regular check-ins with battalion heads of low-performing units');
    }
    
    if (completionStats.submissionRate < 80) {
      recommendations.push('Implement automated reminder systems for pending submissions');
      recommendations.push('Consider extending submission deadlines for complex modules');
    }
    
    return recommendations;
  }

  getChartColor(index) {
    const colors = [
      '#36A2EB', '#FF6384', '#4BC0C0', '#FF9F40', '#9966FF',
      '#FFCD56', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'
    ];
    return colors[index % colors.length];
  }

  getOptimizationSuggestions(recordsReturned, processingTime) {
    const suggestions = [];
    
    if (processingTime > 5000) {
      suggestions.push('Consider using smaller page sizes for faster loading');
      suggestions.push('Add more specific filters to reduce dataset size');
    }
    
    if (recordsReturned > 1000) {
      suggestions.push('Large result set detected - consider using pagination');
    }
    
    return suggestions;
  }

  generateTrendChartData(data, config) {
    // Group data by month-year
    const trendData = {};
    data.forEach(record => {
      const monthYear = record.monthYear || 'Unknown';
      if (!trendData[monthYear]) {
        trendData[monthYear] = { total: 0, submitted: 0 };
      }
      trendData[monthYear].total++;
      if (record.status === 'SUBMITTED' || record.status === 'APPROVED') {
        trendData[monthYear].submitted++;
      }
    });
    
    // Sort by month-year
    const sortedMonths = Object.keys(trendData).sort();
    const completionRates = sortedMonths.map(month => 
      trendData[month].total > 0 
        ? (trendData[month].submitted / trendData[month].total * 100).toFixed(2)
        : 0
    );
    
    return {
      chartType: 'LINE',
      title: 'Performance Trend Over Time',
      subtitle: config.subtitle,
      dataset: {
        labels: sortedMonths,
        series: [{
          name: 'Completion Rate (%)',
          data: completionRates.map(rate => parseFloat(rate)),
          color: '#36A2EB'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Completion Rate (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time Period'
            }
          }
        }
      }
    };
  }

  generatePerformanceChartData(data, config) {
    // Similar to summary but with performance focus
    return this.generateSummaryChartData(data, config);
  }

  generateDefaultChartData(data, config) {
    return this.generateSummaryChartData(data, config);
  }
}

module.exports = new ReportService();
