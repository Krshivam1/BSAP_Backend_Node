const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
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
  rangeId: {
    type: DataTypes.INTEGER,
    field: 'range_id',
    allowNull: true,
    references: {
      model: 'ranges',
      key: 'id'
    }
  },
  districtId: {
    type: DataTypes.INTEGER,
    field: 'district_id',
    allowNull: true,
    references: {
      model: 'districts',
      key: 'id'
    }
  },
  firstName: {
    type: DataTypes.STRING,
    field: 'first_name',
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    field: 'last_name',
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  mobileNo: {
    type: DataTypes.STRING,
    field: 'mobile_no',
    allowNull: true
  },
  contactNo: {
    type: DataTypes.STRING,
    field: 'contact_no',
    allowNull: true
  },
  userImage: {
    type: DataTypes.STRING,
    field: 'user_image',
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isFirst: {
    type: DataTypes.BOOLEAN,
    field: 'is_first',
    defaultValue: true
  },
  joiningDate: {
    type: DataTypes.STRING,
    field: 'joining_date',
    allowNull: true
  },
  endDate: {
    type: DataTypes.STRING,
    field: 'end_date',
    allowNull: true
  },
  numberSubdivision: {
    type: DataTypes.INTEGER,
    field: 'number_subdivision',
    allowNull: true
  },
  numberCircle: {
    type: DataTypes.INTEGER,
    field: 'number_cirlce',
    allowNull: true
  },
  numberPs: {
    type: DataTypes.INTEGER,
    field: 'number_ps',
    allowNull: true
  },
  numberOp: {
    type: DataTypes.INTEGER,
    field: 'number_op',
    allowNull: true
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tokenValidity: {
    type: DataTypes.DATE,
    field: 'token_validity',
    defaultValue: DataTypes.NOW
  },
  roleId: {
    type: DataTypes.INTEGER,
    field: 'role_id',
    allowNull: true,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otpValidity: {
    type: DataTypes.DATE,
    field: 'otp_validity',
    defaultValue: DataTypes.NOW
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'user',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = User;