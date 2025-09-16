const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const District = sequelize.define('District', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rangeId: {
    type: DataTypes.INTEGER,
    field: 'range_id',
    allowNull: true,
    references: {
      model: 'ranges',
      key: 'id'
    }
  },
  districtName: {
    type: DataTypes.STRING,
    field: 'district_name',
    allowNull: false
  },
  districtHead: {
    type: DataTypes.STRING,
    field: 'district_head',
    allowNull: true
  },
  districtContactNo: {
    type: DataTypes.STRING,
    field: 'district_contact_no',
    allowNull: true
  },
  districtMobileNo: {
    type: DataTypes.STRING,
    field: 'district_mobile_no',
    allowNull: true
  },
  districtEmail: {
    type: DataTypes.STRING,
    field: 'district_email',
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  districtImage: {
    type: DataTypes.STRING,
    field: 'district_image',
    allowNull: true
  },
  districtPersonImage: {
    type: DataTypes.STRING,
    field: 'district_person_image',
    allowNull: true
  },
  districtArea: {
    type: DataTypes.STRING,
    field: 'district_area',
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
  tableName: 'district',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = District;