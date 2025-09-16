const { SubTopic, Topic, Module, Question, User } = require('../models');
const { Op } = require('sequelize');

class SubTopicService {
  
  // Get all subtopics with pagination and filtering
  static async getAllSubTopics(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      search,
      topicId,
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

    if (topicId) {
      whereClause.topicId = topicId;
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
        model: Question,
        as: 'questions',
        attributes: ['id', 'question', 'isActive'],
        required: false
      }
    ];

    const { count, rows } = await SubTopic.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      subTopics: rows.map(subTopic => ({
        ...subTopic.toJSON(),
        questionCount: subTopic.questions ? subTopic.questions.length : 0
      })),
      total: count
    };
  }

  // Get subtopic by ID
  static async getSubTopicById(id) {
    return await SubTopic.findByPk(id, {
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
          model: Question,
          as: 'questions',
          attributes: ['id', 'question', 'questionType', 'isActive', 'displayOrder'],
          order: [['displayOrder', 'ASC']]
        }
      ]
    });
  }

  // Create new subtopic
  static async createSubTopic(subTopicData) {
    return await SubTopic.create(subTopicData);
  }

  // Update subtopic
  static async updateSubTopic(id, subTopicData) {
    const subTopic = await SubTopic.findByPk(id);
    if (!subTopic) return null;

    await subTopic.update(subTopicData);
    return await this.getSubTopicById(id);
  }

  // Delete subtopic
  static async deleteSubTopic(id) {
    const subTopic = await SubTopic.findByPk(id);
    if (!subTopic) return false;

    // Check if subtopic has questions
    const questionCount = await Question.count({ where: { subTopicId: id } });
    if (questionCount > 0) {
      throw new Error('Cannot delete subtopic with existing questions');
    }

    await subTopic.destroy();
    return true;
  }

  // Get subtopics by topic
  static async getSubTopicsByTopic(topicId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      isActive
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = { topicId };

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const { count, rows } = await SubTopic.findAndCountAll({
      where: whereClause,
      include: [{
        model: Question,
        as: 'questions',
        attributes: ['id'],
        required: false
      }],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      subTopics: rows.map(subTopic => ({
        ...subTopic.toJSON(),
        questionCount: subTopic.questions ? subTopic.questions.length : 0
      })),
      total: count
    };
  }

  // Search subtopics
  static async searchSubTopics(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      topicId,
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

    if (topicId) {
      whereClause.topicId = topicId;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const includeClause = [{
      model: Topic,
      as: 'topic',
      attributes: ['id', 'name'],
      include: [{
        model: Module,
        as: 'module',
        attributes: ['id', 'name'],
        ...(moduleId && { where: { id: moduleId } })
      }]
    }];

    const { count, rows } = await SubTopic.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      subTopics: rows,
      total: count
    };
  }

  // Get questions by subtopic
  static async getQuestionsBySubTopic(subTopicId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await Question.findAndCountAll({
      where: { subTopicId },
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      questions: rows,
      total: count
    };
  }

  // Get active subtopics
  static async getActiveSubTopics(topicId = null, moduleId = null) {
    const whereClause = { isActive: true };
    if (topicId) {
      whereClause.topicId = topicId;
    }

    const includeClause = [{
      model: Topic,
      as: 'topic',
      attributes: ['id', 'name'],
      ...(moduleId && { where: { moduleId } })
    }];

    return await SubTopic.findAll({
      where: whereClause,
      include: includeClause,
      order: [['displayOrder', 'ASC']],
      attributes: ['id', 'name', 'description', 'topicId', 'displayOrder']
    });
  }

  // Activate subtopic
  static async activateSubTopic(id, updatedBy) {
    const subTopic = await SubTopic.findByPk(id);
    if (!subTopic) return null;

    await subTopic.update({
      isActive: true,
      updatedBy
    });

    return subTopic;
  }

  // Deactivate subtopic
  static async deactivateSubTopic(id, updatedBy) {
    const subTopic = await SubTopic.findByPk(id);
    if (!subTopic) return null;

    await subTopic.update({
      isActive: false,
      updatedBy
    });

    return subTopic;
  }

  // Get subtopic statistics
  static async getSubTopicStatistics(topicId = null, moduleId = null) {
    const whereClause = {};
    const includeClause = [];

    if (topicId) {
      whereClause.topicId = topicId;
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
      totalSubTopics,
      activeSubTopics,
      subTopicsWithQuestions
    ] = await Promise.all([
      SubTopic.count({ 
        where: whereClause,
        ...(includeClause.length && { include: includeClause })
      }),
      SubTopic.count({ 
        where: { ...whereClause, isActive: true },
        ...(includeClause.length && { include: includeClause })
      }),
      SubTopic.count({
        where: whereClause,
        include: [
          ...includeClause,
          {
            model: Question,
            as: 'questions',
            required: true
          }
        ]
      })
    ]);

    const questionCounts = await SubTopic.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        [SubTopic.sequelize.fn('COUNT', SubTopic.sequelize.col('questions.id')), 'questionCount']
      ],
      include: [
        ...(includeClause.length ? includeClause : []),
        {
          model: Question,
          as: 'questions',
          attributes: [],
          required: false
        }
      ],
      group: ['SubTopic.id'],
      order: [[SubTopic.sequelize.literal('questionCount'), 'DESC']]
    });

    return {
      totalSubTopics,
      activeSubTopics,
      inactiveSubTopics: totalSubTopics - activeSubTopics,
      subTopicsWithQuestions,
      subTopicsWithoutQuestions: totalSubTopics - subTopicsWithQuestions,
      questionCounts: questionCounts.map(subTopic => ({
        id: subTopic.id,
        name: subTopic.name,
        questionCount: parseInt(subTopic.dataValues.questionCount) || 0
      }))
    };
  }

  // Check if subtopic name exists in topic
  static async isNameExists(name, topicId, excludeId = null) {
    const whereClause = { name, topicId };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await SubTopic.count({ where: whereClause });
    return count > 0;
  }

  // Reorder subtopics within topic
  static async reorderSubTopics(subTopicOrders, updatedBy) {
    const promises = subTopicOrders.map(({ id, displayOrder }) => 
      SubTopic.update(
        { displayOrder, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    return await SubTopic.findAll({
      where: { id: { [Op.in]: subTopicOrders.map(s => s.id) } },
      order: [['displayOrder', 'ASC']],
      attributes: ['id', 'name', 'displayOrder', 'topicId']
    });
  }

  // Get subtopics for dropdown
  static async getSubTopicsForDropdown(topicId = null, moduleId = null) {
    const whereClause = { isActive: true };
    if (topicId) {
      whereClause.topicId = topicId;
    }

    const includeClause = [];
    if (moduleId && !topicId) {
      includeClause.push({
        model: Topic,
        as: 'topic',
        where: { moduleId },
        attributes: []
      });
    }

    return await SubTopic.findAll({
      where: whereClause,
      ...(includeClause.length && { include: includeClause }),
      attributes: ['id', 'name', 'displayOrder', 'topicId'],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get subtopic hierarchy (with topic, module, and questions)
  static async getSubTopicHierarchy(subTopicId) {
    return await SubTopic.findByPk(subTopicId, {
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
          model: Question,
          as: 'questions',
          where: { isActive: true },
          required: false,
          attributes: ['id', 'question', 'questionType', 'displayOrder'],
          order: [['displayOrder', 'ASC']]
        }
      ]
    });
  }

  // Bulk update subtopics
  static async bulkUpdateSubTopics(updates, updatedBy) {
    const promises = updates.map(({ id, ...data }) => 
      SubTopic.update(
        { ...data, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    const updatedIds = updates.map(u => u.id);
    return await SubTopic.findAll({
      where: { id: { [Op.in]: updatedIds } },
      include: [{
        model: Topic,
        as: 'topic',
        attributes: ['id', 'name']
      }],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get subtopics with usage statistics
  static async getSubTopicsWithUsage(topicId = null, moduleId = null) {
    const whereClause = {};
    const includeClause = [];

    if (topicId) {
      whereClause.topicId = topicId;
    }

    if (moduleId && !topicId) {
      includeClause.push({
        model: Topic,
        as: 'topic',
        where: { moduleId },
        attributes: ['name']
      });
    } else {
      includeClause.push({
        model: Topic,
        as: 'topic',
        attributes: ['name']
      });
    }

    return await SubTopic.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'isActive',
        'displayOrder',
        [SubTopic.sequelize.fn('COUNT', SubTopic.sequelize.col('questions.id')), 'questionCount']
      ],
      include: [
        ...includeClause,
        {
          model: Question,
          as: 'questions',
          attributes: [],
          required: false
        }
      ],
      group: ['SubTopic.id', 'topic.id'],
      order: [['displayOrder', 'ASC']]
    });
  }

  // Get next display order within topic
  static async getNextDisplayOrder(topicId) {
    const maxOrder = await SubTopic.max('displayOrder', { where: { topicId } });
    return (maxOrder || 0) + 1;
  }

  // Move subtopic to another topic
  static async moveSubTopic(subTopicId, newTopicId, updatedBy) {
    const subTopic = await SubTopic.findByPk(subTopicId);
    if (!subTopic) return null;

    const newDisplayOrder = await this.getNextDisplayOrder(newTopicId);
    
    await subTopic.update({
      topicId: newTopicId,
      displayOrder: newDisplayOrder,
      updatedBy
    });

    return await this.getSubTopicById(subTopicId);
  }

  // Copy subtopic to another topic
  static async copySubTopic(subTopicId, targetTopicId, updatedBy) {
    const subTopic = await this.getSubTopicById(subTopicId);
    if (!subTopic) return null;

    const newDisplayOrder = await this.getNextDisplayOrder(targetTopicId);
    
    const newSubTopic = await SubTopic.create({
      name: `${subTopic.name} (Copy)`,
      description: subTopic.description,
      topicId: targetTopicId,
      displayOrder: newDisplayOrder,
      isActive: subTopic.isActive,
      createdBy: updatedBy,
      updatedBy: updatedBy
    });

    // Copy questions if any
    if (subTopic.questions && subTopic.questions.length > 0) {
      const QuestionService = require('./questionService');
      for (const question of subTopic.questions) {
        await QuestionService.copyQuestion(question.id, targetTopicId, newSubTopic.id, updatedBy);
      }
    }

    return await this.getSubTopicById(newSubTopic.id);
  }

  // Get subtopic breadcrumb path
  static async getSubTopicBreadcrumb(subTopicId) {
    const subTopic = await SubTopic.findByPk(subTopicId, {
      include: [{
        model: Topic,
        as: 'topic',
        attributes: ['id', 'name'],
        include: [{
          model: Module,
          as: 'module',
          attributes: ['id', 'name']
        }]
      }]
    });

    if (!subTopic) return null;

    return {
      module: {
        id: subTopic.topic.module.id,
        name: subTopic.topic.module.name
      },
      topic: {
        id: subTopic.topic.id,
        name: subTopic.topic.name
      },
      subTopic: {
        id: subTopic.id,
        name: subTopic.name
      }
    };
  }

  // Get subtopics by module
  static async getSubTopicsByModule(moduleId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await SubTopic.findAndCountAll({
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
      subTopics: rows,
      total: count
    };
  }

}

module.exports = SubTopicService;