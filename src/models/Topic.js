const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Topic = sequelize.define('Topic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  topicName: {
    type: DataTypes.STRING,
    field: 'topic_name',
    allowNull: false
  },
  subName: {
    type: DataTypes.STRING,
    field: 'sub_name',
    allowNull: true
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  formType: {
    type: DataTypes.STRING,
    field: 'form_type',
    allowNull: true
  },
  subMenuId: {
    type: DataTypes.INTEGER,
    field: 'submenu_id',
    allowNull: true,
    references: {
      model: 'sub_menus',
      key: 'id'
    }
  },
  isShowCummulative: {
    type: DataTypes.BOOLEAN,
    field: 'is_show_cummulative',
    defaultValue: true
  },
  isShowPrevious: {
    type: DataTypes.BOOLEAN,
    field: 'is_show_previous',
    defaultValue: true
  },
  isStartJan: {
    type: DataTypes.BOOLEAN,
    field: 'is_start_jan',
    defaultValue: true
  },
  startMonth: {
    type: DataTypes.INTEGER,
    field: 'start_month',
    allowNull: true,
    validate: {
      min: 1,
      max: 12
    }
  },
  endMonth: {
    type: DataTypes.INTEGER,
    field: 'end_month',
    allowNull: true,
    validate: {
      min: 1,
      max: 12
    }
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
  tableName: 'topic',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = Topic;