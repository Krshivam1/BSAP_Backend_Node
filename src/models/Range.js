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
    allowNull: false,
    references: {
      model: 'state',
      key: 'id'
    }
  },
  rangeName: {
    type: DataTypes.STRING(250),
    field: 'range_name',
    allowNull: false
  },
  rangeHead: {
    type: DataTypes.STRING(250),
    field: 'range_head',
    allowNull: false
  },
  rangeContactNo: {
    type: DataTypes.STRING(20),
    field: 'range_contact_no',
    allowNull: false
  },
  rangeMobileNo: {
    type: DataTypes.STRING(20),
    field: 'range_mobile_no',
    allowNull: false
  },
  rangeEmail: {
    type: DataTypes.STRING(50),
    field: 'range_email',
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  rangeDescription: {
    type: DataTypes.TEXT('long'),
    field: 'range_discription',
    allowNull: true
  },
  rangeImage: {
    type: DataTypes.STRING(250),
    field: 'range_image',
    allowNull: true
  },
  rangePersonImage: {
    type: DataTypes.STRING(250),
    field: 'range_person_image',
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    allowNull: false
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    field: 'updated_by',
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'zone',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = Range;