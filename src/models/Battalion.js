const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Battalion = sequelize.define('Battalion', {
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
      model: 'zone',
      key: 'id'
    }
  },
  districtId: {
    type: DataTypes.INTEGER,
    field: 'district_id',
    allowNull: true,
    references: {
      model: 'district',
      key: 'id'
    }
  },
  battalionName: {
    type: DataTypes.STRING,
    field: 'battalion_name',
    allowNull: false
  },
  battalionHead: {
    type: DataTypes.STRING,
    field: 'battalion_head',
    allowNull: true
  },
  battalionContactNo: {
    type: DataTypes.STRING,
    field: 'battalion_contact_no',
    allowNull: true
  },
  battalionMobileNo: {
    type: DataTypes.STRING,
    field: 'battalion_mobile_no',
    allowNull: true
  },
  battalionEmail: {
    type: DataTypes.STRING,
    field: 'battalion_email',
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  battalionImage: {
    type: DataTypes.STRING,
    field: 'battalion_image',
    allowNull: true
  },
  battalionPersonImage: {
    type: DataTypes.STRING,
    field: 'battalion_person_image',
    allowNull: true
  },
  battalionArea: {
    type: DataTypes.TEXT,
    field: 'battalion_area',
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
  tableName: 'battalion',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = Battalion;