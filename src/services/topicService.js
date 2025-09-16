const { Topic, Module, SubTopic, Question, User } = require('../models');
const { Op } = require('sequelize');

class TopicService {
  
  // Get all topics with pagination and filtering
  static async getAllTopics(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      search,
      moduleId,
      isActive
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const { count, rows } = await Topic.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Module,
          as: 'module',
          attributes: ['id', 'name']
        },
        {
          model: SubTopic,
          as: 'subTopics',
          attributes: ['id', 'name', 'isActive'],
          required: false
        },
        {
          model: Question,
          as: 'questions',
          attributes: ['id', 'question', 'isActive'],
          required: false
        }
      ],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      topics: rows.map(topic => ({
        ...topic.toJSON(),
        subTopicCount: topic.subTopics ? topic.subTopics.length : 0,
        questionCount: topic.questions ? topic.questions.length : 0
      })),
      total: count
    };
  }

  // Get topic by ID
  static async getTopicById(id) {
    return await Topic.findByPk(id, {
      include: [
        {
          model: Module,
          as: 'module',
          attributes: ['id', 'name', 'description']
        },
        {
          model: SubTopic,
          as: 'subTopics',
          attributes: ['id', 'name', 'description', 'isActive', 'displayOrder'],
          order: [['displayOrder', 'ASC']]
        },
        {
          model: Question,
          as: 'questions',
          attributes: ['id', 'question', 'questionType', 'isActive', 'displayOrder'],
          order: [['displayOrder', 'ASC']]
        }
      ]
    });
  }

  // Create new topic
  static async createTopic(topicData) {
    return await Topic.create(topicData);
  }

  // Update topic
  static async updateTopic(id, topicData) {
    const topic = await Topic.findByPk(id);
    if (!topic) return null;

    await topic.update(topicData);
    return await this.getTopicById(id);
  }

  // Delete topic
  static async deleteTopic(id) {
    const topic = await Topic.findByPk(id);
    if (!topic) return false;

    // Check if topic has subtopics
    const subTopicCount = await SubTopic.count({ where: { topicId: id } });
    if (subTopicCount > 0) {
      throw new Error('Cannot delete topic with existing subtopics');
    }

    // Check if topic has questions
    const questionCount = await Question.count({ where: { topicId: id } });
    if (questionCount > 0) {
      throw new Error('Cannot delete topic with existing questions');
    }

    await topic.destroy();
    return true;
  }

  // Get topics by module
  static async getTopicsByModule(moduleId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await Topic.findAndCountAll({
      where: { moduleId },
      include: [{
        model: SubTopic,
        as: 'subTopics',
        attributes: ['id'],
        required: false
      }],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      topics: rows.map(topic => ({
        ...topic.toJSON(),
        subTopicCount: topic.subTopics ? topic.subTopics.length : 0
      })),
      total: count
    };
  }

  // Search topics
  static async searchTopics(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      moduleId,
      isActive
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    };

    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const { count, rows } = await Topic.findAndCountAll({
      where: whereClause,
      include: [{
        model: Module,
        as: 'module',
        attributes: ['id', 'name']
      }],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      topics: rows,
      total: count
    };
  }

  // Get subtopics by topic
  static async getSubTopicsByTopic(topicId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await SubTopic.findAndCountAll({
      where: { topicId },
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      subTopics: rows,
      total: count
    };
  }

  // Get questions by topic
  static async getQuestionsByTopic(topicId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await Question.findAndCountAll({
      where: { topicId },
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      questions: rows,
      total: count
    };
  }

  // Get active topics
  static async getActiveTopics(moduleId = null) {
    const whereClause = { isActive: true };
    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    return await Topic.findAll({
      where: whereClause,
      include: [{
        model: Module,
        as: 'module',
        attributes: ['id', 'name']
      }],
      order: [['displayOrder', 'ASC']],
      attributes: ['id', 'name', 'description', 'moduleId', 'displayOrder']
    });
  }

  // Activate topic
  static async activateTopic(id, updatedBy) {
    const topic = await Topic.findByPk(id);
    if (!topic) return null;

    await topic.update({
      isActive: true,
      updatedBy
    });

    return topic;
  }

  // Deactivate topic
  static async deactivateTopic(id, updatedBy) {
    const topic = await Topic.findByPk(id);
    if (!topic) return null;

    await topic.update({
      isActive: false,
      updatedBy
    });

    return topic;
  }

  // Get topic statistics
  static async getTopicStatistics(moduleId = null) {
    const whereClause = {};
    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    const [
      totalTopics,
      activeTopics,
      topicsWithSubTopics,
      topicsWithQuestions
    ] = await Promise.all([
      Topic.count({ where: whereClause }),
      Topic.count({ where: { ...whereClause, isActive: true } }),
      Topic.count({
        where: whereClause,
        include: [{
          model: SubTopic,
          as: 'subTopics',
          required: true
        }]
      }),
      Topic.count({
        where: whereClause,
        include: [{
          model: Question,
          as: 'questions',
          required: true
        }]
      })
    ]);

    const subTopicCounts = await Topic.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        [Topic.sequelize.fn('COUNT', Topic.sequelize.col('subTopics.id')), 'subTopicCount']
      ],
      include: [{
        model: SubTopic,
        as: 'subTopics',
        attributes: [],
        required: false
      }],
      group: ['Topic.id'],
      order: [[Topic.sequelize.literal('subTopicCount'), 'DESC']]
    });

    const questionCounts = await Topic.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        [Topic.sequelize.fn('COUNT', Topic.sequelize.col('questions.id')), 'questionCount']
      ],
      include: [{
        model: Question,
        as: 'questions',
        attributes: [],
        required: false
      }],
      group: ['Topic.id'],
      order: [[Topic.sequelize.literal('questionCount'), 'DESC']]
    });

    return {
      totalTopics,
      activeTopics,
      inactiveTopics: totalTopics - activeTopics,
      topicsWithSubTopics,
      topicsWithoutSubTopics: totalTopics - topicsWithSubTopics,
      topicsWithQuestions,
      topicsWithoutQuestions: totalTopics - topicsWithQuestions,
      subTopicCounts: subTopicCounts.map(topic => ({
        id: topic.id,
        name: topic.name,
        subTopicCount: parseInt(topic.dataValues.subTopicCount) || 0
      })),
      questionCounts: questionCounts.map(topic => ({
        id: topic.id,
        name: topic.name,
        questionCount: parseInt(topic.dataValues.questionCount) || 0
      }))
    };
  }

  // Check if topic name exists in module
  static async isNameExists(name, moduleId, excludeId = null) {
    const whereClause = { name, moduleId };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await Topic.count({ where: whereClause });
    return count > 0;
  }

  // Reorder topics within module
  static async reorderTopics(topicOrders, updatedBy) {
    const promises = topicOrders.map(({ id, displayOrder }) => 
      Topic.update(
        { displayOrder, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    return await Topic.findAll({
      where: { id: { [Op.in]: topicOrders.map(t => t.id) } },
      order: [['displayOrder', 'ASC']],
      attributes: ['id', 'name', 'displayOrder', 'moduleId']
    });
  }

  // Get topics for dropdown
  static async getTopicsForDropdown(moduleId = null) {
    const whereClause = { isActive: true };
    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    return await Topic.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'displayOrder', 'moduleId'],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get topic hierarchy (with module, subtopics, and questions)
  static async getTopicHierarchy(topicId) {
    return await Topic.findByPk(topicId, {
      include: [
        {
          model: Module,
          as: 'module',
          attributes: ['id', 'name', 'description']
        },
        {
          model: SubTopic,
          as: 'subTopics',
          where: { isActive: true },
          required: false,
          order: [['displayOrder', 'ASC']],
          include: [{
            model: Question,
            as: 'questions',
            where: { isActive: true },
            required: false,
            attributes: ['id', 'question', 'questionType'],
            order: [['displayOrder', 'ASC']]
          }]
        },
        {
          model: Question,
          as: 'questions',
          where: { isActive: true, subTopicId: null },
          required: false,
          attributes: ['id', 'question', 'questionType', 'displayOrder'],
          order: [['displayOrder', 'ASC']]
        }
      ]
    });
  }

  // Bulk update topics
  static async bulkUpdateTopics(updates, updatedBy) {
    const promises = updates.map(({ id, ...data }) => 
      Topic.update(
        { ...data, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    const updatedIds = updates.map(u => u.id);
    return await Topic.findAll({
      where: { id: { [Op.in]: updatedIds } },
      include: [{
        model: Module,
        as: 'module',
        attributes: ['id', 'name']
      }],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get topics with usage statistics
  static async getTopicsWithUsage(moduleId = null) {
    const whereClause = {};
    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    return await Topic.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'isActive',
        'displayOrder',
        [Topic.sequelize.fn('COUNT', Topic.sequelize.col('subTopics.id')), 'subTopicCount'],
        [Topic.sequelize.fn('COUNT', Topic.sequelize.col('questions.id')), 'questionCount']
      ],
      include: [
        {
          model: Module,
          as: 'module',
          attributes: ['name']
        },
        {
          model: SubTopic,
          as: 'subTopics',
          attributes: [],
          required: false
        },
        {
          model: Question,
          as: 'questions',
          attributes: [],
          required: false
        }
      ],
      group: ['Topic.id', 'module.id'],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get next display order within module
  static async getNextDisplayOrder(moduleId) {
    const maxOrder = await Topic.max('displayOrder', { where: { moduleId } });
    return (maxOrder || 0) + 1;
  }

  // Copy topic to another module
  static async copyTopic(topicId, targetModuleId, updatedBy) {
    const topic = await this.getTopicById(topicId);
    if (!topic) return null;

    const newDisplayOrder = await this.getNextDisplayOrder(targetModuleId);
    
    const newTopic = await Topic.create({
      name: `${topic.name} (Copy)`,
      description: topic.description,
      moduleId: targetModuleId,
      displayOrder: newDisplayOrder,
      isActive: topic.isActive,
      createdBy: updatedBy,
      updatedBy: updatedBy
    });

    // Copy subtopics if any
    if (topic.subTopics && topic.subTopics.length > 0) {
      const SubTopicService = require('./subTopicService');
      for (const subTopic of topic.subTopics) {
        await SubTopicService.copySubTopic(subTopic.id, newTopic.id, updatedBy);
      }
    }

    // Copy direct questions if any
    if (topic.questions && topic.questions.length > 0) {
      const QuestionService = require('./questionService');
      for (const question of topic.questions) {
        if (!question.subTopicId) { // Only direct topic questions
          await QuestionService.copyQuestion(question.id, newTopic.id, null, updatedBy);
        }
      }
    }

    return await this.getTopicById(newTopic.id);
  }

}

module.exports = TopicService;