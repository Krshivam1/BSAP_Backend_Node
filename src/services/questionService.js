const { Question, Topic, SubTopic, Module, User, PerformanceStatistic } = require('../models');
const { Op } = require('sequelize');

class QuestionService {
  
  // Get all questions with pagination and filtering
  static async getAllQuestions(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      search,
      topicId,
      subTopicId,
      moduleId,
      questionType,
      isActive
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { question: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (topicId) {
      whereClause.topicId = topicId;
    }

    if (subTopicId) {
      whereClause.subTopicId = subTopicId;
    }

    if (questionType) {
      whereClause.questionType = questionType;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const includeClause = [
      {
        model: Topic,
        as: 'topic',
        attributes: ['id', 'name', 'moduleId'],
        include: [{
          model: Module,
          as: 'module',
          attributes: ['id', 'name'],
          ...(moduleId && { where: { id: moduleId } })
        }]
      },
      {
        model: SubTopic,
        as: 'subTopic',
        attributes: ['id', 'name'],
        required: false
      }
    ];

    const { count, rows } = await Question.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      questions: rows,
      total: count
    };
  }

  // Get question by ID
  static async getQuestionById(id) {
    return await Question.findByPk(id, {
      include: [
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'description'],
          include: [{
            model: Module,
            as: 'module',
            attributes: ['id', 'name', 'description']
          }]
        },
        {
          model: SubTopic,
          as: 'subTopic',
          attributes: ['id', 'name', 'description'],
          required: false
        }
      ]
    });
  }

  // Create new question
  static async createQuestion(questionData) {
    return await Question.create(questionData);
  }

  // Update question
  static async updateQuestion(id, questionData) {
    const question = await Question.findByPk(id);
    if (!question) return null;

    await question.update(questionData);
    return await this.getQuestionById(id);
  }

  // Delete question
  static async deleteQuestion(id) {
    const question = await Question.findByPk(id);
    if (!question) return false;

    // Check if question is used in performance statistics
    const statsCount = await PerformanceStatistic.count({ where: { questionId: id } });
    if (statsCount > 0) {
      throw new Error('Cannot delete question that has performance statistics data');
    }

    await question.destroy();
    return true;
  }

  // Get questions by topic
  static async getQuestionsByTopic(topicId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      isActive,
      questionType,
      excludeSubTopicQuestions = false
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = { topicId };

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    if (questionType) {
      whereClause.questionType = questionType;
    }

    if (excludeSubTopicQuestions) {
      whereClause.subTopicId = null;
    }

    const { count, rows } = await Question.findAndCountAll({
      where: whereClause,
      include: [{
        model: SubTopic,
        as: 'subTopic',
        attributes: ['id', 'name'],
        required: false
      }],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      questions: rows,
      total: count
    };
  }

  // Get questions by subtopic
  static async getQuestionsBySubTopic(subTopicId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      isActive,
      questionType
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = { subTopicId };

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    if (questionType) {
      whereClause.questionType = questionType;
    }

    const { count, rows } = await Question.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      questions: rows,
      total: count
    };
  }

  // Search questions
  static async searchQuestions(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      topicId,
      subTopicId,
      moduleId,
      questionType,
      isActive
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { question: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    };

    if (topicId) {
      whereClause.topicId = topicId;
    }

    if (subTopicId) {
      whereClause.subTopicId = subTopicId;
    }

    if (questionType) {
      whereClause.questionType = questionType;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const includeClause = [
      {
        model: Topic,
        as: 'topic',
        attributes: ['id', 'name'],
        include: [{
          model: Module,
          as: 'module',
          attributes: ['id', 'name'],
          ...(moduleId && { where: { id: moduleId } })
        }]
      },
      {
        model: SubTopic,
        as: 'subTopic',
        attributes: ['id', 'name'],
        required: false
      }
    ];

    const { count, rows } = await Question.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['question', 'ASC']]
    });

    return {
      questions: rows,
      total: count
    };
  }

  // Get active questions
  static async getActiveQuestions(topicId = null, subTopicId = null, moduleId = null) {
    const whereClause = { isActive: true };
    const includeClause = [];

    if (topicId) {
      whereClause.topicId = topicId;
    }

    if (subTopicId) {
      whereClause.subTopicId = subTopicId;
    }

    if (moduleId && !topicId) {
      includeClause.push({
        model: Topic,
        as: 'topic',
        where: { moduleId },
        attributes: ['id', 'name']
      });
    } else if (!topicId) {
      includeClause.push({
        model: Topic,
        as: 'topic',
        attributes: ['id', 'name']
      });
    }

    return await Question.findAll({
      where: whereClause,
      ...(includeClause.length && { include: includeClause }),
      order: [['displayOrder', 'ASC']],
      attributes: ['id', 'question', 'questionType', 'topicId', 'subTopicId', 'displayOrder', 'maxScore']
    });
  }

  // Activate question
  static async activateQuestion(id, updatedBy) {
    const question = await Question.findByPk(id);
    if (!question) return null;

    await question.update({
      isActive: true,
      updatedBy
    });

    return question;
  }

  // Deactivate question
  static async deactivateQuestion(id, updatedBy) {
    const question = await Question.findByPk(id);
    if (!question) return null;

    await question.update({
      isActive: false,
      updatedBy
    });

    return question;
  }

  // Get question statistics
  static async getQuestionStatistics(topicId = null, subTopicId = null, moduleId = null) {
    const whereClause = {};
    const includeClause = [];

    if (topicId) {
      whereClause.topicId = topicId;
    }

    if (subTopicId) {
      whereClause.subTopicId = subTopicId;
    }

    if (moduleId && !topicId) {
      includeClause.push({
        model: Topic,
        as: 'topic',
        where: { moduleId },
        attributes: []
      });
    }

    const [
      totalQuestions,
      activeQuestions,
      questionsWithStats
    ] = await Promise.all([
      Question.count({ 
        where: whereClause,
        ...(includeClause.length && { include: includeClause })
      }),
      Question.count({ 
        where: { ...whereClause, isActive: true },
        ...(includeClause.length && { include: includeClause })
      }),
      Question.count({
        where: whereClause,
        include: [
          ...includeClause,
          {
            model: PerformanceStatistic,
            as: 'performanceStatistics',
            required: true
          }
        ]
      })
    ]);

    // Get question type distribution
    const questionTypeStats = await Question.findAll({
      where: whereClause,
      attributes: [
        'questionType',
        [Question.sequelize.fn('COUNT', Question.sequelize.col('Question.id')), 'count']
      ],
      ...(includeClause.length && { include: includeClause }),
      group: ['questionType'],
      order: [[Question.sequelize.literal('count'), 'DESC']]
    });

    // Get usage statistics
    const usageStats = await Question.findAll({
      where: whereClause,
      attributes: [
        'id',
        'question',
        [Question.sequelize.fn('COUNT', Question.sequelize.col('performanceStatistics.id')), 'usageCount']
      ],
      include: [
        ...(includeClause.length ? includeClause : []),
        {
          model: PerformanceStatistic,
          as: 'performanceStatistics',
          attributes: [],
          required: false
        }
      ],
      group: ['Question.id'],
      order: [[Question.sequelize.literal('usageCount'), 'DESC']],
      limit: 10
    });

    return {
      totalQuestions,
      activeQuestions,
      inactiveQuestions: totalQuestions - activeQuestions,
      questionsWithStats,
      questionsWithoutStats: totalQuestions - questionsWithStats,
      questionTypeStats: questionTypeStats.map(stat => ({
        type: stat.questionType,
        count: parseInt(stat.dataValues.count) || 0
      })),
      topUsedQuestions: usageStats.map(question => ({
        id: question.id,
        question: question.question,
        usageCount: parseInt(question.dataValues.usageCount) || 0
      }))
    };
  }

  // Check if question exists in topic/subtopic
  static async isQuestionExists(question, topicId, subTopicId = null, excludeId = null) {
    const whereClause = { question, topicId };
    
    if (subTopicId) {
      whereClause.subTopicId = subTopicId;
    } else {
      whereClause.subTopicId = null;
    }

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await Question.count({ where: whereClause });
    return count > 0;
  }

  // Reorder questions within topic/subtopic
  static async reorderQuestions(questionOrders, updatedBy) {
    const promises = questionOrders.map(({ id, displayOrder }) => 
      Question.update(
        { displayOrder, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    return await Question.findAll({
      where: { id: { [Op.in]: questionOrders.map(q => q.id) } },
      order: [['displayOrder', 'ASC']],
      attributes: ['id', 'question', 'displayOrder', 'topicId', 'subTopicId']
    });
  }

  // Get questions for dropdown
  static async getQuestionsForDropdown(topicId = null, subTopicId = null, moduleId = null) {
    const whereClause = { isActive: true };
    const includeClause = [];

    if (topicId) {
      whereClause.topicId = topicId;
    }

    if (subTopicId) {
      whereClause.subTopicId = subTopicId;
    }

    if (moduleId && !topicId) {
      includeClause.push({
        model: Topic,
        as: 'topic',
        where: { moduleId },
        attributes: []
      });
    }

    return await Question.findAll({
      where: whereClause,
      ...(includeClause.length && { include: includeClause }),
      attributes: ['id', 'question', 'questionType', 'maxScore', 'displayOrder', 'topicId', 'subTopicId'],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get question hierarchy (with module, topic, subtopic)
  static async getQuestionHierarchy(questionId) {
    return await Question.findByPk(questionId, {
      include: [
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'description'],
          include: [{
            model: Module,
            as: 'module',
            attributes: ['id', 'name', 'description']
          }]
        },
        {
          model: SubTopic,
          as: 'subTopic',
          attributes: ['id', 'name', 'description'],
          required: false
        }
      ]
    });
  }

  // Bulk update questions
  static async bulkUpdateQuestions(updates, updatedBy) {
    const promises = updates.map(({ id, ...data }) => 
      Question.update(
        { ...data, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    const updatedIds = updates.map(u => u.id);
    return await Question.findAll({
      where: { id: { [Op.in]: updatedIds } },
      include: [
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name']
        },
        {
          model: SubTopic,
          as: 'subTopic',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get next display order within topic/subtopic
  static async getNextDisplayOrder(topicId, subTopicId = null) {
    const whereClause = { topicId };
    if (subTopicId) {
      whereClause.subTopicId = subTopicId;
    } else {
      whereClause.subTopicId = null;
    }

    const maxOrder = await Question.max('displayOrder', { where: whereClause });
    return (maxOrder || 0) + 1;
  }

  // Move question to another topic/subtopic
  static async moveQuestion(questionId, newTopicId, newSubTopicId = null, updatedBy) {
    const question = await Question.findByPk(questionId);
    if (!question) return null;

    const newDisplayOrder = await this.getNextDisplayOrder(newTopicId, newSubTopicId);
    
    await question.update({
      topicId: newTopicId,
      subTopicId: newSubTopicId,
      displayOrder: newDisplayOrder,
      updatedBy
    });

    return await this.getQuestionById(questionId);
  }

  // Copy question to another topic/subtopic
  static async copyQuestion(questionId, targetTopicId, targetSubTopicId = null, updatedBy) {
    const question = await this.getQuestionById(questionId);
    if (!question) return null;

    const newDisplayOrder = await this.getNextDisplayOrder(targetTopicId, targetSubTopicId);
    
    const newQuestion = await Question.create({
      question: `${question.question} (Copy)`,
      description: question.description,
      questionType: question.questionType,
      maxScore: question.maxScore,
      topicId: targetTopicId,
      subTopicId: targetSubTopicId,
      displayOrder: newDisplayOrder,
      isActive: question.isActive,
      createdBy: updatedBy,
      updatedBy: updatedBy
    });

    return await this.getQuestionById(newQuestion.id);
  }

  // Get question breadcrumb path
  static async getQuestionBreadcrumb(questionId) {
    const question = await Question.findByPk(questionId, {
      include: [
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name'],
          include: [{
            model: Module,
            as: 'module',
            attributes: ['id', 'name']
          }]
        },
        {
          model: SubTopic,
          as: 'subTopic',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    if (!question) return null;

    const breadcrumb = {
      module: {
        id: question.topic.module.id,
        name: question.topic.module.name
      },
      topic: {
        id: question.topic.id,
        name: question.topic.name
      },
      question: {
        id: question.id,
        question: question.question
      }
    };

    if (question.subTopic) {
      breadcrumb.subTopic = {
        id: question.subTopic.id,
        name: question.subTopic.name
      };
    }

    return breadcrumb;
  }

  // Get questions by module
  static async getQuestionsByModule(moduleId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await Question.findAndCountAll({
      include: [{
        model: Topic,
        as: 'topic',
        where: { moduleId },
        attributes: ['id', 'name']
      }],
      limit,
      offset,
      order: [['topic', 'displayOrder', 'ASC'], [sortBy, sortOrder]]
    });

    return {
      questions: rows,
      total: count
    };
  }

  // Get performance statistics for question
  static async getQuestionPerformanceStats(questionId, options = {}) {
    const {
      startDate,
      endDate,
      stateId,
      districtId,
      rangeId
    } = options;

    const whereClause = { questionId };
    
    if (startDate && endDate) {
      whereClause.reportingPeriod = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (stateId) {
      whereClause.stateId = stateId;
    }

    if (districtId) {
      whereClause.districtId = districtId;
    }

    if (rangeId) {
      whereClause.rangeId = rangeId;
    }

    const stats = await PerformanceStatistic.findAll({
      where: whereClause,
      attributes: [
        [PerformanceStatistic.sequelize.fn('AVG', PerformanceStatistic.sequelize.col('score')), 'avgScore'],
        [PerformanceStatistic.sequelize.fn('MIN', PerformanceStatistic.sequelize.col('score')), 'minScore'],
        [PerformanceStatistic.sequelize.fn('MAX', PerformanceStatistic.sequelize.col('score')), 'maxScore'],
        [PerformanceStatistic.sequelize.fn('COUNT', PerformanceStatistic.sequelize.col('id')), 'responseCount']
      ]
    });

    return stats[0] || {
      avgScore: 0,
      minScore: 0,
      maxScore: 0,
      responseCount: 0
    };
  }

}

module.exports = QuestionService;