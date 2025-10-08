const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { authenticateWithPermission } = require('../middleware/auth');

// Dashboard overview routes
router.get('/overview', authenticateWithPermission, dashboardController.getOverview);
router.get('/stats', authenticateWithPermission, dashboardController.getStats);

// User statistics
router.get('/users/stats', authenticateWithPermission, dashboardController.getUserStats);
router.get('/users/by-role', authenticateWithPermission, dashboardController.getUsersByRole);
router.get('/users/by-state', authenticateWithPermission, dashboardController.getUsersByState);
router.get('/users/recent', authenticateWithPermission, dashboardController.getRecentUsers);

// Performance statistics
router.get('/performance/overview', authenticateWithPermission, dashboardController.getBattalionPerformance);
router.get('/performance/by-month', authenticateWithPermission, dashboardController.getPerformanceByMonth);
router.get('/performance/by-module', authenticateWithPermission, dashboardController.getPerformanceByModule);
router.get('/performance/trends', authenticateWithPermission, dashboardController.getPerformanceTrends);

// Geographic statistics
router.get('/geography/stats', authenticateWithPermission, dashboardController.getGeographyStats);
router.get('/geography/distribution', authenticateWithPermission, dashboardController.getGeographicDistribution);

// Module and content statistics
router.get('/modules/stats', authenticateWithPermission, dashboardController.getModuleStats);
router.get('/questions/stats', authenticateWithPermission, dashboardController.getQuestionStats);

// Battalion statistics
router.get('/battalions/performance', authenticateWithPermission, dashboardController.getPerformanceOverview);

// System statistics
router.get('/system/health', authenticateWithPermission, dashboardController.getSystemHealth);
router.get('/activity/recent', authenticateWithPermission, dashboardController.getRecentActivity);

module.exports = router;
