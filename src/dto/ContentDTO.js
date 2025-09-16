const BaseDTO = require('./BaseDTO');

/**
 * Module DTO class
 */
class ModuleDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.topics = [];
    this.permissions = [];
    
    // Set relationship data if provided
    if (data.topics) {
      this.topics = Array.isArray(data.topics) 
        ? data.topics.map(t => new TopicDTO(t))
        : [];
    }
    
    if (data.permissions) {
      this.permissions = Array.isArray(data.permissions) 
        ? data.permissions.map(p => ({ id: p.id, name: p.name, isActive: p.isActive }))
        : [];
    }
  }

  /**
   * Get module summary for dropdown/selection
   * @returns {Object} Module summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      route: this.route,
      displayOrder: this.displayOrder,
      isActive: this.isActive
    };
  }

  /**
   * Get module with hierarchy information
   * @returns {Object} Module with hierarchy
   */
  getWithHierarchy() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      route: this.route,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      topics: this.topics.map(t => t.getSummary ? t.getSummary() : t),
      topicCount: this.topics ? this.topics.length : 0,
      permissionCount: this.permissions ? this.permissions.length : 0
    };
  }

  /**
   * Convert to response format for API
   * @returns {Object} API response format
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      route: this.route,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      topics: this.topics.map(t => t.getSummary ? t.getSummary() : t),
      permissions: this.permissions,
      topicCount: this.topics ? this.topics.length : 0,
      permissionCount: this.permissions ? this.permissions.length : 0
    };
  }

  /**
   * Get module for navigation/menu
   * @returns {Object} Navigation format
   */
  getForNavigation() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      route: this.route,
      displayOrder: this.displayOrder,
      children: this.topics
        .filter(t => t.isActive)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map(t => ({
          id: t.id,
          name: t.name,
          route: `${this.route}/${t.id}`,
          displayOrder: t.displayOrder
        }))
    };
  }
}

/**
 * Topic DTO class
 */
class TopicDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.module = null;
    this.subTopics = [];
    this.questions = [];
    
    // Set relationship data if provided
    if (data.module) {
      this.module = new ModuleDTO(data.module);
    }
    
    if (data.subTopics) {
      this.subTopics = Array.isArray(data.subTopics) 
        ? data.subTopics.map(st => new SubTopicDTO(st))
        : [];
    }
    
    if (data.questions) {
      this.questions = Array.isArray(data.questions) 
        ? data.questions.map(q => new QuestionDTO(q))
        : [];
    }
  }

  /**
   * Get topic summary for dropdown/selection
   * @returns {Object} Topic summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      moduleId: this.moduleId,
      moduleName: this.module ? this.module.name : null,
      displayOrder: this.displayOrder,
      isActive: this.isActive
    };
  }

  /**
   * Get topic with hierarchy information
   * @returns {Object} Topic with hierarchy
   */
  getWithHierarchy() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      module: this.module ? this.module.getSummary() : null,
      subTopics: this.subTopics.map(st => st.getSummary ? st.getSummary() : st),
      questions: this.questions
        .filter(q => !q.subTopicId) // Direct topic questions only
        .map(q => q.getSummary ? q.getSummary() : q),
      subTopicCount: this.subTopics ? this.subTopics.length : 0,
      questionCount: this.questions ? this.questions.length : 0
    };
  }

  /**
   * Convert to response format for API
   * @returns {Object} API response format
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      moduleId: this.moduleId,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      module: this.module ? this.module.getSummary() : null,
      subTopics: this.subTopics.map(st => st.getSummary ? st.getSummary() : st),
      questions: this.questions.map(q => q.getSummary ? q.getSummary() : q),
      subTopicCount: this.subTopics ? this.subTopics.length : 0,
      questionCount: this.questions ? this.questions.length : 0
    };
  }

  /**
   * Get topic breadcrumb path
   * @returns {Object} Breadcrumb information
   */
  getBreadcrumb() {
    return {
      module: this.module ? {
        id: this.module.id,
        name: this.module.name
      } : null,
      topic: {
        id: this.id,
        name: this.name
      }
    };
  }
}

