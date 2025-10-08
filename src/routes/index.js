const express = require('express');
const router = express.Router();

// Import all route modules with error handling
console.log('🔧 Loading route modules...');

let authRoutes, userRoutes, performanceStatisticRoutes, communicationRoutes, reportRoutes, cidRoutes, adminRoutes, dashboardRoutes;
let stateRoutes, districtRoutes, rangeRoutes, battalionRoutes, moduleRoutes, topicRoutes, subTopicRoutes, questionRoutes, menuRoutes,subMenuRoutes,roleRoutes,permissionRoutes, fileRoutes;

try {
  authRoutes = require('./authRoutes');
  console.log('✅ authRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load authRoutes:', error.message);
  authRoutes = express.Router(); // fallback empty router
}

try {
  userRoutes = require('./userRoutes');
  console.log('✅ userRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load userRoutes:', error.message);
  userRoutes = express.Router();
}

try {
  performanceStatisticRoutes = require('./performanceStatisticRoutes');
  console.log('✅ performanceStatisticRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load performanceStatisticRoutes:', error.message);
  performanceStatisticRoutes = express.Router();
}

try {
  communicationRoutes = require('./communicationRoutes');
  console.log('✅ communicationRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load communicationRoutes:', error.message);
  communicationRoutes = express.Router();
}

try {
  reportRoutes = require('./reportRoutes');
  console.log('✅ reportRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load reportRoutes:', error.message);
  reportRoutes = express.Router();
}

try {
  cidRoutes = require('./cidRoutes');
  console.log('✅ cidRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load cidRoutes:', error.message);
  cidRoutes = express.Router();
}

try {
  adminRoutes = require('./adminRoutes');
  console.log('✅ adminRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load adminRoutes:', error.message);
  adminRoutes = express.Router();
}

try {
  dashboardRoutes = require('./dashboardRoutes');
  console.log('✅ dashboardRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load dashboardRoutes:', error.message);
  dashboardRoutes = express.Router();
}

try {
  stateRoutes = require('./stateRoutes');
  console.log('✅ stateRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load stateRoutes:', error.message);
  stateRoutes = express.Router();
}

try {
  districtRoutes = require('./districtRoutes');
  console.log('✅ districtRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load districtRoutes:', error.message);
  districtRoutes = express.Router();
}

try {
  rangeRoutes = require('./rangeRoutes');
  console.log('✅ rangeRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load rangeRoutes:', error.message);
  rangeRoutes = express.Router();
}

try {
  battalionRoutes = require('./battalionRoutes');
  console.log('✅ battalionRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load battalionRoutes:', error.message);
  battalionRoutes = express.Router();
}

try {
  moduleRoutes = require('./moduleRoutes');
  console.log('✅ moduleRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load moduleRoutes:', error.message);
  moduleRoutes = express.Router();
}

try {
  topicRoutes = require('./topicRoutes');
  console.log('✅ topicRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load topicRoutes:', error.message);
  topicRoutes = express.Router();
}

try {
  subTopicRoutes = require('./subTopicRoutes');
  console.log('✅ subTopicRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load subTopicRoutes:', error.message);
  subTopicRoutes = express.Router();
}

try {
  questionRoutes = require('./questionRoutes');
  console.log('✅ questionRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load questionRoutes:', error.message);
  questionRoutes = express.Router();
}

try {
  menuRoutes = require('./menuRoutes');
  console.log('✅ menuRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load menuRoutes:', error.message);
  menuRoutes = express.Router();
}

try {
  subMenuRoutes = require('./subMenuRoutes');
  console.log('✅ subMenuRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load subMenuRoutes:', error.message);
  subMenuRoutes = express.Router();
}

try {
  roleRoutes = require('./roleRoutes');
  console.log('✅ roleRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load roleRoutes:', error.message);
  roleRoutes = express.Router();
}

