const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoleMenu = sequelize.define('RoleMenu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    field: 'role_id',
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  menuId: {
    type: DataTypes.INTEGER,
    field: 'menu_id',
    allowNull: false,
    references: {
      model: 'menus',
      key: 'id'
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'role_menu',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'menu_id']
    }
  ]
});

module.exports = RoleMenu;