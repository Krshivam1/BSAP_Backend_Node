const express = require('express');
const { Op, sequelize } = require('sequelize');
const { authenticate, authorize } = require('../middleware/auth');
const { ErrorHandler } = require('../middleware/errorHandler');
const { ResponseFormatter } = require('../dto');
const { SystemConfig, User, District, Range, State, PerformanceStatistic, Role } = require('../models');
const { ValidationException, AuthorizationException, NotFoundException } = require('../exceptions');

const router = express.Router();

/**
 * @route GET /api/admin/dashboard
 * @desc Get admin dashboard statistics
 * @access Admin, SuperAdmin
 */
router.get('/dashboard', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  // Get counts for dashboard
  const [userCount, stateCount, districtCount, rangeCount, performanceCount] = await Promise.all([
    User.count({ where: { isActive: true } }),
    State.count({ where: { isActive: true } }),
    District.count({ where: { isActive: true } }),
    Range.count({ where: { isActive: true } }),
    PerformanceStatistic.count()
  ]);

  // Get recent activity
  const recentPerformance = await PerformanceStatistic.findAll({
    limit: 10,
    order: [['createdAt', 'DESC']],
    include: [
      { model: User, attributes: ['id', 'username', 'firstName', 'lastName'] },
      { model: State, attributes: ['id', 'name'] },
      { model: District, attributes: ['id', 'name'] }
    ]
  });

  const dashboardData = {
    statistics: {
      totalUsers: userCount,
      totalStates: stateCount,
      totalDistricts: districtCount,
      totalRanges: rangeCount,
      totalPerformanceRecords: performanceCount
    },
    recentActivity: recentPerformance.map(record => ({
      id: record.id,
      user: record.User ? `${record.User.firstName} ${record.User.lastName}` : 'Unknown',
      state: record.State?.name || 'Unknown',
      district: record.District?.name || 'Unknown',
      score: record.score,
      maxScore: record.maxScore,
      submissionDate: record.submissionDate,
      status: record.status
    }))
  };

  res.json(ResponseFormatter.success(dashboardData, 'Dashboard data retrieved successfully'));
}));

/**
 * @route GET /api/admin/system-config
 * @desc Get all system configuration
 * @access Admin, SuperAdmin
 */
router.get('/system-config', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const configs = await SystemConfig.findAll({
    where: { isActive: true },
    order: [['category', 'ASC'], ['configKey', 'ASC']]
  });

  // Group configs by category
  const groupedConfigs = configs.reduce((acc, config) => {
    const category = config.category || 'GENERAL';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      key: config.configKey,
      value: config.configValue,
      type: config.configType,
      description: config.description,
      isEditable: config.isEditable
    });
    return acc;
  }, {});

  res.json(ResponseFormatter.success(groupedConfigs, 'System configuration retrieved successfully'));
}));

/**
 * @route PUT /api/admin/system-config/:key
 * @desc Update system configuration
 * @access SuperAdmin
 */
router.put('/system-config/:key', authenticate, authorize(['SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value, description } = req.body;

  const config = await SystemConfig.findOne({ where: { configKey: key } });
  if (!config) {
    throw new NotFoundException('System configuration', key);
  }

  if (!config.isEditable) {
    throw new AuthorizationException('This configuration is not editable');
  }

  // Validate value based on type
  let validatedValue = value;
  switch (config.configType) {
    case 'NUMBER':
      validatedValue = Number(value);
      if (isNaN(validatedValue)) {
        throw new ValidationException('Invalid number value', [{ field: 'value', message: 'Value must be a number' }]);
      }
      break;
    case 'BOOLEAN':
      validatedValue = ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
      break;
    case 'JSON':
      try {
        JSON.parse(value);
      } catch (e) {
        throw new ValidationException('Invalid JSON value', [{ field: 'value', message: 'Value must be valid JSON' }]);
      }
      break;
  }

  await config.update({ 
    configValue: String(validatedValue),
    description: description || config.description
  });

  res.json(ResponseFormatter.success(config, 'System configuration updated successfully'));
}));

/**
 * @route POST /api/admin/system-config
 * @desc Create new system configuration
 * @access SuperAdmin
 */
router.post('/system-config', authenticate, authorize(['SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { configKey, configValue, configType, description, category, isEditable } = req.body;

  // Check if config already exists
  const existingConfig = await SystemConfig.findOne({ where: { configKey } });
  if (existingConfig) {
    throw new ValidationException('Configuration key already exists', [{ field: 'configKey', message: 'This configuration key is already in use' }]);
  }

  const config = await SystemConfig.create({
    configKey,
    configValue: String(configValue),
    configType: configType || 'STRING',
    description,
    category: category || 'GENERAL',
    isEditable: isEditable !== false
  });

  res.json(ResponseFormatter.success(config, 'System configuration created successfully'));
}));