try {
  permissionRoutes = require('./permissionRoutes');
  console.log('✅ permissionRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load permissionRoutes:', error.message);
  permissionRoutes = express.Router();
}

try {
  fileRoutes = require('./fileRoutes');
  console.log('✅ fileRoutes loaded');
} catch (error) {
  console.error('❌ Failed to load fileRoutes:', error.message);
  fileRoutes = express.Router();
}

// Import middleware
const { authenticate } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validationMiddleware');

// Apply global middleware
router.use(sanitizeInput);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'SUCCESS',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    status: 'SUCCESS',
    message: 'API Documentation',
    version: process.env.API_VERSION || '1.0.0',
    endpoints: {
      auth: {
        prefix: '/api/auth',
        description: 'Authentication and authorization endpoints',
        endpoints: [
          'POST /login - User login',
          'POST /signup - User registration',
          'POST /logout - User logout',
          'POST /forgot-password - Request password reset',
          'POST /verify-otp - Verify OTP',
          'POST /reset-password - Reset password',
          'POST /change-password - Change password',
          'POST /refresh-token - Refresh JWT token',
          'GET /me - Get current user profile',
          'POST /verify-email - Verify email address',
          'POST /resend-verification - Resend verification OTP'
        ]
      },
      users: {
        prefix: '/api/users',
        description: 'User management endpoints',
        endpoints: [
          'GET / - Get all users',
          'GET /:id - Get user by ID',
          'POST / - Create new user',
          'PUT /:id - Update user',
          'DELETE /:id - Delete user',
          'POST /:id/activate - Activate user',
          'POST /:id/deactivate - Deactivate user',
          'GET /by-role/:roleId - Get users by role',
          'GET /by-location - Get users by location',
          'GET /search/:searchTerm - Search users',
          'GET /statistics - Get user statistics',
          'POST /bulk-operation - Bulk operations on users'
        ]
      },
      performanceStatistics: {
        prefix: '/api/performance-statistics',
        description: 'Performance statistics management endpoints',
        endpoints: [
          'GET / - Get performance statistics',
          'GET /:id - Get performance statistic by ID',
          'POST / - Create performance statistic',
          'POST /save-statistics - Save multiple statistics',
          'PUT /:id - Update performance statistic',
          'DELETE /:id - Delete performance statistic',
          'GET /user/:userId - Get statistics by user',
          'GET /summary - Get statistics summary',
          'GET /labels - Get unique labels'
        ]
      },
      communications: {
        prefix: '/api/communications',
        description: 'Communication management endpoints',
        endpoints: [
          'GET / - Get all communications',
          'GET /user - Get user communications',
          'GET /:id - Get communication by ID',
          'POST /start - Start new communication',
          'POST /:id/reply - Reply to communication',
          'PUT /:id - Update communication',
          'DELETE /:id - Delete communication',
          'GET /:id/messages - Get communication messages',
          'GET /:id/users - Get communication users',
          'POST /:id/users - Add users to communication',
          'DELETE /:id/users/:userId - Remove user from communication'
        ]
      },
      reports: {
        prefix: '/api/reports',
        description: 'Report generation endpoints',
        endpoints: [
          'POST /generate - Generate detailed report',
          'POST /excel - Generate Excel report',
          'GET /excel - Generate Excel report (GET)',
          'POST /district-excel - Generate district Excel report',
          'GET /view - View report',
          'GET /user/:userId/summary - Get user performance summary',
          'POST /custom - Generate custom report',
          'GET /templates - Get report templates'
        ]
      },
      cidCrimeData: {
        prefix: '/api/cid-crime-data',
        description: 'CID Crime data management endpoints',
        endpoints: [
          'GET / - Get all crime data',
          'GET /:id - Get crime data by ID',
          'POST / - Create crime data',
          'PUT /:id - Update crime data',
          'DELETE /:id - Delete crime data',
          'GET /statistics - Get crime statistics',
          'GET /search/:searchTerm - Search crime data',
          'POST /:id/victims - Add victim to crime',
          'POST /:id/accused - Add accused to crime',
          'POST /:id/deceased - Add deceased to crime'
        ]
      },
      states: {
        prefix: '/api/states',
        description: 'State management endpoints',
        endpoints: [
          'GET / - Get all states',
          'GET /:id - Get state by ID',
          'POST / - Create new state',
          'PUT /:id - Update state',
          'DELETE /:id - Delete state',
          'GET /search/:searchTerm - Search states',
          'GET /:id/districts - Get districts by state',
          'GET /status/active - Get active states',
          'POST /:id/activate - Activate state',
          'POST /:id/deactivate - Deactivate state',
          'GET /stats/overview - Get state statistics'
        ]
      },
      districts: {
        prefix: '/api/districts',
        description: 'District management endpoints',
        endpoints: [
          'GET / - Get all districts',
          'GET /:id - Get district by ID',
          'POST / - Create new district',
          'PUT /:id - Update district',
          'DELETE /:id - Delete district',
          'GET /by-state/:stateId - Get districts by state',
          'GET /search/:searchTerm - Search districts',
          'GET /:id/police-stations - Get police stations by district',
          'GET /:id/sub-divisions - Get sub-divisions by district',
          'GET /status/active - Get active districts',
          'POST /:id/activate - Activate district',
          'POST /:id/deactivate - Deactivate district',
          'GET /stats/overview - Get district statistics'
        ]
      },
      ranges: {
        prefix: '/api/ranges',
        description: 'Range management endpoints',
        endpoints: [
          'GET / - Get all ranges',
          'GET /:id - Get range by ID',
          'POST / - Create new range',
          'PUT /:id - Update range',
          'DELETE /:id - Delete range',
          'GET /by-district/:districtId - Get ranges by district',
          'GET /by-state/:stateId - Get ranges by state',
          'GET /search/:searchTerm - Search ranges',
          'GET /:id/police-stations - Get police stations by range',
          'GET /status/active - Get active ranges',
          'POST /:id/activate - Activate range',
          'POST /:id/deactivate - Deactivate range',
          'GET /stats/overview - Get range statistics',
          'GET /:id/users - Get users by range'
        ]
      },
      modules: {
        prefix: '/api/modules',
        description: 'Module management endpoints',
        endpoints: [
          'GET / - Get all modules',
          'GET /:id - Get module by ID',
          'POST / - Create new module',
          'PUT /:id - Update module',
          'DELETE /:id - Delete module',
          'GET /:id/topics - Get topics by module',
          'GET /search/:searchTerm - Search modules',
          'GET /status/active - Get active modules',
          'POST /:id/activate - Activate module',
          'POST /:id/deactivate - Deactivate module',
          'GET /stats/overview - Get module statistics',
          'PUT /:id/order - Update module order',
          'GET /:id/permissions - Get module permissions',
          'POST /:id/clone - Clone module'
        ]
      },
      topics: {
        prefix: '/api/topics',
        description: 'Topic management endpoints',
        endpoints: [
          'GET / - Get all topics',
          'GET /:id - Get topic by ID',
          'POST / - Create new topic',
          'PUT /:id - Update topic',
          'DELETE /:id - Delete topic',
          'GET /by-module/:moduleId - Get topics by module',
          'GET /:id/sub-topics - Get sub-topics by topic',
          'GET /search/:searchTerm - Search topics',
          'GET /status/active - Get active topics',
          'POST /:id/activate - Activate topic',
          'POST /:id/deactivate - Deactivate topic',
          'PUT /:id/order - Update topic order',
          'GET /stats/overview - Get topic statistics',
          'POST /:id/clone - Clone topic',
          'PUT /reorder - Reorder topics'
        ]
      },
      subTopics: {
        prefix: '/api/sub-topics',
        description: 'Sub-topic management endpoints',
        endpoints: [
          'GET / - Get all sub-topics',
          'GET /:id - Get sub-topic by ID',
          'POST / - Create new sub-topic',
          'PUT /:id - Update sub-topic',
          'DELETE /:id - Delete sub-topic',
          'GET /by-topic/:topicId - Get sub-topics by topic',
          'GET /:id/questions - Get questions by sub-topic',
          'GET /search/:searchTerm - Search sub-topics',
          'GET /status/active - Get active sub-topics',
          'POST /:id/activate - Activate sub-topic',
          'POST /:id/deactivate - Deactivate sub-topic',
          'PUT /:id/order - Update sub-topic order',
          'GET /stats/overview - Get sub-topic statistics',
          'POST /:id/clone - Clone sub-topic',
          'PUT /reorder - Reorder sub-topics',
          'GET /:id/performance-statistics - Get performance statistics'
        ]
      },
      questions: {
        prefix: '/api/questions',
        description: 'Question management endpoints',
        endpoints: [
          'GET / - Get all questions',
          'GET /:id - Get question by ID',
          'POST / - Create new question',
          'PUT /:id - Update question',
          'DELETE /:id - Delete question',
          'GET /by-sub-topic/:subTopicId - Get questions by sub-topic',
          'GET /by-type/:type - Get questions by type',
          'GET /search/:searchTerm - Search questions',
          'GET /status/active - Get active questions',
          'POST /:id/activate - Activate question',
          'POST /:id/deactivate - Deactivate question',
          'PUT /:id/order - Update question order',
          'GET /config/types - Get question types',
          'GET /stats/overview - Get question statistics',
          'POST /:id/clone - Clone question',
          'PUT /reorder - Reorder questions',
          'POST /bulk-create - Bulk create questions',
          'GET /:id/performance-statistics - Get performance statistics',
          'PUT /:id/metadata - Update question metadata'
        ]
      },
      menus: {
        prefix: '/api/menus',
        description: 'Menu management endpoints',
        endpoints: [
          'GET / - Get all menus',
          'GET /:id - Get menu by ID',
          'POST / - Create new menu',
          'PUT /:id - Update menu',
          'DELETE /:id - Delete menu',
          'GET /structure/hierarchy - Get menu hierarchy',
          'GET /user/:userId - Get user menus',
          'GET /role/:roleId - Get role menus',
          'GET /parent/:parentId - Get child menus',
          'GET /level/root - Get root menus',
          'GET /search/:searchTerm - Search menus',
          'GET /status/active - Get active menus',
          'POST /:id/activate - Activate menu',
          'POST /:id/deactivate - Deactivate menu',
          'PUT /:id/order - Update menu order',
          'PUT /reorder - Reorder menus',
          'GET /sidebar/:userId - Get sidebar menu',
          'GET /breadcrumb/:menuId - Get menu breadcrumb',
          'GET /stats/overview - Get menu statistics',
          'POST /:id/permissions - Assign menu permissions',
          'DELETE /:id/permissions/:roleId - Remove menu permission'
        ]
      },
      subMenuRoutes: {
  prefix: '/api/sub-menus',
  description: 'Sub-menu management endpoints',
  endpoints: [
    'GET / - Get all sub-menus',
    'GET /:id - Get sub-menu by ID',
    'POST / - Create new sub-menu',
    'PUT /:id - Update sub-menu',
    'DELETE /:id - Delete sub-menu',
    'GET /active - Get active sub-menus',
    'GET /search/:searchTerm - Search sub-menus',
    'GET /by-menu/:menuId - Get sub-menus by menu',
    'GET /by-parent/:parentId - Get sub-menus by parent',
    'POST /:id/activate - Activate sub-menu',
    'POST /:id/deactivate - Deactivate sub-menu',
    'PUT /:id/order - Update sub-menu priority'
  ]
},
roles: {
  prefix: '/api/roles',
  description: 'Role management endpoints',
  endpoints: [
    'GET / - Get all roles',
    'GET /:id - Get role by ID',
    'POST / - Create new role',
    'PUT /:id - Update role',
    'DELETE /:id - Delete role',
    'GET /active - Get active roles',
    'GET /search/:searchTerm - Search roles',
    'POST /:id/activate - Activate role',
    'POST /:id/deactivate - Deactivate role'
  ]
},
permissions: {
  prefix: '/api/permissions',
  description: 'Permission management endpoints',
  endpoints: [
    'GET / - Get all permissions',
    'GET /:id - Get permission by ID',
    'POST / - Create new permission',
    'PUT /:id - Update permission',
    'DELETE /:id - Delete permission',
    'GET /active - Get active permissions',
    'GET /search/:searchTerm - Search permissions',
    'GET /by-code/:code - Get permission by code',
    'POST /:id/activate - Activate permission',
    'POST /:id/deactivate - Deactivate permission'
  ]
},
dashboard: {
  prefix: '/api/dashboard',
  description: 'Dashboard and analytics endpoints',
  endpoints: [
    'GET /overview - Get dashboard overview',
    'GET /stats - Get comprehensive statistics',
    'GET /users/stats - Get user statistics',
    'GET /users/by-role - Get users grouped by role',
    'GET /users/by-state - Get users grouped by state',
    'GET /users/recent - Get recent users',
    'GET /performance/overview - Get performance overview',
    'GET /performance/by-month - Get performance by month',
    'GET /performance/by-module - Get performance by module',
    'GET /performance/trends - Get performance trends',
    'GET /geography/stats - Get geography statistics',
    'GET /geography/distribution - Get geographic distribution',
    'GET /modules/stats - Get module statistics',
    'GET /questions/stats - Get question statistics',
    'GET /system/health - Get system health',
    'GET /activity/recent - Get recent activity'
  ]
}
    }
  });
});

