const { 
  User, Role, State, District, Range, Battalion, 
  PerformanceStatistic, Module, Topic, SubTopic, Question,
  Communications, CIDCrimeData, Permission, RolePermission,
  Menu, SubMenu
} = require('../models');
const { Op, Sequelize } = require('sequelize');

class DashboardService {
  
  /**
   * Get dashboard overview with key metrics
   */
  static async getOverview() {
    try {
      // Parallel execution for better performance
      const [
        totalUsers,
        activeUsers,
        totalRoles,
        totalPermissions,
        totalMenus,
        totalSubMenus,
        totalStates,
        totalModules,
        totalRanges,
        totalBattalions,
        totalTopics,
        totalSubTopics,
        totalQuestions,
        totalPerformanceRecords,
        recentPerformanceCount
      ] = await Promise.all([
        User.count(),
        User.count({ where: { active: true } }),
        Role.count(),
        Permission.count(),
        Menu.count(),
        SubMenu.count(),
        State.count(),
        Module.count(),
        Range.count(),
        Battalion.count(),
        Topic.count(),
        SubTopic.count(),
        Question.count(),
        PerformanceStatistic.count(),
        PerformanceStatistic.count({
          where: {
            created_date: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        })
      ]);

      return {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roles: totalRoles,
        permissions: totalPermissions,
        menus: totalMenus,
        subMenus: totalSubMenus,
        states: totalStates,
        modules: totalModules,
        ranges: totalRanges,
        battalions: totalBattalions,
        topics: totalTopics,
        subTopics: totalSubTopics,
        questions: totalQuestions,
        totalPerformanceRecords,
        recentPerformanceCount,
        userActivationRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new Error(`Error getting dashboard overview: ${error.message}`);
    }
  }

  /**
   * Get comprehensive dashboard statistics
   */
  static async getStats() {
    try {
      const [
        userStats,
        performanceStats,
        geographyStats,
        moduleStats
      ] = await Promise.all([
        this.getUserStatistics(),
        this.getPerformanceStatistics(),
        this.getGeographyStatistics(),
        this.getModuleStatistics()
      ]);

      return {
        users: userStats,
        performance: performanceStats,
        geography: geographyStats,
        modules: moduleStats,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Error getting dashboard stats: ${error.message}`);
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics() {
    try {
      const [
        totalUsers,
        activeUsers,
        usersByRole,
        recentUsers
      ] = await Promise.all([
        User.count(),
        User.count({ where: { active: true } }),
        User.findAll({
          attributes: ['roleId', [Sequelize.fn('COUNT', Sequelize.col('User.id')), 'count']],
          include: [{
            model: Role,
            as: 'role',
            attributes: ['roleName']
          }],
          group: ['roleId', 'role.id'],
          raw: false
        }),
        User.count({
          where: {
            created_date: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        })
      ]);

      return {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: usersByRole.map(item => ({
          role: item.role.roleName,
          count: parseInt(item.dataValues.count)
        })),
        newUsersThisWeek: recentUsers
      };
    } catch (error) {
      throw new Error(`Error getting user statistics: ${error.message}`);
    }
  }

  /**
   * Get users grouped by role
   */
  static async getUsersByRole() {
    try {
      const usersByRole = await User.findAll({
        attributes: [
          'roleId',
          [Sequelize.fn('COUNT', Sequelize.col('User.id')), 'count']
        ],
        include: [{
          model: Role,
          as: 'role',
          attributes: ['id', 'roleName']
        }],
        where: { active: true },
        group: ['roleId', 'role.id', 'role.roleName'],
        raw: false
      });

      return usersByRole.map(item => ({
        roleId: item.roleId,
        roleName: item.role.roleName,
        count: parseInt(item.dataValues.count)
      }));
    } catch (error) {
      throw new Error(`Error getting users by role: ${error.message}`);
    }
  }

  /**
   * Get users grouped by state
   */
  static async getUsersByState() {
    try {
      const usersByState = await User.findAll({
        attributes: [
          'stateId',
          [Sequelize.fn('COUNT', Sequelize.col('User.id')), 'count']
        ],
        include: [{
          model: State,
          as: 'state',
          attributes: ['id', 'stateName']
        }],
        where: { 
          active: true,
          stateId: { [Op.not]: null }
        },
        group: ['stateId', 'state.id', 'state.stateName'],
        raw: false
      });

      return usersByState.map(item => ({
        stateId: item.stateId,
        stateName: item.state ? item.state.stateName : 'Unknown',
        count: parseInt(item.dataValues.count)
      }));
    } catch (error) {
      throw new Error(`Error getting users by state: ${error.message}`);
    }
  }

  /**
   * Get recent users (last 30 days)
   */
  static async getRecentUsers(limit = 10) {
    try {
      const recentUsers = await User.findAll({
        attributes: ['id', 'firstName', 'lastName', 'email', 'created_date'],
        include: [{
          model: Role,
          as: 'role',
          attributes: ['roleName']
        }],
        where: {
          created_date: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        order: [['created_date', 'DESC']],
        limit
      });

      return recentUsers;
    } catch (error) {
      throw new Error(`Error getting recent users: ${error.message}`);
    }
  }

  /**
   * Get performance statistics overview
   */
  static async getPerformanceStatistics() {
    try {
      const [
        totalRecords,
        recordsThisMonth,
        averagePerUser,
        topPerformers
      ] = await Promise.all([
        PerformanceStatistic.count(),
        PerformanceStatistic.count({
          where: {
            created_date: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        this.getAveragePerformancePerUser(),
        this.getTopPerformers(5)
      ]);

      return {
        totalRecords,
        recordsThisMonth,
        averagePerUser,
        topPerformers
      };
    } catch (error) {
      throw new Error(`Error getting performance statistics: ${error.message}`);
    }
  }

  /**
   * Get battalion-wise performance statistics for current month - 1
   */
  static async getBattalionPerformanceStats() {
    try {
      // Calculate previous month (current month - 1)
      const now = new Date();
      const prevMonth = new Date(now);
      prevMonth.setMonth(now.getMonth() - 1);
      const prevMonthYear = prevMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

      // Get all active battalions
      const battalions = await Battalion.findAll({
        where: { active: true },
        attributes: ['id', 'battalionName'],
        order: [['battalionName', 'ASC']]
      });

      // Get total active modules count
      const totalActiveModules = await Module.count({
        where: { active: true }
      });

      // Get battalion performance data for previous month
      const battalionStats = await Promise.all(
        battalions.map(async (battalion) => {
          // Count distinct modules with performance data for this battalion in previous month
          const modulesWithData = await PerformanceStatistic.findAll({
            attributes: ['moduleId'],
            where: {
              battalionId: battalion.id,
              monthYear: { [Op.like]: `%${prevMonthYear}%` },
              active: true
            },
            group: ['moduleId'],
            raw: true
          });

          const moduleCount = modulesWithData.length;

          return {
            battalionId: battalion.id,
            battalionName: battalion.battalionName,
            modulesWithData: moduleCount,
            totalActiveModules: totalActiveModules,
            completionPercentage: totalActiveModules > 0 ? 
              ((moduleCount / totalActiveModules) * 100).toFixed(1) : '0.0'
          };
        })
      );

      return {
        monthYear: prevMonthYear,
        battalionStats: battalionStats,
        totalBattalions: battalions.length,
        totalActiveModules: totalActiveModules
      };
    } catch (error) {
      throw new Error(`Error getting battalion performance statistics: ${error.message}`);
    }
  }

  /** 
   * Get performance data by month (last 12 months)
   */
  static async getPerformanceByMonth() {
    try {
      const monthsData = await PerformanceStatistic.findAll({
        attributes: [
          [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_date'), '%Y-%m'), 'month'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          created_date: {
            [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
          }
        },
        group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_date'), '%Y-%m')],
        order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('created_date'), '%Y-%m'), 'ASC']],
        raw: true
      });

      return monthsData.map(item => ({
        month: item.month,
        count: parseInt(item.count)
      }));
    } catch (error) {
      throw new Error(`Error getting performance by month: ${error.message}`);
    }
  }

  /**
   * Get performance data by module
   */
  static async getPerformanceByModule() {
    try {
      const moduleData = await PerformanceStatistic.findAll({
        attributes: [
          'moduleId',
          [Sequelize.fn('COUNT', Sequelize.col('PerformanceStatistic.id')), 'count']
        ],
        include: [{
          model: Module,
          as: 'module',
          attributes: ['id', 'moduleName']
        }],
        where: {
          moduleId: { [Op.not]: null }
        },
        group: ['moduleId', 'module.id', 'module.moduleName'],
        raw: false
      });

      return moduleData.map(item => ({
        moduleId: item.moduleId,
        moduleName: item.module ? item.module.moduleName : 'Unknown',
        count: parseInt(item.dataValues.count)
      }));
    } catch (error) {
      throw new Error(`Error getting performance by module: ${error.message}`);
    }
  }

  /**
   * Get performance trends (last 30 days)
   */
  static async getPerformanceTrends() {
    try {
      const trendsData = await PerformanceStatistic.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('created_date')), 'date'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          created_date: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        group: [Sequelize.fn('DATE', Sequelize.col('created_date'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('created_date')), 'ASC']],
        raw: true
      });

      return trendsData.map(item => ({
        date: item.date,
        count: parseInt(item.count)
      }));
    } catch (error) {
      throw new Error(`Error getting performance trends: ${error.message}`);
    }
  }

  /**
   * Get geography statistics
   */
  static async getGeographyStatistics() {
    try {
      const [
        totalStates,
        totalDistricts,
        totalRanges,
        totalBattalions
      ] = await Promise.all([
        State.count({ where: { active: true } }),
        District.count({ where: { active: true } }),
        Range.count({ where: { active: true } }),
        Battalion.count({ where: { active: true } })
      ]);

      return {
        totalStates,
        totalDistricts,
        totalRanges,
        totalBattalions
      };
    } catch (error) {
      throw new Error(`Error getting geography statistics: ${error.message}`);
    }
  }

  /**
   * Get geographic distribution of users
   */
  static async getGeographicDistribution() {
    try {
      const distribution = await User.findAll({
        attributes: [
          'stateId',
          'rangeId',
          'battalionId',
          [Sequelize.fn('COUNT', Sequelize.col('User.id')), 'count']
        ],
        include: [
          {
            model: State,
            as: 'state',
            attributes: ['stateName']
          },
          {
            model: Range,
            as: 'range',
            attributes: ['rangeName']
          },
          {
            model: Battalion,
            as: 'battalion',
            attributes: ['battalionName']
          }
        ],
        where: { active: true },
        group: ['stateId', 'rangeId', 'battalionId'],
        raw: false
      });

      return distribution.map(item => ({
        stateId: item.stateId,
        stateName: item.state ? item.state.stateName : null,
        rangeId: item.rangeId,
        rangeName: item.range ? item.range.rangeName : null,
        battalionId: item.battalionId,
        battalionName: item.battalion ? item.battalion.battalionName : null,
        userCount: parseInt(item.dataValues.count)
      }));
    } catch (error) {
      throw new Error(`Error getting geographic distribution: ${error.message}`);
    }
  }

  /**
   * Get module statistics
   */
  static async getModuleStatistics() {
    try {
      const [
        totalModules,
        activeModules,
        totalTopics,
        totalQuestions
      ] = await Promise.all([
        Module.count(),
        Module.count({ where: { active: true } }),
        Topic.count({ where: { active: true } }),
        Question.count({ where: { active: true } })
      ]);

      return {
        totalModules,
        activeModules,
        inactiveModules: totalModules - activeModules,
        totalTopics,
        totalQuestions
      };
    } catch (error) {
      throw new Error(`Error getting module statistics: ${error.message}`);
    }
  }

  /**
   * Get question statistics
   */
  static async getQuestionStats() {
    try {
      const questionsByModule = await Question.findAll({
        attributes: [
          'moduleId',
          [Sequelize.fn('COUNT', Sequelize.col('Question.id')), 'count']
        ],
        include: [{
          model: Module,
          as: 'module',
          attributes: ['moduleName']
        }],
        where: { active: true },
        group: ['moduleId', 'module.id', 'module.moduleName'],
        raw: false
      });

      const questionsByTopic = await Question.findAll({
        attributes: [
          'topicId',
          [Sequelize.fn('COUNT', Sequelize.col('Question.id')), 'count']
        ],
        include: [{
          model: Topic,
          as: 'topic',
          attributes: ['topicName']
        }],
        where: { 
          active: true,
          topicId: { [Op.not]: null }
        },
        group: ['topicId', 'topic.id', 'topic.topicName'],
        raw: false
      });

      return {
        byModule: questionsByModule.map(item => ({
          moduleId: item.moduleId,
          moduleName: item.module ? item.module.moduleName : 'Unknown',
          count: parseInt(item.dataValues.count)
        })),
        byTopic: questionsByTopic.map(item => ({
          topicId: item.topicId,
          topicName: item.topic ? item.topic.topicName : 'Unknown',
          count: parseInt(item.dataValues.count)
        }))
      };
    } catch (error) {
      throw new Error(`Error getting question statistics: ${error.message}`);
    }
  }

  /**
   * Get system health information
   */
  static async getSystemHealth() {
    try {
      const [
        databaseStatus,
        totalRecords,
        recentActivity
      ] = await Promise.all([
        this.checkDatabaseConnection(),
        this.getTotalRecordCounts(),
        this.getRecentActivityCount()
      ]);

      return {
        database: databaseStatus,
        records: totalRecords,
        recentActivity,
        timestamp: new Date(),
        status: databaseStatus.connected ? 'healthy' : 'unhealthy'
      };
    } catch (error) {
      throw new Error(`Error getting system health: ${error.message}`);
    }
  }

  /**
   * Get recent activity (performance statistics created in last 24 hours)
   */
  static async getRecentActivity(limit = 20) {
    try {
      const recentActivity = await PerformanceStatistic.findAll({
        attributes: ['id', 'userId', 'moduleId', 'topicId', 'created_date'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          },
          {
            model: Module,
            as: 'module',
            attributes: ['moduleName']
          },
          {
            model: Topic,
            as: 'topic',
            attributes: ['topicName']
          }
        ],
        where: {
          created_date: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        order: [['created_date', 'DESC']],
        limit
      });

      return recentActivity;
    } catch (error) {
      throw new Error(`Error getting recent activity: ${error.message}`);
    }
  }

  // Helper methods

  /**
   * Get average performance records per user
   */
  static async getAveragePerformancePerUser() {
    try {
      const [totalRecords, totalUsers] = await Promise.all([
        PerformanceStatistic.count(),
        User.count({ where: { active: true } })
      ]);

      return totalUsers > 0 ? (totalRecords / totalUsers).toFixed(2) : 0;
    } catch (error) {
      throw new Error(`Error calculating average performance per user: ${error.message}`);
    }
  }

  /**
   * Get top performers (users with most performance records)
   */
  static async getTopPerformers(limit = 5) {
    try {
      const topPerformers = await PerformanceStatistic.findAll({
        attributes: [
          'userId',
          [Sequelize.fn('COUNT', Sequelize.col('PerformanceStatistic.id')), 'recordCount']
        ],
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }],
        where: {
          userId: { [Op.not]: null }
        },
        group: ['userId', 'user.id'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('PerformanceStatistic.id')), 'DESC']],
        limit,
        raw: false
      });

      return topPerformers.map(item => ({
        userId: item.userId,
        userName: item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown',
        email: item.user ? item.user.email : null,
        recordCount: parseInt(item.dataValues.recordCount)
      }));
    } catch (error) {
      throw new Error(`Error getting top performers: ${error.message}`);
    }
  }

  /**
   * Check database connection
   */
  static async checkDatabaseConnection() {
    try {
      await User.findOne({ limit: 1 });
      return {
        connected: true,
        message: 'Database connection is healthy'
      };
    } catch (error) {
      return {
        connected: false,
        message: 'Database connection failed',
        error: error.message
      };
    }
  }

  /**
   * Get total record counts for all main tables
   */
  static async getTotalRecordCounts() {
    try {
      const [
        users,
        roles,
        modules,
        topics,
        questions,
        performanceRecords,
        states,
        districts,
        ranges,
        battalions
      ] = await Promise.all([
        User.count(),
        Role.count(),
        Module.count(),
        Topic.count(),
        Question.count(),
        PerformanceStatistic.count(),
        State.count(),
        District.count(),
        Range.count(),
        Battalion.count()
      ]);

      return {
        users,
        roles,
        modules,
        topics,
        questions,
        performanceRecords,
        states,
        districts,
        ranges,
        battalions
      };
    } catch (error) {
      throw new Error(`Error getting total record counts: ${error.message}`);
    }
  }

  /**
   * Get recent activity count (last 24 hours)
   */
  static async getRecentActivityCount() {
    try {
      const count = await PerformanceStatistic.count({
        where: {
          created_date: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      return count;
    } catch (error) {
      throw new Error(`Error getting recent activity count: ${error.message}`);
    }
  }
}

module.exports = DashboardService;