/**
 * SubTopic DTO class
 */
class SubTopicDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.topic = null;
    this.questions = [];
    
    // Set relationship data if provided
    if (data.topic) {
      this.topic = new TopicDTO(data.topic);
    }
    
    if (data.questions) {
      this.questions = Array.isArray(data.questions) 
        ? data.questions.map(q => new QuestionDTO(q))
        : [];
    }
  }

  /**
   * Get subtopic summary for dropdown/selection
   * @returns {Object} SubTopic summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      topicId: this.topicId,
      topicName: this.topic ? this.topic.name : null,
      displayOrder: this.displayOrder,
      isActive: this.isActive
    };
  }

  /**
   * Get subtopic with hierarchy information
   * @returns {Object} SubTopic with hierarchy
   */
  getWithHierarchy() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      topic: this.topic ? this.topic.getSummary() : null,
      questions: this.questions.map(q => q.getSummary ? q.getSummary() : q),
      questionCount: this.questions ? this.questions.length : 0
    };
  }

  /**
   * Convert to response format for API
   * @returns {Object} API response format
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      topicId: this.topicId,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      topic: this.topic ? this.topic.getSummary() : null,
      questions: this.questions.map(q => q.getSummary ? q.getSummary() : q),
      questionCount: this.questions ? this.questions.length : 0
    };
  }

  /**
   * Get subtopic breadcrumb path
   * @returns {Object} Breadcrumb information
   */
  getBreadcrumb() {
    const breadcrumb = {
      subTopic: {
        id: this.id,
        name: this.name
      }
    };

    if (this.topic) {
      breadcrumb.module = this.topic.module ? {
        id: this.topic.module.id,
        name: this.topic.module.name
      } : null;
      breadcrumb.topic = {
        id: this.topic.id,
        name: this.topic.name
      };
    }

    return breadcrumb;
  }
}

/**
 * Question DTO class
 */
class QuestionDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.topic = null;
    this.subTopic = null;
    this.performanceStats = null;
    
    // Set relationship data if provided
    if (data.topic) {
      this.topic = new TopicDTO(data.topic);
    }
    
    if (data.subTopic) {
      this.subTopic = new SubTopicDTO(data.subTopic);
    }

    // Handle question options for multiple choice
    if (data.options && typeof data.options === 'string') {
      try {
        this.options = JSON.parse(data.options);
      } catch (e) {
        this.options = [];
      }
    } else if (Array.isArray(data.options)) {
      this.options = data.options;
    }
  }

  /**
   * Get question summary for dropdown/selection
   * @returns {Object} Question summary
   */
  getSummary() {
    return {
      id: this.id,
      question: this.question,
      questionType: this.questionType,
      maxScore: this.maxScore,
      topicId: this.topicId,
      subTopicId: this.subTopicId,
      topicName: this.topic ? this.topic.name : null,
      subTopicName: this.subTopic ? this.subTopic.name : null,
      displayOrder: this.displayOrder,
      isActive: this.isActive
    };
  }

  /**
   * Get question with full details
   * @returns {Object} Question with full details
   */
  getFullDetails() {
    const details = {
      id: this.id,
      question: this.question,
      description: this.description,
      questionType: this.questionType,
      maxScore: this.maxScore,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      topic: this.topic ? this.topic.getSummary() : null,
      subTopic: this.subTopic ? this.subTopic.getSummary() : null
    };

    // Add type-specific fields
    if (this.questionType === 'MULTIPLE_CHOICE' && this.options) {
      details.options = this.options;
    }

    if (['RATING', 'SCALE'].includes(this.questionType)) {
      details.scaleMin = this.scaleMin || 1;
      details.scaleMax = this.scaleMax || 5;
    }

    return details;
  }

  /**
   * Convert to response format for API
   * @returns {Object} API response format
   */
  toResponse() {
    const response = {
      id: this.id,
      question: this.question,
      description: this.description,
      questionType: this.questionType,
      maxScore: this.maxScore,
      topicId: this.topicId,
      subTopicId: this.subTopicId,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      topic: this.topic ? this.topic.getSummary() : null,
      subTopic: this.subTopic ? this.subTopic.getSummary() : null
    };

    // Add type-specific fields
    if (this.questionType === 'MULTIPLE_CHOICE' && this.options) {
      response.options = this.options;
    }

    if (['RATING', 'SCALE'].includes(this.questionType)) {
      response.scaleMin = this.scaleMin || 1;
      response.scaleMax = this.scaleMax || 5;
    }

    return response;
  }

  /**
   * Get question breadcrumb path
   * @returns {Object} Breadcrumb information
   */
  getBreadcrumb() {
    const breadcrumb = {
      question: {
        id: this.id,
        question: this.question.substring(0, 50) + (this.question.length > 50 ? '...' : '')
      }
    };

    if (this.topic) {
      breadcrumb.module = this.topic.module ? {
        id: this.topic.module.id,
        name: this.topic.module.name
      } : null;
      breadcrumb.topic = {
        id: this.topic.id,
        name: this.topic.name
      };
    }

    if (this.subTopic) {
      breadcrumb.subTopic = {
        id: this.subTopic.id,
        name: this.subTopic.name
      };
    }

    return breadcrumb;
  }

  /**
   * Get question for performance tracking
   * @returns {Object} Performance tracking format
   */
  getForPerformance() {
    return {
      id: this.id,
      question: this.question,
      questionType: this.questionType,
      maxScore: this.maxScore,
      options: this.options,
      scaleMin: this.scaleMin,
      scaleMax: this.scaleMax
    };
  }
}

/**
 * Paginated response DTO for content entities
 */
class PaginatedContentDTO extends BaseDTO {
  constructor(data, total, page = 1, limit = 10) {
    super();
    this.data = Array.isArray(data) ? data : [];
    this.total = total || 0;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(this.total / this.limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }

  /**
   * Convert to response format
   * @returns {Object} Paginated response
   */
  toResponse() {
    return {
      data: this.data.map(item => 
        item.toResponse ? item.toResponse() : item
      ),
      pagination: {
        total: this.total,
        page: this.page,
        limit: this.limit,
        totalPages: this.totalPages,
        hasNext: this.hasNext,
        hasPrev: this.hasPrev
      }
    };
  }
}

/**
 * Content statistics DTO
 */
class ContentStatsDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
  }

  /**
   * Convert to response format
   * @returns {Object} Statistics response
   */
  toResponse() {
    return {
      summary: {
        totalModules: this.totalModules || 0,
        totalTopics: this.totalTopics || 0,
        totalSubTopics: this.totalSubTopics || 0,
        totalQuestions: this.totalQuestions || 0,
        activeModules: this.activeModules || 0,
        activeTopics: this.activeTopics || 0,
        activeSubTopics: this.activeSubTopics || 0,
        activeQuestions: this.activeQuestions || 0
      },
      distributions: {
        topicsByModule: this.topicsByModule || [],
        subTopicsByTopic: this.subTopicsByTopic || [],
        questionsByTopic: this.questionsByTopic || [],
        questionsByType: this.questionsByType || []
      },
      usage: {
        mostUsedQuestions: this.mostUsedQuestions || [],
        performanceMetrics: this.performanceMetrics || {},
        completionRates: this.completionRates || {}
      }
    };
  }
}

module.exports = {
  ModuleDTO,
  TopicDTO,
  SubTopicDTO,
  QuestionDTO,
  PaginatedContentDTO,
  ContentStatsDTO
};