// Mount route modules
console.log('🔧 Mounting route modules...');
router.use('/auth', authRoutes);
console.log('✅ /auth mounted');
router.use('/users', userRoutes);
console.log('✅ /users mounted');
router.use('/admin', adminRoutes);
console.log('✅ /admin mounted');
router.use('/dashboard', dashboardRoutes);
console.log('✅ /dashboard mounted');
router.use('/performance-statistics', performanceStatisticRoutes);
console.log('✅ /performance-statistics mounted');
router.use('/communications', communicationRoutes);
console.log('✅ /communications mounted');
router.use('/reports', reportRoutes);
console.log('✅ /reports mounted');
router.use('/cid', cidRoutes);
console.log('✅ /cid mounted');
router.use('/states', stateRoutes);
console.log('✅ /states mounted');
router.use('/districts', districtRoutes);
console.log('✅ /districts mounted');
router.use('/ranges', rangeRoutes);
console.log('✅ /ranges mounted');
router.use('/battalions', battalionRoutes);
console.log('✅ /battalions mounted');
router.use('/modules', moduleRoutes);
console.log('✅ /modules mounted');
router.use('/topics', topicRoutes);
console.log('✅ /topics mounted');
router.use('/sub-topics', subTopicRoutes);
console.log('✅ /sub-topics mounted');
router.use('/roles', roleRoutes);
console.log('✅ /roles mounted');
router.use('/permissions', permissionRoutes);
console.log('✅ /permissions mounted');
router.use('/questions', questionRoutes);
console.log('✅ /questions mounted');
router.use('/menus', menuRoutes);
console.log('✅ /menus mounted');
router.use('/sub-menus', subMenuRoutes);
console.log('✅ /sub-menus mounted');
router.use('/files', fileRoutes);
console.log('✅ /files mounted');
console.log('🎉 All route modules mounted successfully');

// Error handling for undefined routes
router.use('*', (req, res) => {
  console.warn(`⚠️ 404 - from app`);
  res.status(404).json({
    status: 'ERROR',
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;