/**
 * @route DELETE /api/admin/system-config/:key
 * @desc Delete system configuration
 * @access SuperAdmin
 */
router.delete('/system-config/:key', authenticate, authorize(['SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { key } = req.params;

  const config = await SystemConfig.findOne({ where: { configKey: key } });
  if (!config) {
    throw new NotFoundException('System configuration', key);
  }

  if (!config.isEditable) {
    throw new AuthorizationException('This configuration cannot be deleted');
  }

  await config.destroy();

  res.json(ResponseFormatter.success(null, 'System configuration deleted successfully'));
}));

/**
 * @route GET /api/admin/users/statistics
 * @desc Get user statistics for admin
 * @access Admin, SuperAdmin
 */
router.get('/users/statistics', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, usersByState, usersByRole] = await Promise.all([
    User.count(),
    User.count({ where: { isActive: true } }),
    User.findAll({
      attributes: ['stateId'],
      include: [{ model: State, attributes: ['name'] }],
      where: { isActive: true }
    }),
    User.findAll({
      include: [{ 
        model: Role, 
        attributes: ['name'],
        through: { where: { isActive: true } }
      }],
      where: { isActive: true }
    })
  ]);

  // Process state statistics
  const stateStats = usersByState.reduce((acc, user) => {
    const stateName = user.State?.name || 'Unknown';
    acc[stateName] = (acc[stateName] || 0) + 1;
    return acc;
  }, {});

  // Process role statistics
  const roleStats = usersByRole.reduce((acc, user) => {
    user.Roles?.forEach(role => {
      acc[role.name] = (acc[role.name] || 0) + 1;
    });
    return acc;
  }, {});

  const statistics = {
    summary: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers
    },
    byState: stateStats,
    byRole: roleStats
  };

  res.json(ResponseFormatter.success(statistics, 'User statistics retrieved successfully'));
}));

/**
 * @route GET /api/admin/performance/overview
 * @desc Get performance overview for admin
 * @access Admin, SuperAdmin
 */
router.get('/performance/overview', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let whereCondition = {};
  if (startDate && endDate) {
    whereCondition.submissionDate = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }

  const [
    totalRecords,
    averageScore,
    statusDistribution,
    topPerformers,
    performanceByState
  ] = await Promise.all([
    PerformanceStatistic.count({ where: whereCondition }),
    PerformanceStatistic.findAll({
      attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']],
      where: whereCondition,
      raw: true
    }),
    PerformanceStatistic.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: whereCondition,
      group: ['status'],
      raw: true
    }),
    PerformanceStatistic.findAll({
      attributes: [
        'userId',
        [sequelize.fn('AVG', sequelize.col('score')), 'avgScore'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'recordCount']
      ],
      include: [{ model: User, attributes: ['firstName', 'lastName', 'username'] }],
      where: whereCondition,
      group: ['userId'],
      order: [[sequelize.fn('AVG', sequelize.col('score')), 'DESC']],
      limit: 10
    }),
    PerformanceStatistic.findAll({
      attributes: [
        'stateId',
        [sequelize.fn('AVG', sequelize.col('score')), 'avgScore'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'recordCount']
      ],
      include: [{ model: State, attributes: ['name'] }],
      where: whereCondition,
      group: ['stateId'],
      order: [[sequelize.fn('AVG', sequelize.col('score')), 'DESC']]
    })
  ]);

  const overview = {
    summary: {
      totalRecords,
      averageScore: averageScore[0]?.avgScore || 0
    },
    statusDistribution: statusDistribution.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {}),
    topPerformers: topPerformers.map(performer => ({
      user: `${performer.User.firstName} ${performer.User.lastName}`,
      username: performer.User.username,
      averageScore: parseFloat(performer.dataValues.avgScore),
      recordCount: parseInt(performer.dataValues.recordCount)
    })),
    performanceByState: performanceByState.map(state => ({
      state: state.State?.name || 'Unknown',
      averageScore: parseFloat(state.dataValues.avgScore),
      recordCount: parseInt(state.dataValues.recordCount)
    }))
  };

  res.json(ResponseFormatter.success(overview, 'Performance overview retrieved successfully'));
}));

/**
 * @route POST /api/admin/backup/create
 * @desc Create system backup
 * @access SuperAdmin
 */
router.post('/backup/create', authenticate, authorize(['SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  // This would integrate with your backup system
  // For now, return success message
  const backupInfo = {
    backupId: `backup_${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'initiated',
    estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
  };

  res.json(ResponseFormatter.success(backupInfo, 'Backup initiated successfully'));
}));

module.exports = router;