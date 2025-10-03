const { PerformanceStatistic, User, Question, Module, Topic, SubTopic, State, Range, District } = require('../models');
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
          include: [{ model: District, as: 'district' }]
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
        { model: District, as: 'district' }
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
      
      // Get current date for month calculations
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Calculate previous month for data comparison
      const prevMonth = new Date(now);
      prevMonth.setMonth(currentMonth - 1);
      const prevMonthYear = prevMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
      
      // Calculate current month year
      const currentMonthYear = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

      // Get user details with district info
      const user = await User.findByPk(userId, {
        include: [{ model: District, as: 'district' }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Find module by priority (modulePathId + 1 because menu uses 0-based, priority is 1-based)
      const modules = await Module.findAll({
        where: { 
          active: true,
          priority: modulePathId + 1
        },
        order: [['priority', 'ASC']]
      });

      console.log(`Looking for module with priority: ${modulePathId + 1}`);
      
      if (!modules.length) {
        // Get all modules for debugging
        const allModules = await Module.findAll({
          where: { active: true },
          order: [['priority', 'ASC']]
        });
        console.log(`Available modules:`, allModules.map(m => `${m.id}: ${m.moduleName} (priority: ${m.priority})`));
        throw new Error(`Module not found with priority: ${modulePathId + 1}`);
      }

      const currentModule = modules[0];
      console.log(`Selected module: ${currentModule.id}: ${currentModule.moduleName} (priority: ${currentModule.priority})`);

      // Check navigation availability
      const nextModules = await Module.findAll({
        where: { 
          active: true,
          priority: modulePathId + 2
        }
      });

      const prevModules = await Module.findAll({
        where: { 
          active: true,
          priority: modulePathId
        }
      });

      const moduleData = [];

      for (const module of modules) {
        // Check if module is completed
        const moduleCompletionCount = await PerformanceStatistic.count({
          where: {
            moduleId: module.id,
            userId,
            monthYear: { [Op.like]: `%${currentMonthYear}%` },
            status: 'SUCCESS'
          }
        });

        // Get all topics for this module ordered by priority, then select by index
        const allTopics = await Topic.findAll({
          where: { 
            moduleId: module.id,
            active: true
          },
          order: [['priority', 'ASC']]
        });

        console.log(`Module ${module.moduleName} has ${allTopics.length} topics:`);
        console.log(`Topics:`, allTopics.map((t, index) => `Index ${index + 1}: ${t.id}: ${t.topicName} (priority: ${t.priority})`));

        if (!allTopics.length || topicPathId - 1 >= allTopics.length || topicPathId < 1) {
          console.log(`Topic not found. Module: ${module.id}, TopicPathId: ${topicPathId}, Available topics: ${allTopics.length}`);
          console.log(`Valid topic IDs for this module: 1 to ${allTopics.length}`);
          continue; // Skip this module if topic not found
        }

        // Select topic by index (topicPathId is 1-based, convert to 0-based)
        const currentTopic = allTopics[topicPathId - 1];
        console.log(`Selected topic at index ${topicPathId}: ${currentTopic.id}: ${currentTopic.topicName}`);
        const topics = [currentTopic]; // Keep array format for compatibility

        // Check topic navigation (topicPathId is 1-based)
        const hasNextTopic = topicPathId < allTopics.length;
        const hasPrevTopic = topicPathId > 1;

        const topicData = [];

        for (const topic of topics) {
          // Get questions for this topic
          const questions = await Question.findAll({
            where: { 
              topicId: topic.id,
              active: true
            },
            order: [['priority', 'ASC']]
          });

          // Get question IDs for batch queries
          const questionIds = questions.map(q => q.id);

          // Batch query for performance data
          const [prevData, currentData, finYearData] = await Promise.all([
            this.getPreviousMonthData(prevMonthYear, questionIds, userId),
            this.getCurrentMonthData(currentMonthYear, questionIds, userId),
            this.getFinancialYearData(currentYear, questionIds, userId)
          ]);

          const processedQuestions = await this.processQuestions(
            questions, 
            prevData, 
            currentData, 
            finYearData,
            topic,
            userId,
            currentMonthYear
          );

          // Get subtopics if needed
          const subTopics = await SubTopic.findAll({
            where: { 
              topicId: topic.id,
              active: true
            },
            order: [['priority', 'ASC']]
          });

          topicData.push({
            id: topic.id,
            topicName: topic.topicName,
            topicSubName: topic.topicSubName,
            formType: topic.formType,
            moduleId: module.id,
            isShowPrevious: topic.isShowPrevious || true,
            isShowCummulative: topic.isShowCummulative || true,
            questionDTOs: processedQuestions,
            questions: processedQuestions,
            subTopics: subTopics.map(st => ({
              id: st.id,
              subTopicName: st.subTopicName,
              isDisabled: false
            })),
            nextTopic: hasNextTopic,
            prevTopic: hasPrevTopic
          });
        }

        moduleData.push({
          id: module.id,
          moduleName: module.moduleName,
          priority: module.priority,
          isDisabled: moduleCompletionCount > 0,
          topicDTOs: topicData
        });
      }

      // Calculate global navigation flags
      let globalHasNextTopic = false;
      let globalHasPrevTopic = false;
      
      if (moduleData.length > 0 && moduleData[0].topicDTOs.length > 0) {
        const currentTopicData = moduleData[0].topicDTOs[0]; // Current topic data
        globalHasNextTopic = currentTopicData.nextTopic;
        globalHasPrevTopic = currentTopicData.prevTopic;
      }

      return {
        modules: moduleData,
        userDistrict: user.district?.districtName || 'Unknown District',
        monthYear: currentMonthYear,
        isSuccess: false, // Will be calculated based on completion status
        nextModule: nextModules.length > 0,
        prevModule: prevModules.length > 0,
        nextTopic: globalHasNextTopic,
        prevTopic: globalHasPrevTopic
      };

    } catch (error) {
      logger.error('Error getting performance form data:', error);
      throw error;
    }
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
      const currentMonthYear = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

      // Get user details for district info
      const user = await User.findByPk(userId, {
        include: [{ model: District, as: 'district' }]
      });

      const statisticsToSave = performanceStatistics.map(stat => ({
        userId,
        questionId: stat.questionId,
        moduleId: stat.moduleId,
        topicId: stat.topicId,
        subTopicId: stat.subTopicId || null,
        value: stat.value,
        status: stat.status || 'INPROGRESS',
        monthYear: currentMonthYear,
        districtId: user.district?.id || null,
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