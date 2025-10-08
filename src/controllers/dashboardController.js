const DashboardService = require('../services/dashboardService');

/**
 * GET /api/dashboard/overview - Get dashboard overview with key metrics
 */
async function getOverview(req, res) {
  try {
    const overview = await DashboardService.getOverview();
    
    res.json({
      status: 'SUCCESS',
      message: 'Dashboard overview retrieved successfully',
      data: overview
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve dashboard overview',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/stats - Get comprehensive dashboard statistics
 */
async function getStats(req, res) {
  try {
    const stats = await DashboardService.getStats();
    
    res.json({
      status: 'SUCCESS',
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve dashboard statistics',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/users/stats - Get user statistics
 */
async function getUserStats(req, res) {
  try {
    const userStats = await DashboardService.getUserStatistics();
    
    res.json({
      status: 'SUCCESS',
      message: 'User statistics retrieved successfully',
      data: userStats
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve user statistics',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/users/by-role - Get users grouped by role
 */
async function getUsersByRole(req, res) {
  try {
    const usersByRole = await DashboardService.getUsersByRole();
    
    res.json({
      status: 'SUCCESS',
      message: 'Users by role retrieved successfully',
      data: usersByRole
    });
  } catch (error) {
    console.error('Users by role error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve users by role',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/users/by-state - Get users grouped by state
 */
async function getUsersByState(req, res) {
  try {
    const usersByState = await DashboardService.getUsersByState();
    
    res.json({
      status: 'SUCCESS',
      message: 'Users by state retrieved successfully',
      data: usersByState
    });
  } catch (error) {
    console.error('Users by state error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve users by state',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/users/recent - Get recent users
 */
async function getRecentUsers(req, res) {
  try {
    const { limit = 10 } = req.query;
    const recentUsers = await DashboardService.getRecentUsers(parseInt(limit));
    
    res.json({
      status: 'SUCCESS',
      message: 'Recent users retrieved successfully',
      data: recentUsers
    });
  } catch (error) {
    console.error('Recent users error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve recent users',
      error: error.message
    });
  }
}
 
/**
 * GET /api/dashboard/performance/overview - Get performance overview
 */
async function getPerformanceOverview(req, res) {
  try {
    const performanceOverview = await DashboardService.getPerformanceStatistics();
    
    res.json({
      status: 'SUCCESS',
      message: 'Performance overview retrieved successfully',
      data: performanceOverview
    });
  } catch (error) {
    console.error('Performance overview error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve performance overview',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/performance/by-month - Get performance data by month
 */
async function getPerformanceByMonth(req, res) {
  try {
    const performanceByMonth = await DashboardService.getPerformanceByMonth();
    
    res.json({
      status: 'SUCCESS',
      message: 'Performance data by month retrieved successfully',
      data: performanceByMonth
    });
  } catch (error) {
    console.error('Performance by month error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve performance data by month',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/performance/by-module - Get performance data by module
 */
async function getPerformanceByModule(req, res) {
  try {
    const performanceByModule = await DashboardService.getPerformanceByModule();
    
    res.json({
      status: 'SUCCESS',
      message: 'Performance data by module retrieved successfully',
      data: performanceByModule
    });
  } catch (error) {
    console.error('Performance by module error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve performance data by module',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/performance/trends - Get performance trends
 */
async function getPerformanceTrends(req, res) {
  try {
    const performanceTrends = await DashboardService.getPerformanceTrends();
    
    res.json({
      status: 'SUCCESS',
      message: 'Performance trends retrieved successfully',
      data: performanceTrends
    });
  } catch (error) {
    console.error('Performance trends error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve performance trends',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/geography/stats - Get geography statistics
 */
async function getGeographyStats(req, res) {
  try {
    const geographyStats = await DashboardService.getGeographyStatistics();
    
    res.json({
      status: 'SUCCESS',
      message: 'Geography statistics retrieved successfully',
      data: geographyStats
    });
  } catch (error) {
    console.error('Geography stats error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve geography statistics',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/geography/distribution - Get geographic distribution
 */
async function getGeographicDistribution(req, res) {
  try {
    const geographicDistribution = await DashboardService.getGeographicDistribution();
    
    res.json({
      status: 'SUCCESS',
      message: 'Geographic distribution retrieved successfully',
      data: geographicDistribution
    });
  } catch (error) {
    console.error('Geographic distribution error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve geographic distribution',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/modules/stats - Get module statistics
 */
async function getModuleStats(req, res) {
  try {
    const moduleStats = await DashboardService.getModuleStatistics();
    
    res.json({
      status: 'SUCCESS',
      message: 'Module statistics retrieved successfully',
      data: moduleStats
    });
  } catch (error) {
    console.error('Module stats error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve module statistics',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/questions/stats - Get question statistics
 */
async function getQuestionStats(req, res) {
  try {
    const questionStats = await DashboardService.getQuestionStats();
    
    res.json({
      status: 'SUCCESS',
      message: 'Question statistics retrieved successfully',
      data: questionStats
    });
  } catch (error) {
    console.error('Question stats error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve question statistics',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/system/health - Get system health information
 */
async function getSystemHealth(req, res) {
  try {
    const systemHealth = await DashboardService.getSystemHealth();
    
    res.json({
      status: 'SUCCESS',
      message: 'System health information retrieved successfully',
      data: systemHealth
    });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve system health information',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/activity/recent - Get recent activity
 */
async function getRecentActivity(req, res) {
  try {
    const { limit = 20 } = req.query;
    const recentActivity = await DashboardService.getRecentActivity(parseInt(limit));
    
    res.json({
      status: 'SUCCESS',
      message: 'Recent activity retrieved successfully',
      data: recentActivity,
      count: recentActivity.length
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve recent activity',
      error: error.message
    });
  }
}

/**
 * GET /api/dashboard/battalions/performance - Get battalion performance statistics
 */
async function getBattalionPerformance(req, res) {
  try {
    const battalionStats = await DashboardService.getBattalionPerformanceStats();
    
    res.json({
      status: 'SUCCESS',
      message: 'Battalion performance statistics retrieved successfully',
      data: battalionStats
    });
  } catch (error) {
    console.error('Battalion performance error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve battalion performance statistics',
      error: error.message
    });
  }
}

module.exports = {
  getOverview,
  getStats,
  getUserStats,
  getUsersByRole,
  getUsersByState,
  getRecentUsers,
  getPerformanceOverview,
  getPerformanceByMonth,
  getPerformanceByModule,
  getPerformanceTrends,
  getGeographyStats,
  getGeographicDistribution,
  getModuleStats,
  getQuestionStats,
  getSystemHealth,
  getRecentActivity,
  getBattalionPerformance
};