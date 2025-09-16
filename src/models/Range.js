const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Range = sequelize.define('Range', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  stateId: {
    type: DataTypes.INTEGER,
    field: 'state_id',
    allowNull: true,
    references: {
      model: 'states',
      key: 'id'
    }
  },
  rangeName: {
    type: DataTypes.STRING,
    field: 'range_name',
    allowNull: false
  },
  rangeHead: {
    type: DataTypes.STRING,
    field: 'range_head',
    allowNull: true
  },
  rangeContactNo: {
    type: DataTypes.STRING,
    field: 'range_contact_no',
    allowNull: true
  },
  rangeMobileNo: {
    type: DataTypes.STRING,
    field: 'range_mobile_no',
    allowNull: true
  },
  rangeEmail: {
    type: DataTypes.STRING,
    field: 'range_email',
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  rangeDescription: {
    type: DataTypes.TEXT,
    field: 'range_discription',
    allowNull: true
  },
  rangeImage: {
    type: DataTypes.STRING,
    field: 'range_image',
    allowNull: true
  },
  rangePersonImage: {
    type: DataTypes.STRING,
    field: 'range_person_image',
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
  tableName: 'zone', // Note: Java entity uses 'zone' table name
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = Range;