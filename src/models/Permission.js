const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  permissionName: {
    type: DataTypes.STRING,
    field: 'permission_name',
    allowNull: false
  },
  permissionCode: {
    type: DataTypes.STRING,
    field: 'permission_code',
    allowNull: false,
    unique: true
  },
  permissionUrl: {
    type: DataTypes.STRING,
    field: 'permission_url',
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
  tableName: 'permission',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = Permission;