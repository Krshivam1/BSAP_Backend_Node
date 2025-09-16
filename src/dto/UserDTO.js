const BaseDTO = require('./BaseDTO');

/**
 * User DTO class
 */
class UserDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.roles = [];
    this.permissions = [];
    this.lastLoginHistory = null;
    this.statistics = null;
    
    // Set relationship data if provided
    if (data.roles) {
      this.roles = Array.isArray(data.roles) 
        ? data.roles.map(r => new RoleDTO(r))
        : [];
    }
    
    if (data.permissions) {
      this.permissions = Array.isArray(data.permissions) 
        ? data.permissions.map(p => ({ id: p.id, name: p.name, description: p.description }))
        : [];
    }

    if (data.lastLoginHistory) {
      this.lastLoginHistory = new UserHistoryDTO(data.lastLoginHistory);
    }

    // Remove sensitive fields from direct access
    delete this.password;
    delete this.resetToken;
    delete this.resetTokenExpiry;
  }

  /**
   * Get user summary for display/selection
   * @returns {Object} User summary
   */
  getSummary() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: `${this.firstName} ${this.lastName}`.trim(),
      isActive: this.isActive,
      roles: this.roles.map(r => r.name || r),
      lastLogin: this.lastLogin
    };
  }

  /**
   * Get user profile information
   * @returns {Object} User profile
   */
  getProfile() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: `${this.firstName} ${this.lastName}`.trim(),
      phone: this.phone,
      designation: this.designation,
      organization: this.organization,
      stateId: this.stateId,
      districtId: this.districtId,
      rangeId: this.rangeId,
      isActive: this.isActive,
      lastLogin: this.lastLogin,
      roles: this.roles.map(r => r.getSummary ? r.getSummary() : r),
      permissions: this.permissions
    };
  }

  /**
   * Convert to response format for API
   * @returns {Object} API response format
   */
  toResponse() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: `${this.firstName} ${this.lastName}`.trim(),
      phone: this.phone,
      designation: this.designation,
      organization: this.organization,
      stateId: this.stateId,
      districtId: this.districtId,
      rangeId: this.rangeId,
      isActive: this.isActive,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      roles: this.roles.map(r => r.toResponse ? r.toResponse() : r),
      permissions: this.permissions,
      roleCount: this.roles ? this.roles.length : 0,
      permissionCount: this.permissions ? this.permissions.length : 0,
      lastLoginHistory: this.lastLoginHistory ? this.lastLoginHistory.toResponse() : null
    };
  }

  /**
   * Get user for authentication
   * @returns {Object} Auth user format
   */
  getForAuth() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: `${this.firstName} ${this.lastName}`.trim(),
      isActive: this.isActive,
      roles: this.roles.map(r => r.name || r),
      permissions: this.permissions.map(p => p.name || p)
    };
  }

  /**
   * Check if user has specific permission
   * @param {string} permission Permission to check
   * @returns {boolean} Has permission
   */
  hasPermission(permission) {
    return this.permissions.some(p => 
      (typeof p === 'string' ? p : p.name) === permission
    );
  }

  /**
   * Check if user has specific role
   * @param {string} role Role to check
   * @returns {boolean} Has role
   */
  hasRole(role) {
    return this.roles.some(r => 
      (typeof r === 'string' ? r : r.name) === role
    );
  }
}

/**
 * Role DTO class
 */
class RoleDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.permissions = [];
    this.users = [];
    this.menus = [];
    this.subMenus = [];
    
    // Set relationship data if provided
    if (data.permissions) {
      this.permissions = Array.isArray(data.permissions) 
        ? data.permissions.map(p => ({ id: p.id, name: p.name, description: p.description }))
        : [];
    }

    if (data.users) {
      this.users = Array.isArray(data.users) 
        ? data.users.map(u => ({ id: u.id, username: u.username, fullName: `${u.firstName} ${u.lastName}` }))
        : [];
    }
  }

  /**
   * Get role summary for display/selection
   * @returns {Object} Role summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      permissionCount: this.permissions ? this.permissions.length : 0,
      userCount: this.users ? this.users.length : 0
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
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      permissions: this.permissions,
      users: this.users,
      menus: this.menus,
      subMenus: this.subMenus,
      permissionCount: this.permissions ? this.permissions.length : 0,
      userCount: this.users ? this.users.length : 0,
      menuCount: this.menus ? this.menus.length : 0
    };
  }
}

/**
 * UserHistory DTO class
 */
class UserHistoryDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.user = null;
    
    // Set relationship data if provided
    if (data.user) {
      this.user = {
        id: data.user.id,
        username: data.user.username,
        fullName: `${data.user.firstName} ${data.user.lastName}`
      };
    }
  }

  /**
   * Get history summary
   * @returns {Object} History summary
   */
  getSummary() {
    return {
      id: this.id,
      userId: this.userId,
      username: this.user ? this.user.username : null,
      action: this.action,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      timestamp: this.createdAt,
      isSuccess: this.isSuccess
    };
  }

  /**
   * Convert to response format for API
   * @returns {Object} API response format
   */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      action: this.action,
      description: this.description,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      sessionId: this.sessionId,
      isSuccess: this.isSuccess,
      errorMessage: this.errorMessage,
      metadata: this.metadata,
      timestamp: this.createdAt,
      user: this.user
    };
  }

  /**
   * Get login history format
   * @returns {Object} Login history format
   */
  getLoginHistory() {
    return {
      timestamp: this.createdAt,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      isSuccess: this.isSuccess,
      errorMessage: this.errorMessage
    };
  }
}

