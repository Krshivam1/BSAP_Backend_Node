const { PerformanceStatistic, User, Question, Module, Topic, SubTopic, State, Range, District, Battalion } = require('../models');
const logger = require('../utils/logger');
const { Op, Sequelize } = require('sequelize');

class PerformanceStatisticService {
  /**
   * Get all performance statistics by user ID
   * @param {number} userId - User ID
   * @returns {Array} Performance statistics
   */
  async getByUserId(userId) {
    const statistics = await PerformanceStatistic.findAll({
      where: { userId },
      include: [
        { model: Question, as: 'question' },
        { model: Module, as: 'module' },
        { model: Topic, as: 'topic' },
        { model: SubTopic, as: 'subTopic' }
      ],
      order: [['monthYear', 'DESC']]
    });

    return statistics;
  }

  /**
   * Get count by user ID and date
   * @param {number} userId - User ID
   * @param {string} date - Date string (YYYY-MM format)
   * @returns {number} Count
   */
  async getCountByUserIdAndDate(userId, date) {
    const count = await PerformanceStatistic.count({
      where: {
        userId,
        monthYear: { [Op.like]: `%${date}%` }
      }
    });

    return count;
  }

  /**
   * Get statistics by user ID and month
   * @param {number} userId - User ID
   * @param {string} date - Date string (YYYY-MM format)
   * @returns {Array} Performance statistics
   */
  async getByUserIdAndMonth(userId, date) {
    const statistics = await PerformanceStatistic.findAll({
      where: {
        userId,
        monthYear: { [Op.like]: `%${date}%` },
        active: true
      },
      include: [
        { model: Question, as: 'question' },
        { model: Module, as: 'module' },
        { model: Topic, as: 'topic' },
        { model: SubTopic, as: 'subTopic' }
      ],
      order: [['monthYear', 'DESC']]
    });

    return statistics;
  }

  /**
   * Get success count by user ID and date
   * @param {number} userId - User ID
   * @param {string} date - Date string (YYYY-MM format)
   * @returns {number} Success count
   */
  async getSuccessCountByUserIdAndDate(userId, date) {
    const count = await PerformanceStatistic.count({
      where: {
        userId,
        monthYear: { [Op.like]: `%${date}%` },
        active: true,
        status: 'SUCCESS'
      }
    });

    return count;
  }

  /**
   * Get in-progress count by user ID and date
   * @param {number} userId - User ID
   * @param {string} date - Date string (YYYY-MM format)
   * @returns {number} In-progress count
   */
  async getInProgressCountByUserIdAndDate(userId, date) {
    const count = await PerformanceStatistic.count({
      where: {
        userId,
        monthYear: { [Op.like]: `%${date}%` },
        active: true,
        status: 'INPROGRESS'
      }
    });

    return count;
  }

  /**
   * Get aggregated data by user IDs and question IDs
   * @param {Array} userIds - Array of user IDs
   * @param {Array} questionIds - Array of question IDs
   * @returns {Array} Aggregated data
   */
  async getByUserIdsAndQuestionIds(userIds, questionIds) {
    const results = await PerformanceStatistic.findAll({
      attributes: [
        'questionId',
        'monthYear',
        [Sequelize.fn('SUM', Sequelize.col('value')), 'totalValue']
      ],
      where: {
        userId: { [Op.in]: userIds },
        questionId: { [Op.in]: questionIds }
      },
      group: ['questionId', 'monthYear'],
      order: [['questionId', 'ASC'], ['monthYear', 'ASC']],
      raw: true
    });

    return results;
  }

  /**
   * Get aggregated data by district ID and question IDs
   * @param {number|Array} districtId - District ID or array of district IDs
   * @param {Array} questionIds - Array of question IDs
   * @param {Array} months - Optional array of months to filter
   * @returns {Array} Aggregated data
   */
  async getByDistrictIdAndQuestionIds(districtId, questionIds, months = null) {
    const whereCondition = {
      status: 'SUCCESS',
      questionId: { [Op.in]: questionIds }
    };

    if (Array.isArray(districtId)) {
      whereCondition.districtId = { [Op.in]: districtId };
    } else {
      whereCondition.districtId = districtId;
    }

    if (months && months.length > 0) {
      whereCondition.monthYear = { [Op.in]: months };
    }

    const results = await PerformanceStatistic.findAll({
      attributes: [
        'moduleId',
        'questionId',
        'monthYear',
        [Sequelize.fn('SUM', Sequelize.col('value')), 'totalValue']
      ],
      where: whereCondition,
      group: ['moduleId', 'monthYear'],
      order: [['questionId', 'ASC'], ['monthYear', 'ASC']],
      raw: true
    });

    return results;
  }

  /**
   * Get aggregated data by range ID and question IDs
   * @param {number|Array} rangeId - Range ID or array of range IDs
   * @param {Array} questionIds - Array of question IDs
   * @param {Array} months - Optional array of months to filter
   * @returns {Array} Aggregated data
   */
  async getByRangeIdAndQuestionIds(rangeId, questionIds, months = null) {
    const whereCondition = {
      status: 'SUCCESS',
      questionId: { [Op.in]: questionIds }
    };

    if (Array.isArray(rangeId)) {
      whereCondition.rangeId = { [Op.in]: rangeId };
    } else {
      whereCondition.rangeId = rangeId;
    }

    if (months && months.length > 0) {
      whereCondition.monthYear = { [Op.in]: months };
    }

    const results = await PerformanceStatistic.findAll({
      attributes: [
        'districtId',
        'questionId',
        'monthYear',
        [Sequelize.fn('SUM', Sequelize.col('value')), 'totalValue']
      ],
      where: whereCondition,
      group: ['districtId', 'monthYear'],
      order: [['districtId', 'DESC'], ['questionId', 'ASC'], ['monthYear', 'ASC']],
      raw: true
    });

    return results;
  }

