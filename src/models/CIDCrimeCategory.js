const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CIDCrimeCategory = sequelize.define('CIDCrimeCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nameOfCrimeCategory: {
    type: DataTypes.STRING,
    field: 'name_of_crime_category',
    allowNull: false
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
  tableName: 'cid_crime_category',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = CIDCrimeCategory;