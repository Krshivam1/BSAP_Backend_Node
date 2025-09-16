const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Module = sequelize.define('Module', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  moduleName: {
    type: DataTypes.STRING,
    field: 'module_name',
    allowNull: false
  },
  priority: {
    type: DataTypes.INTEGER,
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
  tableName: 'module',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = Module;