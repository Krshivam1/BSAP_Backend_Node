const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const State = sequelize.define('State', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  stateName: {
    type: DataTypes.STRING(250),
    field: 'state_name',
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'State name is required'
      },
      len: {
        args: [2, 250],
        msg: 'State name must be between 2 and 250 characters'
      }
    }
  },
  stateDescription: {
    type: DataTypes.TEXT,
    field: 'state_discription',
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
  tableName: 'state',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date',
  indexes: [
    {
      fields: ['state_name']
    },
    {
      fields: ['active']
    }
  ]
});

module.exports = State;