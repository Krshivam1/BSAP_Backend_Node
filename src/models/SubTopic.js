const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubTopic = sequelize.define('SubTopic', {
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
  subTopicName: {
    type: DataTypes.STRING,
    field: 'sub_topic_name',
    allowNull: false
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
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
  tableName: 'sub_topic',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = SubTopic;