  /**
   * Get aggregated data by state ID and question IDs
   * @param {number} stateId - State ID
   * @param {Array} questionIds - Array of question IDs
   * @param {Array} months - Optional array of months to filter
   * @returns {Array} Aggregated data
   */
  async getByStateIdAndQuestionIds(stateId, questionIds, months = null) {
    const whereCondition = {
      status: 'SUCCESS',
      questionId: { [Op.in]: questionIds }
    };

    if (stateId) {
      whereCondition.stateId = stateId;
    }

    if (months && months.length > 0) {
      whereCondition.monthYear = { [Op.in]: months };
    }

    const results = await PerformanceStatistic.findAll({
      attributes: [
        'rangeId',
        'questionId',
        'monthYear',
        [Sequelize.fn('SUM', Sequelize.col('value')), 'totalValue']
      ],
      where: whereCondition,
      group: ['rangeId', 'monthYear'],
      order: [['questionId', 'ASC'], ['monthYear', 'ASC']],
      raw: true
    });

    return results;
  }

  /**
   * Get aggregated data by module ID and question IDs
   * @param {number|Array} moduleId - Module ID or array of module IDs
   * @param {Array} questionIds - Array of question IDs
   * @param {Array} months - Optional array of months to filter
   * @returns {Array} Aggregated data
   */
  async getByModuleIdAndQuestionIds(moduleId, questionIds, months = null) {
    const whereCondition = {
      status: 'SUCCESS',
      questionId: { [Op.in]: questionIds }
    };

    if (Array.isArray(moduleId)) {
      whereCondition.moduleId = { [Op.in]: moduleId };
    } else {
      whereCondition.moduleId = moduleId;
    }

    if (months && months.length > 0) {
      whereCondition.monthYear = { [Op.in]: months };
    }

    const results = await PerformanceStatistic.findAll({
      attributes: [
        'topicId',
        'questionId',
        'monthYear',
        [Sequelize.fn('SUM', Sequelize.col('value')), 'totalValue']
      ],
      where: whereCondition,
      group: ['topicId', 'monthYear'],
      order: [['questionId', 'ASC'], ['monthYear', 'ASC']],
      raw: true
    });

    return results;
  }

  /**
   * Get aggregated data by topic ID and question IDs
   * @param {number|Array} topicId - Topic ID or array of topic IDs
   * @param {Array} questionIds - Array of question IDs
   * @param {Array} months - Optional array of months to filter
   * @returns {Array} Aggregated data
   */
  async getByTopicIdAndQuestionIds(topicId, questionIds, months = null) {
    const whereCondition = {
      status: 'SUCCESS',
      questionId: { [Op.in]: questionIds }
    };

    if (Array.isArray(topicId)) {
      whereCondition.topicId = { [Op.in]: topicId };
    } else {
      whereCondition.topicId = topicId;
    }

    if (months && months.length > 0) {
      whereCondition.monthYear = { [Op.in]: months };
    }

    const results = await PerformanceStatistic.findAll({
      attributes: [
        'subTopicId',
        'questionId',
        'monthYear',
        [Sequelize.fn('SUM', Sequelize.col('value')), 'totalValue']
      ],
      where: whereCondition,
      group: ['subTopicId', 'monthYear', 'questionId'],
      order: [['questionId', 'ASC'], ['monthYear', 'ASC']],
      raw: true
    });

    return results;
  }

  /**
   * Get aggregated data by sub-topic ID and question IDs
   * @param {number|Array} subTopicId - Sub-topic ID or array of sub-topic IDs
   * @param {Array} questionIds - Array of question IDs
   * @param {Array} months - Optional array of months to filter
   * @returns {Array} Aggregated data
   */
  async getBySubTopicIdAndQuestionIds(subTopicId, questionIds, months = null) {
    const whereCondition = {
      status: 'SUCCESS',
      questionId: { [Op.in]: questionIds }
    };

    if (Array.isArray(subTopicId)) {
      whereCondition.subTopicId = { [Op.in]: subTopicId };
    } else {
      whereCondition.subTopicId = subTopicId;
    }

    if (months && months.length > 0) {
      whereCondition.monthYear = { [Op.in]: months };
    }

    const results = await PerformanceStatistic.findAll({
      attributes: [
        'subTopicId',
        'questionId',
        'monthYear',
        [Sequelize.fn('SUM', Sequelize.col('value')), 'totalValue']
      ],
      where: whereCondition,
      group: ['monthYear', 'questionId'],
      order: [['questionId', 'ASC'], ['monthYear', 'ASC']],
      raw: true
    });

    return results;
  }

  /**
   * Get all unique month-year labels
   * @returns {Array} Array of month-year labels
   */
  async getAllLabels() {
    const results = await PerformanceStatistic.findAll({
      attributes: ['monthYear'],
      group: ['monthYear'],
      order: [['monthYear', 'ASC']],
      raw: true
    });

    return results.map(r => r.monthYear);
  }

  /**
   * Get labels by various filters
   * @param {Object} filters - Filter conditions
   * @returns {Array} Array of month-year labels
   */
  async getLabelsByFilters(filters) {
    const { districtId, rangeId, stateId, moduleId, topicId, subTopicId, questionIds } = filters;
    
    const whereCondition = {
      status: 'SUCCESS',
      questionId: { [Op.in]: questionIds }
    };

    if (districtId) {
      if (Array.isArray(districtId)) {
        whereCondition.districtId = { [Op.in]: districtId };
      } else {
        whereCondition.districtId = districtId;
      }
    }

    if (rangeId) {
      if (Array.isArray(rangeId)) {
        whereCondition.rangeId = { [Op.in]: rangeId };
      } else {
        whereCondition.rangeId = rangeId;
      }
    }

    if (stateId) whereCondition.stateId = stateId;
    if (moduleId) whereCondition.moduleId = moduleId;
    if (topicId) whereCondition.topicId = topicId;
    if (subTopicId) whereCondition.subTopicId = subTopicId;

    const results = await PerformanceStatistic.findAll({
      attributes: ['monthYear'],
      where: whereCondition,
      group: ['monthYear'],
      order: [['monthYear', 'ASC']],
      raw: true
    });

    return results.map(r => r.monthYear);
  }

