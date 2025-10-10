const { Topic, Module, SubTopic, Question, User, SubMenu } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database'); // Add sequelize for transactions

class TopicService {
  
  // Get all topics with pagination and filtering
  static async getAllTopics(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'priority',
      sortOrder = 'ASC',
      search,
      moduleId,
      isActive
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Validate and map sort field
    const validSortFields = {
      'id': 'id',
      'topicName': 'topicName', 
      'subName': 'subName',
      'priority': 'priority',
      'active': 'active',
      'formType': 'formType',
      'isShowPrevious': 'isShowPrevious',
      'isShowCummulative': 'isShowCummulative',
      'moduleName': ['module', 'moduleName'] // For joined field
    };

    const validatedSortBy = validSortFields[sortBy] || 'priority';

    if (search) {
      whereClause[Op.or] = [
        { topicName: { [Op.like]: `%${search}%` } },
        { subName: { [Op.like]: `%${search}%` } }
      ];
    }

    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    if (isActive !== undefined) {
      whereClause.active = isActive; // Fix: use 'active' not 'isActive'
    }

    // Build order clause based on sort field
    let orderClause;
    if (Array.isArray(validatedSortBy)) {
      // For joined fields like ['module', 'moduleName']
      orderClause = [[...validatedSortBy, sortOrder]];
    } else {
      // For direct fields
      orderClause = [[validatedSortBy, sortOrder]];
    }

    const { count, rows } = await Topic.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Module,
          as: 'module',
          attributes: ['id', 'moduleName'] // Fix: use 'moduleName' not 'name'
        }
      ],
      limit,
      offset,
      order: orderClause
    });

    return {
      topics: rows.map(topic => {
        const topicJson = topic.toJSON();
        return {
          ...topicJson,
          moduleName: topicJson.module ? topicJson.module.moduleName : null,
          moduleId: topicJson.moduleId, // Keep moduleId for reference
          module: undefined // Remove nested module object
        };
      }),
      total: count
    };
  }

  // Get topic by ID
  static async getTopicById(id) {
    const topic = await Topic.findByPk(id);

    if (!topic) return null;

    const topicJson = topic.toJSON();
    return {
      ...topicJson,
      moduleName: topicJson.module ? topicJson.module.moduleName : null,
      moduleDescription: topicJson.module ? topicJson.module.description : null,
      moduleId: topicJson.moduleId, 
      module: undefined 
    };
  }

  // Create new topic
  static async createTopic(topicData) {
    const transaction = await sequelize.transaction();
    
    try {
      // Step 1: Find module by moduleId to get submenu_id
      const module = await Module.findByPk(topicData.moduleId, { transaction });
      if (!module) {
        throw new Error(`Module with ID ${topicData.moduleId} not found`);
      }

      // Step 2: Add submenu_id to topic data
      const topicPayload = {
        ...topicData,
        subMenuId: module.subMenuId // Set submenu_id from module
      };

      // Step 3: Create the topic
      const newTopic = await Topic.create(topicPayload, { transaction });

      // Step 4: Create submenu entry
      const subMenuData = {
        menuId: 5, // Fixed value as per requirement
        menuName: topicData.topicName,
        subMenuId: module.subMenuId,
        menuUrl: `/performance?module=${module.priority-1}&topic=${newTopic.priority}`,
        priority: topicData.priority || 0,
        active: topicData.active !== undefined ? topicData.active : true,
        createdBy: topicData.createdBy,
        updatedBy: topicData.createdBy
      };

      await SubMenu.create(subMenuData, { transaction });

      // Commit transaction if all operations succeed
      await transaction.commit();

      // Return the created topic with flattened module data
      return newTopic.toJSON();

    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();
      throw error;
    }
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
        { topicName: { [Op.like]: `%${search}%` } },
        { subName: { [Op.like]: `%${search}%` } }
      ]
    };

    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    if (isActive !== undefined) {
      whereClause.active = isActive;
    }

    const { count, rows } = await Topic.findAndCountAll({
      where: whereClause,
      include: [{
        model: Module,
        as: 'module',
        attributes: ['id', 'moduleName']
      }],
      limit,
      offset,
      order: [['topicName', 'ASC']]
    });

    return {
      topics: rows.map(topic => {
        const topicJson = topic.toJSON();
        return {
          ...topicJson,
          moduleName: topicJson.module ? topicJson.module.moduleName : null,
          moduleId: topicJson.moduleId,
          module: undefined
        };
      }),
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
  static async getActiveTopics() {
    const whereClause = { active: true };

    const topics = await Topic.findAll({
      where: whereClause,
      order: [['topicName', 'ASC']],
      attributes: ['id', 'topicName']
    });

    return topics.map(topic => {
      const topicJson = topic.toJSON();
      return {
        ...topicJson,
        moduleName: topicJson.module ? topicJson.module.moduleName : null,
        moduleId: topicJson.moduleId,
        module: undefined
      };
    });
  }

  // Activate topic
  static async activateTopic(id, updatedBy) {
    const topic = await Topic.findByPk(id);
    if (!topic) return null;

    await topic.update({
      active: true,
      updatedBy
    });

    return topic;
  }

  // Deactivate topic
  static async deactivateTopic(id, updatedBy) {
    const topic = await Topic.findByPk(id);
    if (!topic) return null;

    await topic.update({
      active: false,
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
      Topic.count({ where: { ...whereClause, active: true } }),
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
        'topicName',
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
        'topicName',
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
        name: topic.topicName,
        subTopicCount: parseInt(topic.dataValues.subTopicCount) || 0
      })),
      questionCounts: questionCounts.map(topic => ({
        id: topic.id,
        name: topic.topicName,
        questionCount: parseInt(topic.dataValues.questionCount) || 0
      }))
    };
  }

  // Check if topic name exists in module
  static async isNameExists(topicName, moduleId, excludeId = null) {
    const whereClause = { topicName, moduleId };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await Topic.count({ where: whereClause });
    return count > 0;
  }

  // Reorder topics within module
  static async reorderTopics(topicOrders, updatedBy) {
    const promises = topicOrders.map(({ id, priority }) => 
      Topic.update(
        { priority, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    return await Topic.findAll({
      where: { id: { [Op.in]: topicOrders.map(t => t.id) } },
      order: [['priority', 'ASC']],
      attributes: ['id', 'topicName', 'priority', 'moduleId']
    });
  }

  // Get topics for dropdown
  static async getTopicsForDropdown(moduleId = null) {
    const whereClause = { active: true };
    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    return await Topic.findAll({
      where: whereClause,
      attributes: ['id', 'topicName', 'priority', 'moduleId'],
      order: [['priority', 'ASC']]
    });
  }

  // Get topic hierarchy (with module, subtopics, and questions)
  static async getTopicHierarchy(topicId) {
    const topic = await Topic.findByPk(topicId, {
      include: [
        {
          model: Module,
          as: 'module',
          attributes: ['id', 'moduleName', 'description']
        },
        {
          model: SubTopic,
          as: 'subTopics',
          where: { active: true },
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

    if (!topic) return null;

    const topicJson = topic.toJSON();
    return {
      ...topicJson,
      moduleName: topicJson.module ? topicJson.module.moduleName : null,
      moduleDescription: topicJson.module ? topicJson.module.description : null,
      moduleId: topicJson.moduleId,
      module: undefined
    };
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
    const topics = await Topic.findAll({
      where: { id: { [Op.in]: updatedIds } },
      include: [{
        model: Module,
        as: 'module',
        attributes: ['id', 'moduleName']
      }],
      order: [['priority', 'ASC']]
    });

    return topics.map(topic => {
      const topicJson = topic.toJSON();
      return {
        ...topicJson,
        moduleName: topicJson.module ? topicJson.module.moduleName : null,
        moduleId: topicJson.moduleId,
        module: undefined
      };
    });
  }

  // Get topics with usage statistics
  static async getTopicsWithUsage(moduleId = null) {
    const whereClause = {};
    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    const topics = await Topic.findAll({
      where: whereClause,
      attributes: [
        'id',
        'topicName',
        'active',
        'priority',
        [Topic.sequelize.fn('COUNT', Topic.sequelize.col('subTopics.id')), 'subTopicCount'],
        [Topic.sequelize.fn('COUNT', Topic.sequelize.col('questions.id')), 'questionCount']
      ],
      include: [
        {
          model: Module,
          as: 'module',
          attributes: ['moduleName']
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
      order: [['priority', 'ASC']]
    });

    return topics.map(topic => {
      const topicJson = topic.toJSON();
      return {
        ...topicJson,
        moduleName: topicJson.module ? topicJson.module.moduleName : null,
        moduleId: topicJson.moduleId,
        module: undefined
      };
    });
  }

  // Get next display order within module
  static async getNextPriority(moduleId) {
    const maxOrder = await Topic.max('priority', { where: { moduleId } });
    return (maxOrder || 0) + 1;
  }

  // Copy topic to another module
  static async copyTopic(topicId, targetModuleId, updatedBy) {
    const topic = await this.getTopicById(topicId);
    if (!topic) return null;

    const newPriority = await this.getNextPriority(targetModuleId);
    
    const newTopic = await Topic.create({
      topicName: `${topic.topicName} (Copy)`,
      subName: topic.subName,
      moduleId: targetModuleId,
      priority: newPriority,
      formType: topic.formType,
      subMenuId: topic.subMenuId,
      isShowCummulative: topic.isShowCummulative,
      isShowPrevious: topic.isShowPrevious,
      isStartJan: topic.isStartJan,
      startMonth: topic.startMonth,
      endMonth: topic.endMonth,
      active: topic.active,
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

  // Get active topics by module ID (used for performance statistics form generation)
  static async findTopicByModuleId(moduleId) {
    return await Topic.findAll({
      where: { 
        moduleId,
        active: true 
      },
      include: [
        {
          model: Module,
          as: 'module',
          attributes: ['id', 'moduleName', 'priority']
        },
        {
          model: SubTopic,
          as: 'subTopics',
          where: { active: true },
          required: false,
          order: [['priority', 'ASC']]
        },
        {
          model: Question,
          as: 'questions',
          where: { active: true },
          required: false,
          order: [['priority', 'ASC']]
        }
      ],
      order: [['priority', 'ASC']]
    });
  }

  // Get topic with form configuration for dynamic form generation
  static async getTopicWithFormConfig(topicId) {
    return await Topic.findByPk(topicId, {
      include: [
        {
          model: SubTopic,
          as: 'subTopics',
          where: { active: true },
          required: false,
          include: [
            {
              model: Question,
              as: 'questions',
              where: { active: true },
              required: false,
              order: [['priority', 'ASC']]
            }
          ],
          order: [['priority', 'ASC']]
        },
        {
          model: Question,
          as: 'questions',
          where: { active: true },
          required: false,
          order: [['priority', 'ASC']]
        }
      ]
    });
  }

}

module.exports = TopicService;