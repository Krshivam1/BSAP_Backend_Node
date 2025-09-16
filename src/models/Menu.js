const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  menuName: {
    type: DataTypes.STRING,
    field: 'menu_name',
    allowNull: false,
    unique: true
  },
  menuUrl: {
    type: DataTypes.STRING,
    field: 'menu_url',
    allowNull: true
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
  tableName: 'menu',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = Menu;