const { 
  PerformanceStatistic, 
  User, 
  Question, 
  Module, 
  Topic, 
  SubTopic, 
  State, 
  Range, 
  District 
} = require('../models');
const performanceStatisticService = require('./performanceStatisticService');
const excelGenerator = require('../utils/excelGenerator');
const logger = require('../utils/logger');
const { Op, Sequelize } = require('sequelize');

class ReportService {
  /**
   * Generate detailed report
   * @param {Object} request - Report request parameters
   * @returns {Object} Report response with data and charts
   */
  async getReportDetailed(request) {
    try {
      const {
        stateData,
        rangeData,
        districtData,
        moduleData,
        topicData,
        subTopicData,
        questionData,
        monthData,
        startMonthData,
        endMonthData
      } = request;

      let labels = [];
      let datasets = [];

      // Process month data
      const months = this.processMonthData(startMonthData, endMonthData, monthData);
      
      // Get questions
      const questions = await this.getQuestions(questionData);
      const questionIds = questions.map(q => q.id);

      // Generate report based on hierarchy level
      if (subTopicData && subTopicData.length > 0) {
        // Sub-topic level report
        const reportData = await this.generateSubTopicReport(subTopicData, questionIds, months);
        labels = reportData.labels;
        datasets = reportData.datasets;
      } else if (topicData && topicData.length > 0) {
        // Topic level report
        const reportData = await this.generateTopicReport(topicData, questionIds, months);
        labels = reportData.labels;
        datasets = reportData.datasets;
      } else if (moduleData && moduleData.length > 0) {
        // Module level report
        const reportData = await this.generateModuleReport(moduleData, questionIds, months);
        labels = reportData.labels;
        datasets = reportData.datasets;
      } else if (districtData && districtData.length > 0) {
        // District level report
        const reportData = await this.generateDistrictReport(districtData, questionIds, months);
        labels = reportData.labels;
        datasets = reportData.datasets;
      } else if (rangeData && rangeData.length > 0) {
        // Range level report
        const reportData = await this.generateRangeReport(rangeData, questionIds, months);
        labels = reportData.labels;
        datasets = reportData.datasets;
      } else if (stateData && stateData.length > 0) {
        // State level report
        const reportData = await this.generateStateReport(stateData, questionIds, months);
        labels = reportData.labels;
        datasets = reportData.datasets;
      } else {
        // National level report
        const reportData = await this.generateNationalReport(questionIds, months);
        labels = reportData.labels;
        datasets = reportData.datasets;
      }

      return {
        status: 'SUCCESS',
        message: 'Report generated successfully',
        labels,
        datasets,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          questionType: q.questionType
        }))
      };

    } catch (error) {
      logger.error('Error generating report:', error);
      return {
        status: 'ERROR',
        message: 'Failed to generate report',
        error: error.message
      };
    }
  }

  /**
   * Generate Excel report
   * @param {Object} request - Report request parameters
   * @returns {Buffer} Excel file buffer
   */
  async generateExcelReport(request) {
    try {
      const reportData = await this.getReportDetailed(request);
      
      if (reportData.status === 'ERROR') {
        throw new Error(reportData.message);
      }

      // Prepare data for Excel generation
      const excelData = {
        labels: reportData.labels,
        datasets: reportData.datasets,
        questions: reportData.questions,
        title: this.getReportTitle(request),
        generatedAt: new Date().toISOString()
      };

      const excelBuffer = await excelGenerator.generateReportExcel(excelData);
      
      logger.info('Excel report generated successfully');
      return excelBuffer;

    } catch (error) {
      logger.error('Error generating Excel report:', error);
      throw error;
    }
  }

  /**
   * Generate district-specific report
   * @param {Object} request - Report request parameters
   * @returns {Buffer} Excel file buffer
   */
  async generateDistrictReport(request) {
    try {
      const { districtData, questionData, monthData } = request;
      
      if (!districtData || districtData.length === 0) {
        throw new Error('District data is required for district report');
      }

      // Get district details
      const districts = await District.findAll({
        where: { id: { [Op.in]: districtData } },
        include: [
          { model: Range, as: 'range' },
          { model: State, as: 'state' }
        ]
      });

      // Get questions
      const questions = await this.getQuestions(questionData);
      const questionIds = questions.map(q => q.id);

      // Get performance data
      const performanceData = await performanceStatisticService.getByDistrictIdAndQuestionIds(
        districtData, 
        questionIds, 
        monthData
      );

      // Process data for Excel
      const excelData = this.processDistrictReportData(performanceData, districts, questions);
      
      const excelBuffer = await excelGenerator.generateDistrictReportExcel(excelData);
      
      logger.info('District report generated successfully');
      return excelBuffer;

    } catch (error) {
      logger.error('Error generating district report:', error);
      throw error;
    }
  }

  /**
   * Process month data from request
   * @param {string} startMonth - Start month in format "MM:YYYY"
   * @param {string} endMonth - End month in format "MM:YYYY"
   * @param {Array} monthData - Array of month strings
   * @returns {Array} Processed month array
   */
  processMonthData(startMonth, endMonth, monthData) {
    if (monthData && monthData.length > 0) {
      return monthData;
    }

    if (startMonth && endMonth) {
      if (startMonth === endMonth) {
        // Single month
        const [month, year] = startMonth.split(':');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return [date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()];
      } else {
        // Month range
        return this.generateMonthRange(startMonth, endMonth);
      }
    }

    return [];
  }

  /**
   * Generate month range between start and end months
   * @param {string} startMonth - Start month in format "MM:YYYY"
   * @param {string} endMonth - End month in format "MM:YYYY"
   * @returns {Array} Array of month strings
   */
  generateMonthRange(startMonth, endMonth) {
    const months = [];
    const [startMM, startYYYY] = startMonth.split(':').map(Number);
    const [endMM, endYYYY] = endMonth.split(':').map(Number);

    let currentDate = new Date(startYYYY, startMM - 1, 1);
    const endDate = new Date(endYYYY, endMM - 1, 1);

    while (currentDate <= endDate) {
      months.push(currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase());
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }

  /**
   * Get questions by IDs
   * @param {Array} questionIds - Array of question IDs
   * @returns {Array} Questions
   */
  async getQuestions(questionIds) {
    if (!questionIds || questionIds.length === 0) {
      return await Question.findAll({ where: { active: true } });
    }

    return await Question.findAll({
      where: { 
        id: { [Op.in]: questionIds },
        active: true 
      }
    });
  }

  /**
   * Generate sub-topic level report
   * @param {Array} subTopicIds - Sub-topic IDs
   * @param {Array} questionIds - Question IDs
   * @param {Array} months - Month filters
   * @returns {Object} Report data
   */
  async generateSubTopicReport(subTopicIds, questionIds, months) {
    const performanceData = await performanceStatisticService.getBySubTopicIdAndQuestionIds(
      subTopicIds, 
      questionIds, 
      months
    );

    const labels = await performanceStatisticService.getLabelsByFilters({
      subTopicId: subTopicIds,
      questionIds
    });

    // Get sub-topics for dataset labels
    const subTopics = await SubTopic.findAll({
      where: { id: { [Op.in]: subTopicIds } }
    });

    const datasets = this.processDataForChart(performanceData, subTopics, 'subTopicId', labels);

    return { labels, datasets };
  }

  /**
   * Generate topic level report
   * @param {Array} topicIds - Topic IDs
   * @param {Array} questionIds - Question IDs
   * @param {Array} months - Month filters
   * @returns {Object} Report data
   */
  async generateTopicReport(topicIds, questionIds, months) {
    const performanceData = await performanceStatisticService.getByTopicIdAndQuestionIds(
      topicIds, 
      questionIds, 
      months
    );

    const labels = await performanceStatisticService.getLabelsByFilters({
      topicId: topicIds,
      questionIds
    });

    const topics = await Topic.findAll({
      where: { id: { [Op.in]: topicIds } }
    });

    const datasets = this.processDataForChart(performanceData, topics, 'topicId', labels);

    return { labels, datasets };
  }

  /**
   * Generate module level report
   * @param {Array} moduleIds - Module IDs
   * @param {Array} questionIds - Question IDs
   * @param {Array} months - Month filters
   * @returns {Object} Report data
   */
  async generateModuleReport(moduleIds, questionIds, months) {
    const performanceData = await performanceStatisticService.getByModuleIdAndQuestionIds(
      moduleIds, 
      questionIds, 
      months
    );

    const labels = await performanceStatisticService.getLabelsByFilters({
      moduleId: moduleIds,
      questionIds
    });

    const modules = await Module.findAll({
      where: { id: { [Op.in]: moduleIds } }
    });

    const datasets = this.processDataForChart(performanceData, modules, 'moduleId', labels);

    return { labels, datasets };
  }

  /**
   * Generate district level report
   * @param {Array} districtIds - District IDs
   * @param {Array} questionIds - Question IDs
   * @param {Array} months - Month filters
   * @returns {Object} Report data
   */
  async generateDistrictReport(districtIds, questionIds, months) {
    const performanceData = await performanceStatisticService.getByDistrictIdAndQuestionIds(
      districtIds, 
      questionIds, 
      months
    );

    const labels = await performanceStatisticService.getLabelsByFilters({
      districtId: districtIds,
      questionIds
    });

    const districts = await District.findAll({
      where: { id: { [Op.in]: districtIds } }
    });

    const datasets = this.processDataForChart(performanceData, districts, 'districtId', labels);

    return { labels, datasets };
  }

  /**
   * Generate range level report
   * @param {Array} rangeIds - Range IDs
   * @param {Array} questionIds - Question IDs
   * @param {Array} months - Month filters
   * @returns {Object} Report data
   */
  async generateRangeReport(rangeIds, questionIds, months) {
    const performanceData = await performanceStatisticService.getByRangeIdAndQuestionIds(
      rangeIds, 
      questionIds, 
      months
    );

    const labels = await performanceStatisticService.getLabelsByFilters({
      rangeId: rangeIds,
      questionIds
    });

    const ranges = await Range.findAll({
      where: { id: { [Op.in]: rangeIds } }
    });

    const datasets = this.processDataForChart(performanceData, ranges, 'rangeId', labels);

    return { labels, datasets };
  }

  /**
   * Generate state level report
   * @param {Array} stateIds - State IDs
   * @param {Array} questionIds - Question IDs
   * @param {Array} months - Month filters
   * @returns {Object} Report data
   */
  async generateStateReport(stateIds, questionIds, months) {
    const performanceData = await performanceStatisticService.getByStateIdAndQuestionIds(
      stateIds[0], // Single state
      questionIds, 
      months
    );

    const labels = await performanceStatisticService.getLabelsByFilters({
      stateId: stateIds[0],
      questionIds
    });

    const states = await State.findAll({
      where: { id: { [Op.in]: stateIds } }
    });

    const datasets = this.processDataForChart(performanceData, states, 'stateId', labels);

    return { labels, datasets };
  }

  /**
   * Generate national level report
   * @param {Array} questionIds - Question IDs
   * @param {Array} months - Month filters
   * @returns {Object} Report data
   */
  async generateNationalReport(questionIds, months) {
    const performanceData = await performanceStatisticService.getByStateIdAndQuestionIds(
      questionIds, 
      months
    );

    const labels = await performanceStatisticService.getLabelsByFilters({
      questionIds
    });

    const states = await State.findAll({ where: { active: true } });

    const datasets = this.processDataForChart(performanceData, states, 'stateId', labels);

    return { labels, datasets };
  }

  /**
   * Process data for chart visualization
   * @param {Array} performanceData - Raw performance data
   * @param {Array} entities - Entities (states, districts, etc.)
   * @param {string} groupByField - Field to group by
   * @param {Array} labels - Chart labels
   * @returns {Array} Processed datasets
   */
  processDataForChart(performanceData, entities, groupByField, labels) {
    const datasets = [];

    entities.forEach(entity => {
      const entityData = performanceData.filter(d => d[groupByField] === entity.id);
      
      const data = labels.map(label => {
        const monthData = entityData.find(d => d.monthYear === label);
        return monthData ? parseFloat(monthData.totalValue) : 0;
      });

      datasets.push({
        label: entity.name || entity.title || entity.stateName || entity.rangeName || entity.districtName,
        data,
        backgroundColor: this.generateColor(entity.id),
        borderColor: this.generateColor(entity.id),
        borderWidth: 1
      });
    });

    return datasets;
  }

  /**
   * Process district report data for Excel
   * @param {Array} performanceData - Performance data
   * @param {Array} districts - District entities
   * @param {Array} questions - Questions
   * @returns {Object} Processed data for Excel
   */
  processDistrictReportData(performanceData, districts, questions) {
    const processedData = {
      title: 'District Performance Report',
      districts: districts.map(d => ({
        id: d.id,
        name: d.districtName,
        rangeName: d.range?.rangeName,
        stateName: d.state?.stateName
      })),
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        questionType: q.questionType
      })),
      data: performanceData,
      generatedAt: new Date().toISOString()
    };

    return processedData;
  }

  /**
   * Get report title based on request parameters
   * @param {Object} request - Report request
   * @returns {string} Report title
   */
  getReportTitle(request) {
    const { stateData, rangeData, districtData, moduleData, topicData, subTopicData } = request;

    if (subTopicData?.length > 0) return 'Sub-Topic Performance Report';
    if (topicData?.length > 0) return 'Topic Performance Report';
    if (moduleData?.length > 0) return 'Module Performance Report';
    if (districtData?.length > 0) return 'District Performance Report';
    if (rangeData?.length > 0) return 'Range Performance Report';
    if (stateData?.length > 0) return 'State Performance Report';
    
    return 'National Performance Report';
  }

  /**
   * Generate color for chart datasets
   * @param {number} id - Entity ID
   * @returns {string} Color string
   */
  generateColor(id) {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    return colors[id % colors.length];
  }

  /**
   * Get performance summary by user
   * @param {number} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Object} User performance summary
   */
  async getUserPerformanceSummary(userId, filters = {}) {
    const { monthYear, questionIds } = filters;

    const summary = await performanceStatisticService.getSummary({
      userId,
      monthYear,
      questionIds
    });

    // Get user details
    const user = await User.findByPk(userId, {
      include: [
        { model: State, as: 'state' },
        { model: Range, as: 'range' },
        { model: District, as: 'district' }
      ]
    });

    return {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        location: {
          state: user.state?.stateName,
          range: user.range?.rangeName,
          district: user.district?.districtName
        }
      },
      summary
    };
  }
}

module.exports = new ReportService();