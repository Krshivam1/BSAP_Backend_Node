const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PerformanceStatistic = sequelize.define('PerformanceStatistic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  stateId: {
    type: DataTypes.INTEGER,
    field: 'state_id',
    allowNull: true,
    references: {
      model: 'states',
      key: 'id'
    }
  },
  rangeId: {
    type: DataTypes.INTEGER,
    field: 'range_id',
    allowNull: true,
    references: {
      model: 'ranges',
      key: 'id'
    }
  },
  battalionId: {
    type: DataTypes.INTEGER,
    field: 'battalion_id',
    allowNull: true,
    references: {
      model: 'battalions',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  monthYear: {
    type: DataTypes.STRING,
    field: 'month_year',
    allowNull: true
  },
  moduleId: {
    type: DataTypes.INTEGER,
    field: 'module_id',
    allowNull: true,
    references: {
      model: 'modules',
      key: 'id'
    }
  },
  topicId: {
    type: DataTypes.INTEGER,
    field: 'topic_id',
    allowNull: true,
    references: {
      model: 'topics',
      key: 'id'
    }
  },
  subTopicId: {
    type: DataTypes.INTEGER,
    field: 'sub_topic_id',
    allowNull: true,
    references: {
      model: 'sub_topics',
      key: 'id'
    }
  },
  questionId: {
    type: DataTypes.INTEGER,
    field: 'question_id',
    allowNull: true,
    references: {
      model: 'questions',
      key: 'id'
    }
  },
  value: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    field: 'updated_by',
    allowNull: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'performance_statistic',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = PerformanceStatistic;