/**
 * Performance Statistic DTO class
 */
class PerformanceStatisticDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.user = null;
    this.state = null;
    this.district = null;
    this.range = null;
    this.module = null;
    this.topic = null;
    this.subTopic = null;
    this.question = null;
    
    // Set relationship data if provided
    if (data.user) {
      this.user = new UserDTO(data.user);
    }
    
    if (data.state) {
      this.state = { id: data.state.id, name: data.state.name };
    }
    
    if (data.district) {
      this.district = { id: data.district.id, name: data.district.name };
    }
    
    if (data.range) {
      this.range = { id: data.range.id, name: data.range.name };
    }
    
    if (data.module) {
      this.module = { id: data.module.id, name: data.module.name };
    }
    
    if (data.topic) {
      this.topic = { id: data.topic.id, name: data.topic.name };
    }
    
    if (data.subTopic) {
      this.subTopic = { id: data.subTopic.id, name: data.subTopic.name };
    }
    
    if (data.question) {
      this.question = { 
        id: data.question.id, 
        question: data.question.question,
        questionType: data.question.questionType,
        maxScore: data.question.maxScore
      };
    }
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getSummary() {
    return {
      id: this.id,
      userId: this.userId,
      username: this.user ? this.user.username : null,
      moduleName: this.module ? this.module.name : null,
      topicName: this.topic ? this.topic.name : null,
      score: this.score,
      maxScore: this.maxScore,
      percentage: this.maxScore > 0 ? Math.round((this.score / this.maxScore) * 100) : 0,
      submissionDate: this.submissionDate,
      status: this.status
    };
  }

  /**
   * Convert to response format for API
   * @returns {Object} API response format
   */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      stateId: this.stateId,
      districtId: this.districtId,
      rangeId: this.rangeId,
      moduleId: this.moduleId,
      topicId: this.topicId,
      subTopicId: this.subTopicId,
      questionId: this.questionId,
      score: this.score,
      maxScore: this.maxScore,
      percentage: this.maxScore > 0 ? Math.round((this.score / this.maxScore) * 100) : 0,
      response: this.response,
      submissionDate: this.submissionDate,
      status: this.status,
      remarks: this.remarks,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      user: this.user ? this.user.getSummary() : null,
      state: this.state,
      district: this.district,
      range: this.range,
      module: this.module,
      topic: this.topic,
      subTopic: this.subTopic,
      question: this.question
    };
  }

  /**
   * Get performance for analytics
   * @returns {Object} Analytics format
   */
  getForAnalytics() {
    return {
      userId: this.userId,
      stateId: this.stateId,
      districtId: this.districtId,
      rangeId: this.rangeId,
      moduleId: this.moduleId,
      topicId: this.topicId,
      subTopicId: this.subTopicId,
      questionId: this.questionId,
      score: this.score,
      maxScore: this.maxScore,
      percentage: this.maxScore > 0 ? Math.round((this.score / this.maxScore) * 100) : 0,
      submissionDate: this.submissionDate,
      status: this.status
    };
  }

  /**
   * Get performance with hierarchy
   * @returns {Object} Performance with hierarchy
   */
  getWithHierarchy() {
    return {
      id: this.id,
      score: this.score,
      maxScore: this.maxScore,
      percentage: this.maxScore > 0 ? Math.round((this.score / this.maxScore) * 100) : 0,
      submissionDate: this.submissionDate,
      status: this.status,
      hierarchy: {
        state: this.state,
        district: this.district,
        range: this.range,
        module: this.module,
        topic: this.topic,
        subTopic: this.subTopic,
        question: this.question
      },
      user: this.user ? this.user.getSummary() : null
    };
  }
}

/**
 * Performance analytics DTO
 */
class PerformanceAnalyticsDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
  }

  /**
   * Convert to response format
   * @returns {Object} Analytics response
   */
  toResponse() {
    return {
      summary: {
        totalSubmissions: this.totalSubmissions || 0,
        averageScore: this.averageScore || 0,
        averagePercentage: this.averagePercentage || 0,
        completionRate: this.completionRate || 0,
        totalUsers: this.totalUsers || 0,
        activeUsers: this.activeUsers || 0
      },
      distributions: {
        scoreDistribution: this.scoreDistribution || [],
        performanceByModule: this.performanceByModule || [],
        performanceByTopic: this.performanceByTopic || [],
        performanceByUser: this.performanceByUser || [],
        performanceByGeography: this.performanceByGeography || []
      },
      trends: {
        dailyPerformance: this.dailyPerformance || [],
        weeklyPerformance: this.weeklyPerformance || [],
        monthlyPerformance: this.monthlyPerformance || []
      },
      rankings: {
        topPerformers: this.topPerformers || [],
        topModules: this.topModules || [],
        topTopics: this.topTopics || [],
        topGeographies: this.topGeographies || []
      }
    };
  }
}

/**
 * Paginated response DTO for user entities
 */
class PaginatedUserDTO extends BaseDTO {
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

module.exports = {
  UserDTO,
  RoleDTO,
  UserHistoryDTO,
  PerformanceStatisticDTO,
  PerformanceAnalyticsDTO,
  PaginatedUserDTO
};