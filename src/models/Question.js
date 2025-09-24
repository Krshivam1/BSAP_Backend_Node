const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  topicId: {
    type: DataTypes.INTEGER,
    field: 'topic_id',
    allowNull: false,
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
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  // displayOrder: {
  //   type: DataTypes.INTEGER,
  //   field: 'display_order',
  //   allowNull: true,
  //   defaultValue: 0
  // },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  defaultVal: {
    type: DataTypes.STRING,
    field: 'default_val',
    allowNull: true
  },
  defaultQue: {
    type: DataTypes.INTEGER,
    field: 'default_que',
    allowNull: true
  },
  defaultSub: {
    type: DataTypes.INTEGER,
    field: 'default_sub',
    allowNull: true
  },
  defaultTo: {
    type: DataTypes.STRING,
    field: 'default_to',
    allowNull: true
  },
  defaultFormula: {
    type: DataTypes.TEXT,
    field: 'default_formula',
    allowNull: true
  },
  formula: {
    type: DataTypes.TEXT,
    field: 'que_formula',
    allowNull: true
  },
  isPrevious: {
    type: DataTypes.BOOLEAN,
    field: 'is_previous',
    defaultValue: true
  },
  isCumulative: {
    type: DataTypes.BOOLEAN,
    field: 'is_cumulative',
    defaultValue: true
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
  tableName: 'question',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = Question;