  /**
   * Get values for report generation
   * @param {Object} filters - Filter conditions
   * @returns {Array} Report data
   */
  async getValuesForReport(filters) {
    const { type, id, questionId, subTopicId, userIds } = filters;
    
    let whereCondition = {
      status: 'SUCCESS',
      questionId
    };

    let groupBy = ['monthYear'];
    let attributes = ['monthYear', [Sequelize.fn('SUM', Sequelize.col('value')), 'totalValue']];

    switch (type) {
      case 'state':
        whereCondition.stateId = id;
        break;
      case 'range':
        whereCondition.rangeId = id;
        break;
      case 'district':
        whereCondition.districtId = id;
        break;
      case 'user':
        if (Array.isArray(id)) {
          whereCondition.userId = { [Op.in]: id };
          attributes = ['userId', 'monthYear', 'value'];
          groupBy = ['userId', 'monthYear'];
        } else {
          whereCondition.userId = id;
        }
        break;
      case 'multiUser':
        whereCondition.userId = { [Op.in]: userIds || id };
        attributes = ['userId', 'monthYear', 'value'];
        groupBy = ['userId', 'monthYear'];
        break;
    }

    if (subTopicId) {
      whereCondition.subTopicId = subTopicId;
    }

    const results = await PerformanceStatistic.findAll({
      attributes,
      where: whereCondition,
      group: groupBy,
      order: [['monthYear', 'ASC']],
      include: type === 'user' || type === 'multiUser' ? [
        { 
          model: User, 
          as: 'user',
          include: [{ model:Battalion, as: 'battalion' }]
        }
      ] : [],
      raw: type !== 'user' && type !== 'multiUser'
    });

    return results;
  }

  /**
   * Create new performance statistic
   * @param {Object} data - Performance statistic data
   * @returns {Object} Created performance statistic
   */
  async create(data) {
    const { 
      userId, 
      questionId, 
      moduleId, 
      topicId, 
      subTopicId, 
      stateId, 
      rangeId, 
      districtId, 
      value, 
      monthYear,
      status = 'INPROGRESS'
    } = data;

    // Validation
    if (!userId || !questionId || !moduleId || !value || !monthYear) {
      throw new Error('User ID, question ID, module ID, value, and month-year are required');
    }

    const statistic = await PerformanceStatistic.create({
      userId,
      questionId,
      moduleId,
      topicId,
      subTopicId,
      stateId,
      rangeId,
      districtId,
      value,
      monthYear,
      status,
      createdBy: userId,
      updatedBy: userId,
      active: true
    });

    logger.info(`Performance statistic created for user ${userId}, question ${questionId}, month ${monthYear}`);
    return statistic;
  }

  /**
   * Update performance statistic
   * @param {number} id - Performance statistic ID
   * @param {Object} updateData - Update data
   * @returns {Object} Updated performance statistic
   */
  async update(id, updateData) {
    const statistic = await PerformanceStatistic.findByPk(id);
    if (!statistic) {
      throw new Error('Performance statistic not found');
    }

    await statistic.update(updateData);

    logger.info(`Performance statistic ${id} updated`);
    return statistic;
  }

  /**
   * Delete performance statistic (soft delete)
   * @param {number} id - Performance statistic ID
   * @returns {Object} Response
   */
  async delete(id) {
    const statistic = await PerformanceStatistic.findByPk(id);
    if (!statistic) {
      throw new Error('Performance statistic not found');
    }

    await statistic.update({ active: false });

    logger.info(`Performance statistic ${id} deleted`);
    return {
      success: true,
      message: 'Performance statistic deleted successfully'
    };
  }

  /**
   * Bulk create performance statistics
   * @param {Array} dataArray - Array of performance statistic data
   * @returns {Array} Created performance statistics
   */
  async bulkCreate(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error('Data array is required');
    }

    const statistics = await PerformanceStatistic.bulkCreate(dataArray, {
      validate: true,
      returning: true
    });

