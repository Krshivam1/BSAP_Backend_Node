const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoleSubMenu = sequelize.define('RoleSubMenu', {
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
  subMenuId: {
    type: DataTypes.INTEGER,
    field: 'sub_menu_id',
    allowNull: false,
    references: {
      model: 'sub_menu',
      key: 'id'
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'role_sub_menu',
  timestamps: false,
  indexes: [
    {
      unique: false,
      fields: ['role_id', 'sub_menu_id']
    }
  ]
});

module.exports = RoleSubMenu;