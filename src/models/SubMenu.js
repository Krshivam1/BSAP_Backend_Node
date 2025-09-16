const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubMenu = sequelize.define('SubMenu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  menuId: {
    type: DataTypes.INTEGER,
    field: 'menu_id',
    allowNull: true,
    references: {
      model: 'menus',
      key: 'id'
    }
  },
  subMenuId: {
    type: DataTypes.INTEGER,
    field: 'sub_menu_id',
    allowNull: true
  },
  menuName: {
    type: DataTypes.STRING,
    field: 'menu_name',
    allowNull: false
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
  tableName: 'sub_menu',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = SubMenu;