    logger.info(`${statistics.length} performance statistics created in bulk`);
    return statistics;
  }

  /**
   * Get performance statistics with pagination
   * @param {Object} filters - Filter and pagination options
   * @returns {Object} Paginated performance statistics
   */
  async getWithPagination(filters = {}) {
    const { 
      page = 1, 
      limit = 20, 
      userId, 
      questionId, 
      moduleId, 
      topicId, 
      subTopicId, 
      stateId, 
      rangeId, 
      districtId, 
      status, 
      monthYear 
    } = filters;

    const offset = (page - 1) * limit;
    const whereCondition = { active: true };

    if (userId) whereCondition.userId = userId;
    if (questionId) whereCondition.questionId = questionId;
    if (moduleId) whereCondition.moduleId = moduleId;
    if (topicId) whereCondition.topicId = topicId;
    if (subTopicId) whereCondition.subTopicId = subTopicId;
    if (stateId) whereCondition.stateId = stateId;
    if (rangeId) whereCondition.rangeId = rangeId;
    if (districtId) whereCondition.districtId = districtId;
    if (status) whereCondition.status = status;
    if (monthYear) whereCondition.monthYear = { [Op.like]: `%${monthYear}%` };

    const { count, rows } = await PerformanceStatistic.findAndCountAll({
      where: whereCondition,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Question, as: 'question' },
        { model: Module, as: 'module' },
        { model: Topic, as: 'topic' },
        { model: SubTopic, as: 'subTopic' },
        { model: State, as: 'state' },
        { model: Range, as: 'range' },
        { model:Battalion, as: 'battalion' }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      hasNext: page < Math.ceil(count / limit),
      hasPrev: page > 1
    };
  }

  /**
   * Get performance form data similar to Java controller
   * @param {Object} params - Module and topic parameters
   * @returns {Object} Form data with modules, topics, and questions
   */
 async getPerformanceForm({ modulePathId, topicPathId, userId }) {
    try {
      console.log(`Performance form request - Module: ${modulePathId}, Topic: ${topicPathId}, User: ${userId}`);
      
      const startTime = process.hrtime.bigint();
      logger.info(`Function Started AT: ${new Date().toISOString()}`);

      // Date calculations
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Calculate previous month (current - 2 months as per Java logic)
      const prevMonth = new Date(now);
      prevMonth.setMonth(currentMonth - 2);
      const prevMonthYear = prevMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
      
      // Calculate current month year (current month - 1)
      const currentMonthDate = new Date(now);
      currentMonthDate.setMonth(now.getMonth() - 1);
      const currentMonthYear = currentMonthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

      // Get user details
      const user = await User.findByPk(userId, {
        include: [{ model: Battalion, as: 'battalion' }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get module by priority
      const modules = await Module.findAll({
        where: { 
          active: true,
          priority: modulePathId + 1
        },
        order: [['priority', 'ASC']]
      });

      if (!modules.length) {
        throw new Error(`Module not found with priority: ${modulePathId + 1}`);
      }

      const currentModule = modules[0];

      // Check navigation
      const [nextModules, prevModules] = await Promise.all([
        Module.findAll({ where: { active: true, priority: modulePathId + 2 } }),
        Module.findAll({ where: { active: true, priority: modulePathId } })
      ]);

      const moduleData = [];

      for (const module of modules) {
        // Check module completion
        const moduleCompletionCount = await PerformanceStatistic.count({
          where: {
            moduleId: module.id,
            userId,
            monthYear: { [Op.like]: `%${currentMonthYear}%` },
            status: 'SUCCESS'
          }
        });

        // Get topics
        const allTopics = await Topic.findAll({
          where: { 
            moduleId: module.id,
            active: true
          },
          order: [['priority', 'ASC']]
        });

        if (!allTopics.length || topicPathId - 1 >= allTopics.length || topicPathId < 1) {
          continue;
        }

        const currentTopic = allTopics[topicPathId - 1];
        
        // Check topic navigation
        const hasNextTopic = topicPathId < allTopics.length;
        const hasPrevTopic = topicPathId > 1;

        // Process topic based on form type
        let topicData;
        switch (currentTopic.formType) {
          case 'NORMAL':
            topicData = await this.processNormalForm(currentTopic, userId, currentMonthYear, prevMonthYear, currentYear);
            break;
          case 'ST/Q':
            topicData = await this.processSTQForm(currentTopic, userId, currentMonthYear, prevMonthYear, currentYear);
            break;
          case 'Q/ST':
            topicData = await this.processQSTForm(currentTopic, userId, currentMonthYear, prevMonthYear, currentYear);
            break;
          default:
            topicData = await this.processNormalForm(currentTopic, userId, currentMonthYear, prevMonthYear, currentYear);
        }

        // Add navigation info
        topicData.nextTopic = hasNextTopic;
        topicData.prevTopic = hasPrevTopic;

        moduleData.push({
          id: module.id,
          moduleName: module.moduleName,
          priority: module.priority,
          isDisabled: moduleCompletionCount > 0,
          topicDTOs: [topicData]
        });
      }

      // Check success status
      const isSuccess = await this.checkSuccessStatus(user, currentMonthYear);

      return {
        modules: moduleData,
        userDistrict: user.battalion?.battalionName || 'Unknown District',
        monthYear: currentMonthYear,
        isSuccess,
        nextModule: nextModules.length > 0,
        prevModule: prevModules.length > 0,
        nextTopic: moduleData[0]?.topicDTOs[0]?.nextTopic || false,
        prevTopic: moduleData[0]?.topicDTOs[0]?.prevTopic || false
      };

    } catch (error) {
      logger.error('Error getting performance form data:', error);
      throw error;
    }
  }

  async processNormalForm(topic, userId, currentMonthYear, prevMonthYear, currentYear) {
    const questions = await Question.findAll({
      where: { topicId: topic.id, active: true },
      order: [['priority', 'ASC']]
    });

    const questionIds = questions.map(q => q.id);
    
    // Generate financial year months
    const months = this.generateFinancialYearMonths(topic, currentYear);

    // Bulk queries for performance
    const [prevData, finYearData, currentData] = await Promise.all([
      this.getBulkPreviousData(prevMonthYear, questionIds, userId),
      this.getBulkFinYearData(months, questionIds, userId),
      this.getBulkCurrentData(currentMonthYear, questionIds, userId)
    ]);

    const processedQuestions = [];
    let totalCurrentCount = 0;
    let lastMonthEndValue = null;
    let oldSubTopicID = 0;
    let tId = 1;

    for (const question of questions) {
      const questionDTO = this.createQuestionDTO(question);

      // Handle subtopic grouping
      if (question.subTopicId && question.subTopicId !== oldSubTopicID) {
        oldSubTopicID = question.subTopicId;
        tId = 1;
      }
      questionDTO.tId = tId++;

      // Find data for this question
      const prevValue = prevData.find(d => d.questionId === question.id)?.value;
      const finYearValue = finYearData.find(d => d.questionId === question.id)?.value;
      const currentValue = currentData.find(d => d.questionId === question.id)?.value;
      const status = currentData.find(d => d.questionId === question.id)?.status;

      // Set previous count
      if (prevValue && this.shouldShowPrevious(question, topic)) {
        questionDTO.previousCount = prevValue;
        
        if (this.shouldIncludeInTotal(question, prevValue)) {
          totalCurrentCount += this.parseNumericValue(prevValue);
        }
      }

      // Set financial year count
      if (finYearValue && this.shouldShowCummulative(question)) {
        questionDTO.finYearCount = finYearValue;
        
        // Check for end of month values
        if (this.isEndOfMonthQuestion(question.question)) {
          lastMonthEndValue = prevValue;
        }
      }

      // Apply default value logic
      const processedCurrentValue = await this.applyDefaultValue(
        question, 
        prevValue, 
        currentValue, 
        userId, 
        prevMonthYear,
        lastMonthEndValue
      );

      questionDTO.currentCount = processedCurrentValue;

      // Calculate totals
      if (this.shouldIncludeInTotal(question, processedCurrentValue)) {
        totalCurrentCount += this.parseNumericValue(processedCurrentValue);
      }

      // Set disabled status
      questionDTO.isDisabled = status === 'SUCCESS' || this.hasFormula(question);

      // Get subtopic info if exists
      if (question.subTopicId) {
        const subTopic = await SubTopic.findByPk(question.subTopicId);
        if (subTopic) {
          questionDTO.subTopicName = subTopic.subTopicName;
        }
      }

      processedQuestions.push(questionDTO);
    }

    // Get subtopics
    const subTopics = await SubTopic.findAll({
      where: { topicId: topic.id, active: true },
      order: [['priority', 'ASC']]
    });

    return {
      id: topic.id,
      topicName: topic.topicName,
      topicSubName: topic.topicSubName,
      formType: topic.formType,
      moduleId: topic.moduleId,
      isShowPrevious: topic.isShowPrevious !== false,
      isShowCummulative: topic.isShowCummulative !== false,
      questionDTOs: processedQuestions,
      questions: processedQuestions,
      subTopics: subTopics.map(st => ({
        id: st.id,
        subTopicName: st.subTopicName,
        isDisabled: false
      })),
      totalCurrentCount
    };
  }

  async processSTQForm(topic, userId, currentMonthYear, prevMonthYear, currentYear) {
    const [questions, subTopics] = await Promise.all([
      Question.findAll({
        where: { topicId: topic.id, active: true },
        order: [['priority', 'ASC']]
      }),
      SubTopic.findAll({
        where: { topicId: topic.id, active: true },
        order: [['priority', 'ASC']]
      })
    ]);

    const questionIds = questions.map(q => q.id);
    const subTopicIds = subTopics.map(st => st.id);

    // Bulk queries for subtopic combinations
    const [currentCountData, valueData, finYearData] = await Promise.all([
      this.getCurrentCountAllByUser(currentMonthYear, questionIds, userId, subTopicIds),
      this.getCountByPreviousMonthSub(prevMonthYear, questionIds, userId, subTopicIds),
      this.getFinYearCountAllByUser(currentYear, questionIds, userId, subTopicIds)
    ]);

    const processedQuestions = [];
    const processedSubTopics = subTopics.map(st => ({
      id: st.id,
      subTopicName: st.subTopicName,
      isDisabled: false
    }));

    let tId = 1;

    for (const question of questions) {
      const questionDTO = this.createQuestionDTO(question);
      questionDTO.tId = tId++;

      const currentCountList = [];
      const valueList = [];
      const finYearList = [];

      for (const subTopic of subTopics) {
        // Find data for this question-subtopic combination
        const currentCount = currentCountData.find(
          d => d.questionId === question.id && d.subTopicId === subTopic.id
        )?.value;

        const prevValue = valueData.find(
          d => d.questionId === question.id && d.subTopicId === subTopic.id
        )?.value;

        const finYearValue = finYearData.find(
          d => d.questionId === question.id && d.subTopicId === subTopic.id
        )?.value;

        const status = currentCountData.find(
          d => d.questionId === question.id && d.subTopicId === subTopic.id
        )?.status;

        // Apply default value logic
        const processedValue = await this.applyDefaultValueForSubTopic(
          question,
          subTopic,
          prevValue,
          currentCount,
          userId,
          prevMonthYear
        );

        currentCountList.push(processedValue || '0');
        valueList.push(prevValue || '0');
        finYearList.push(finYearValue || '0');

        // Check if this combination is disabled
        if (status === 'SUCCESS' || this.hasFormulaForCombination(question, subTopic)) {
          questionDTO.isDisabled = true;
        }
      }

      questionDTO.currentCountList = currentCountList;
      questionDTO.valueList = valueList;
      questionDTO.finYearList = finYearList;

      processedQuestions.push(questionDTO);
    }

    return {
      id: topic.id,
      topicName: topic.topicName,
      topicSubName: topic.topicSubName,
      formType: topic.formType,
      moduleId: topic.moduleId,
      isShowPrevious: topic.isShowPrevious !== false,
      isShowCummulative: topic.isShowCummulative !== false,
      questions: processedQuestions,
      subTopics: processedSubTopics
    };
  }

  async processQSTForm(topic, userId, currentMonthYear, prevMonthYear, currentYear) {
    // Similar to ST/Q but with different processing logic for new entries
    const result = await this.processSTQForm(topic, userId, currentMonthYear, prevMonthYear, currentYear);

    // Add new entry detection for Q/ST form
    for (const question of result.questions) {
      for (let i = 0; i < result.subTopics.length; i++) {
        const subTopic = result.subTopics[i];
        
        // Check if this is a new entry
        const preCount = await PerformanceStatistic.count({
          where: {
            questionId: question.id,
            userId,
            subTopicId: subTopic.id,
            monthYear: { [Op.not]: currentMonthYear }
          }
        });

        question.isNewList = question.isNewList || [];
        question.isNewList[i] = preCount === 0;
      }
    }

    return result;
  }

  // Apply default value logic
  async applyDefaultValue(question, prevValue, currentValue, userId, prevMonthYear, lastMonthEndValue) {
    switch (question.defaultVal) {
      case 'PREVIOUS':
        return prevValue || '0';

      case 'QUESTION':
        if (currentValue) return currentValue;
        
        const questValue = await this.getReferencedQuestionValue(
          question.defaultQue,
          userId,
          prevMonthYear,
          question.subTopicId
        );
        return questValue || '0';

      case 'PS':
        return await this.getUserPSCount(userId);

      case 'SUB':
        return await this.getUserSubCount(userId);

      case 'CIRCLE':
        return await this.getUserCircleCount(userId);

      case 'PSOP':
        return await this.getUserPSOPCount(userId);

      case 'NONE':
        return currentValue || '0';

      default:
        // Handle "beginning of month" logic
        if (this.isBeginningOfMonthQuestion(question.question) && lastMonthEndValue) {
          return lastMonthEndValue;
        }
        return '0';
    }
  }

  async applyDefaultValueForSubTopic(question, subTopic, prevValue, currentValue, userId, prevMonthYear) {
    switch (question.defaultVal) {
      case 'PREVIOUS':
        return prevValue || '0';

      case 'QUESTION':
        if (currentValue) return currentValue;
        
        const questValue = await this.getReferencedQuestionValueSub(
          question.defaultQue,
          userId,
          prevMonthYear,
          subTopic.id
        );
        return questValue || '0';

      case 'NONE':
        return currentValue || '0';

      default:
        return '0';
    }
  }

  // Bulk data retrieval methods
  async getBulkPreviousData(prevMonthYear, questionIds, userId) {
    const results = await PerformanceStatistic.findAll({
      where: {
        monthYear: { [Op.like]: `%${prevMonthYear}%` },
        questionId: { [Op.in]: questionIds },
        userId
      },
      attributes: ['questionId', 'value']
    });

    return results.map(r => ({
      questionId: r.questionId,
      value: r.value
    }));
  }

  async getBulkCurrentData(currentMonthYear, questionIds, userId) {
    const results = await PerformanceStatistic.findAll({
      where: {
        monthYear: { [Op.like]: `%${currentMonthYear}%` },
        questionId: { [Op.in]: questionIds },
        userId
      },
      attributes: ['questionId', 'value', 'status']
    });

    return results.map(r => ({
      questionId: r.questionId,
      value: r.value,
      status: r.status
    }));
  }

  async getBulkFinYearData(months, questionIds, userId) {
    const results = await PerformanceStatistic.findAll({
      where: {
        monthYear: { [Op.in]: months },
        questionId: { [Op.in]: questionIds },
        userId
      },
      attributes: ['questionId', 'value']
    });

    return results.map(r => ({
      questionId: r.questionId,
      value: r.value
    }));
  }

  async getCurrentCountAllByUser(currentMonthYear, questionIds, userId, subTopicIds) {
    const results = await PerformanceStatistic.findAll({
      where: {
        monthYear: { [Op.like]: `%${currentMonthYear}%` },
        questionId: { [Op.in]: questionIds },
        userId,
        subTopicId: { [Op.in]: subTopicIds }
      },
      attributes: ['questionId', 'subTopicId', 'value', 'status']
    });

    return results.map(r => ({
      questionId: r.questionId,
      subTopicId: r.subTopicId,
      value: r.value,
      status: r.status
    }));
  }

  async getCountByPreviousMonthSub(prevMonthYear, questionIds, userId, subTopicIds) {
    const results = await PerformanceStatistic.findAll({
      where: {
        monthYear: { [Op.like]: `%${prevMonthYear}%` },
        questionId: { [Op.in]: questionIds },
        userId,
        subTopicId: { [Op.in]: subTopicIds }
      },
      attributes: ['questionId', 'subTopicId', 'value']
    });

    return results.map(r => ({
      questionId: r.questionId,
      subTopicId: r.subTopicId,
      value: r.value
    }));
  }

  async getFinYearCountAllByUser(currentYear, questionIds, userId, subTopicIds) {
    const months = this.generateFinancialYearMonths(null, currentYear);
    
    const results = await PerformanceStatistic.findAll({
      where: {
        monthYear: { [Op.in]: months },
        questionId: { [Op.in]: questionIds },
        userId,
        subTopicId: { [Op.in]: subTopicIds }
      },
      attributes: ['questionId', 'subTopicId', 'value']
    });

    return results.map(r => ({
      questionId: r.questionId,
      subTopicId: r.subTopicId,
      value: r.value
    }));
  }

  // User count methods
  async getUserPSCount(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['psCount'] // Assuming ps count field exists
    });
    return user?.psCount?.toString() || '0';
  }

  async getUserSubCount(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['subCount'] // Assuming sub count field exists  
    });
    return user?.subCount?.toString() || '0';
  }

  async getUserCircleCount(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['circleCount'] // Assuming circle count field exists
    });
    return user?.circleCount?.toString() || '0';
  }

  async getUserPSOPCount(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['psopCount'] // Assuming psop count field exists
    });
    return user?.psopCount?.toString() || '0';
  }

  async getReferencedQuestionValue(questionId, userId, monthYear, subTopicId = null) {
    const where = {
      questionId,
      userId,
      monthYear: { [Op.like]: `%${monthYear}%` }
    };

    if (subTopicId) {
      where.subTopicId = subTopicId;
    }

    const result = await PerformanceStatistic.findOne({
      where,
      attributes: ['value']
    });

    return result?.value || '0';
  }

  async getReferencedQuestionValueSub(questionId, userId, monthYear, subTopicId) {
    return this.getReferencedQuestionValue(questionId, userId, monthYear, subTopicId);
  }

  // Success status check
  async checkSuccessStatus(user, currentMonthYear) {
    const totalModules = await Module.count({ where: { active: true } });
    
    const inProgressCount = await PerformanceStatistic.count({
      where: {
        // Assuming district-based logic, adjust based on your user model
        userId: user.id,
        monthYear: { [Op.like]: `%${currentMonthYear}%` },
        status: 'INPROGRESS'
      }
    });

    const successCount = await PerformanceStatistic.count({
      where: {
        userId: user.id,
        monthYear: { [Op.like]: `%${currentMonthYear}%` },
        status: 'SUCCESS'
      }
    });

    const totalQuestions = await Question.count({ where: { active: true } });

    if (inProgressCount === 0 && successCount >= totalQuestions) {
      // Check if all modules are completed
      const completedModules = await PerformanceStatistic.findAll({
        where: {
          userId: user.id,
          monthYear: { [Op.like]: `%${currentMonthYear}%` },
          status: 'SUCCESS'
        },
        attributes: ['moduleId'],
        group: ['moduleId']
      });

      return completedModules.length === totalModules;
    }

    return false;
  }

  // Helper methods
  createQuestionDTO(question) {
    return {
      id: question.id,
      question: question.question,
      type: question.type,
      topicId: question.topicId,
      subTopicId: question.subTopicId,
      defaultVal: question.defaultVal,
      defaultQue: question.defaultQue,
      defaultSub: question.defaultSub,
      formula: question.formula,
      defaultTo: question.defaultTo,
      defaultFormula: question.defaultFormula,
      priority: question.priority,
      isDisabled: false,
      currentCount: '0',
      previousCount: null,
      finYearCount: null
    };
  }

  generateFinancialYearMonths(topic, currentYear) {
    const months = [];
    const cal = new Date();
    
    if (topic && topic.startMonth !== undefined && topic.endMonth !== undefined) {
      cal.setDate(1);
      cal.setMonth(topic.startMonth + 1);
      cal.setFullYear(currentYear);
      
      const endMonth = topic.endMonth;
      
      do {
        cal.setMonth(cal.getMonth() - 1);
        const monthYear = cal.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }).toUpperCase();
        months.push(monthYear);
      } while (cal.getMonth() !== (endMonth + 1));
    } else {
      // Default financial year: April to March
      const currentMonth = new Date().getMonth();
      const startYear = currentMonth >= 3 ? currentYear : currentYear - 1; // April = month 3
      
      for (let i = 0; i < 12; i++) {
        const month = new Date(startYear, 3 + i, 1); // Start from April
        const monthYear = month.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }).toUpperCase();
        months.push(monthYear);
      }
    }
    
    return months;
  }

  shouldIncludeInTotal(question, value) {
    return (
      question.type !== 'Text' &&
      question.type !== 'Date' &&
      value !== 'Yes' &&
      value !== 'No' &&
      !value?.includes('/') &&
      value &&
      value.length > 0 &&
      !value.includes('NaN')
    );
  }

  shouldShowPrevious(question, topic) {
    if (!topic.isShowPrevious) return false;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    
    if (topic.isStartJan && currentMonth - 1 !== topic.startMonth) {
      return true;
    } else if (!topic.isStartJan) {
      return true;
    }
    
    return false;
  }

  shouldShowCummulative(question) {
    return question.type !== 'Text' && question.type !== 'Date';
  }

  parseNumericValue(value) {
    if (!value || value === 'Yes' || value === 'No' || value.includes('/')) {
      return 0;
    }
    
    const numValue = parseFloat(value);
    return isNaN(numValue) ? 0 : numValue;
  }

  hasFormula(question) {
    return question.formula || 
           question.defaultFormula || 
           (question.defaultVal !== 'NONE' && question.defaultTo);
  }

  hasFormulaForCombination(question, subTopic) {
    return (
      question.formula?.includes(`=${question.id}_${subTopic.id}`) ||
      (question.defaultVal !== 'NONE' && 
       question.defaultTo === `${question.id}_${subTopic.id}`) ||
      question.defaultFormula?.includes(`=${question.id}_${subTopic.id}`)
    );
  }

  isEndOfMonthQuestion(questionText) {
    return (
      questionText.includes('end of the month') ||
      questionText.includes('end month') ||
      questionText.includes('end of month') ||
      questionText.includes('ending of the month')
    );
  }

  isBeginningOfMonthQuestion(questionText) {
    return (
      questionText.includes('beginning of the month') ||
      questionText.includes('beginning month') ||
      questionText.includes('beginning of month') ||
      questionText.includes('beginning month')
    );
  }


  /**
   * Get previous month data for questions
   */
  async getPreviousMonthData(prevMonthYear, questionIds, userId) {
    const data = await PerformanceStatistic.findAll({
      attributes: ['questionId', 'value', 'status'],
      where: {
        monthYear: { [Op.like]: `%${prevMonthYear}%` },
        questionId: { [Op.in]: questionIds },
        userId,
        active: true
      },
      raw: true
    });

    return data.reduce((acc, item) => {
      acc[item.questionId] = {
        value: item.value,
        status: item.status
      };
      return acc;
    }, {});
  }

  /**
   * Get current month data for questions
   */
  async getCurrentMonthData(currentMonthYear, questionIds, userId) {
    const data = await PerformanceStatistic.findAll({
      attributes: ['questionId', 'value', 'status'],
      where: {
        monthYear: { [Op.like]: `%${currentMonthYear}%` },
        questionId: { [Op.in]: questionIds },
        userId,
        active: true
      },
      raw: true
    });

    return data.reduce((acc, item) => {
      acc[item.questionId] = {
        value: item.value,
        status: item.status
      };
      return acc;
    }, {});
  }

  /**
   * Get financial year data for questions
   */
  async getFinancialYearData(currentYear, questionIds, userId) {
    // Create financial year months array (April to March)
    const months = [];
    const startYear = currentYear - 1;
    
    // Add Apr-Dec of previous year
    for (let month = 3; month < 12; month++) {
      const date = new Date(startYear, month);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase());
    }
    
    // Add Jan-Mar of current year
    for (let month = 0; month < 3; month++) {
      const date = new Date(currentYear, month);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase());
    }

    const data = await PerformanceStatistic.findAll({
      attributes: [
        'questionId',
        [Sequelize.fn('SUM', Sequelize.col('value')), 'totalValue']
      ],
      where: {
        monthYear: { [Op.in]: months },
        questionId: { [Op.in]: questionIds },
        userId,
        active: true,
        status: 'SUCCESS'
      },
      group: ['questionId'],
      raw: true
    });

    return data.reduce((acc, item) => {
      acc[item.questionId] = item.totalValue;
      return acc;
    }, {});
  }

  /**
   * Process questions with data population
   */
  async processQuestions(questions, prevData, currentData, finYearData, topic, userId, currentMonthYear) {
    const processedQuestions = [];
    let id = 1;
    let tId = 1;
    let oldSubTopicId = 0;

    for (const question of questions) {
      // Handle subtopic grouping
      if (question.subTopicId && question.subTopicId !== oldSubTopicId) {
        oldSubTopicId = question.subTopicId;
        tId = 1;
        id++;
      }

      const prevValue = prevData[question.id]?.value || null;
      const currentValue = currentData[question.id]?.value || null;
      const currentStatus = currentData[question.id]?.status || null;
      const finYearValue = finYearData[question.id] || null;

      // Calculate current count based on default value logic
      let calculatedCurrentCount = '0';
      
      if (question.defaultVal === 'PREVIOUS' && prevValue) {
        calculatedCurrentCount = prevValue;
      } else if (question.defaultVal === 'QUESTION' && question.defaultQue) {
        const refValue = prevData[question.defaultQue]?.value || '0';
        calculatedCurrentCount = refValue;
      } else if (currentValue) {
        calculatedCurrentCount = currentValue;
      } else if (question.defaultVal === 'PS') {
        // Get police station count for user
        calculatedCurrentCount = await this.getPSCountForUser(userId);
      } else if (question.defaultVal === 'SUB') {
        // Get subdivision count for user
        calculatedCurrentCount = await this.getSubCountForUser(userId);
      } else if (question.defaultVal === 'CIRCLE') {
        // Get circle count for user
        calculatedCurrentCount = await this.getCircleCountForUser(userId);
      }

      // Get subtopic name if exists
      let subtopicName = null;
      if (question.subTopicId) {
        const subTopic = await SubTopic.findByPk(question.subTopicId);
        subtopicName = subTopic?.subTopicName || null;
      }

      // Determine if field should be disabled
      const isDisabled = currentStatus === 'SUCCESS' || question.defaultVal !== 'NONE';

      processedQuestions.push({
        id: question.id,
        tId: tId++,
        question: question.question,
        type: question.type,
        topicId: question.topicId,
        subTopicId: question.subTopicId,
        subtopicName,
        moduleId: topic.moduleId,
        formula: question.formula,
        defaultVal: question.defaultVal,
        previousCount: prevValue,
        currentCount: calculatedCurrentCount,
        finYearCount: finYearValue,
        isDisabled,
        isPrevious: !!prevValue,
        isCumulative: !!finYearValue,
        checkID: this.generateCheckID(question.question, id)
      });
    }

    return processedQuestions;
  }

  /**
   * Generate check ID based on question content for formula calculations
   */
  generateCheckID(questionText, id) {
    const text = questionText.toLowerCase();
    
    if (text.includes('beginning of the month') || text.includes('beginning month')) {
      return `${id}1`;
    } else if (text.includes('reported during the month')) {
      return `${id}2`;
    } else if (text.includes('disposed during the month') || text.includes('disposed')) {
      return `${id}3`;
    } else if (text.includes('end of the month') || text.includes('end month')) {
      return `${id}4`;
    }
    
    return null;
  }

  /**
   * Get PS count for user (placeholder - implement based on your user model)
   */
  async getPSCountForUser(userId) {
    // Implement based on your user model structure
    return '0';
  }

  /**
   * Get subdivision count for user (placeholder - implement based on your user model)
   */
  async getSubCountForUser(userId) {
    // Implement based on your user model structure
    return '0';
  }

  /**
   * Get circle count for user (placeholder - implement based on your user model)
   */
  async getCircleCountForUser(userId) {
    // Implement based on your user model structure
    return '0';
  }

  /**
   * Save performance statistics
   * @param {Object} data - Statistics data
   * @returns {Object} Save result
   */
  async saveStatistics({ performanceStatistics, userId }) {
    try {
      const now = new Date();
      // Set to current month - 1
      now.setMonth(now.getMonth() - 1);
      const currentMonthYear = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

      // Get user details for battalion info
      const user = await User.findByPk(userId, {
        include: [{ model: Battalion, as: 'battalion' }]
      });
      console.log(`User details:`, user );
      console.log(`Saving statistics for user ${userId} in battalion ${user.battalion || 'Unknown Battalion'}`);
      const statisticsToSave = performanceStatistics.map(stat => ({
        userId,
        questionId: stat.questionId,
        moduleId: stat.moduleId,
        topicId: stat.topicId,
        subTopicId: stat.subTopicId || null,
        value: stat.value,
        status: stat.status || 'INPROGRESS',
        monthYear: currentMonthYear,
        battalionId: user.battalionId || null,
        rangeId: user.rangeId || null,
        stateId: user.stateId || null,
        createdBy: userId,
        updatedBy: userId,
        active: true
      }));

      // Use upsert logic to handle existing records
      const results = [];
      for (const stat of statisticsToSave) {
        const existing = await PerformanceStatistic.findOne({
          where: {
            userId: stat.userId,
            questionId: stat.questionId,
            monthYear: stat.monthYear,
            subTopicId: stat.subTopicId
          }
        });

        if (existing) {
          await existing.update({
            ...stat,
            updatedBy: userId
          });
          results.push(existing);
        } else {
          const newStat = await PerformanceStatistic.create(stat);
          results.push(newStat);
        }
      }

      logger.info(`Saved ${results.length} performance statistics for user ${userId}`);
      return {
        success: true,
        count: results.length,
        data: results
      };

    } catch (error) {
      logger.error('Error saving performance statistics:', error);
      throw error;
    }
  }

  /**
   * Send OTP for verification (placeholder - implement based on your OTP service)
   * @param {number} userId - User ID
   * @returns {Object} OTP result
   */
  async sendOTP(userId) {
    try {
      // Get user details
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiration (implement based on your needs)
      // This could be in Redis, database, or memory store
      // For now, we'll just log it (in production, send via SMS/Email)
      
      logger.info(`OTP ${otp} generated for user ${userId}`);
      
      // In production, send OTP via SMS/Email service
      // await this.sendOTPToUser(user.mobile, otp);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        // In development, return OTP for testing
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      };

    } catch (error) {
      logger.error('Error sending OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP and finalize submission
   * @param {Object} data - OTP verification data
   * @returns {Object} Verification result
   */
  async verifyOTP({ userId, otp }) {
    try {
      // Verify OTP (implement based on your OTP storage)
      // For now, we'll accept any 6-digit number in development
      if (process.env.NODE_ENV === 'development' && otp.length === 6) {
        // Update all INPROGRESS records to SUCCESS
        await PerformanceStatistic.update(
          { status: 'SUCCESS' },
          {
            where: {
              userId,
              status: 'INPROGRESS',
              active: true
            }
          }
        );

        logger.info(`OTP verified and statistics finalized for user ${userId}`);
        
        return {
          success: true,
          message: 'OTP verified and data submitted successfully'
        };
      } else {
        throw new Error('Invalid OTP');
      }

    } catch (error) {
      logger.error('Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Get performance statistics summary
   * @param {Object} filters - Filter options
   * @returns {Object} Performance statistics summary
   */
  async getSummary(filters = {}) {
    const { userId, stateId, rangeId, districtId, monthYear } = filters;
    
    const whereCondition = { active: true };
    if (userId) whereCondition.userId = userId;
    if (stateId) whereCondition.stateId = stateId;
    if (rangeId) whereCondition.rangeId = rangeId;
    if (districtId) whereCondition.districtId = districtId;
    if (monthYear) whereCondition.monthYear = { [Op.like]: `%${monthYear}%` };

    const totalCount = await PerformanceStatistic.count({ where: whereCondition });
    const successCount = await PerformanceStatistic.count({ 
      where: { ...whereCondition, status: 'SUCCESS' } 
    });
    const inProgressCount = await PerformanceStatistic.count({ 
      where: { ...whereCondition, status: 'INPROGRESS' } 
    });
    const totalValue = await PerformanceStatistic.sum('value', { where: whereCondition });

    return {
      totalCount,
      successCount,
      inProgressCount,
      totalValue: totalValue || 0,
      successRate: totalCount > 0 ? (successCount / totalCount * 100).toFixed(2) : 0
    };
  }
}

module.exports = new PerformanceStatisticService();