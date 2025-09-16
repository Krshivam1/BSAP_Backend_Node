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