const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const District = sequelize.define('District', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  districtName: {
    type: DataTypes.STRING,
    field: 'district_name',
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'district',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = District;