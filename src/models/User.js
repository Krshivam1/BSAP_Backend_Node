const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    field: 'first_name',
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'First name is required'
      },
      len: {
        args: [1, 50],
        msg: 'First name must be between 1 and 50 characters'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    field: 'last_name',
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Last name is required'
      },
      len: {
        args: [1, 50],
        msg: 'Last name must be between 1 and 50 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      },
      notEmpty: {
        msg: 'Email is required'
      }
    }
  },
  password: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password is required'
      }
    }
  },
  mobileNo: {
    type: DataTypes.STRING(20),
    field: 'mobile_no',
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Mobile number is required'
      }
    }
  },
  contactNo: {
    type: DataTypes.STRING(20),
    field: 'contact_no',
    allowNull: true
  },
  userImage: {
    type: DataTypes.STRING(500),
    field: 'user_image',
    allowNull: true
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
      model: 'zones', 
      key: 'id'
    }
  },
  battalionId: {
    type: DataTypes.INTEGER,
    field: 'battalion_id',
    allowNull: true,
    references: {
      model: 'battalions',
      key: 'id'
    }
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
  token: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  tokenValidity: {
    type: DataTypes.DATE,
    field: 'token_validity',
    defaultValue: DataTypes.NOW
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otp: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  otpValidity: {
    type: DataTypes.DATE,
    field: 'otp_validity',
    defaultValue: DataTypes.NOW
  },
  isFirst: {
    type: DataTypes.BOOLEAN,
    field: 'is_first',
    defaultValue: true
  },
  joiningDate: {
    type: DataTypes.STRING(250),
    field: 'joining_date',
    allowNull: true
  },
  endDate: {
    type: DataTypes.STRING(250),
    field: 'end_date',
    allowNull: true
  },
  numberSubdivision: {
    type: DataTypes.INTEGER,
    field: 'number_subdivision',
    allowNull: true,
    defaultValue: 0
  },
  numberCircle: {
    type: DataTypes.INTEGER,
    field: 'number_cirlce', // Note: Typo in database field name
    allowNull: true,
    defaultValue: 0
  },
  numberPs: {
    type: DataTypes.INTEGER,
    field: 'number_ps',
    allowNull: true,
    defaultValue: 0
  },
  numberOp: {
    type: DataTypes.INTEGER,
    field: 'number_op',
    allowNull: true,
    defaultValue: 0
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
  updatedAt: 'updated_date',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['mobile_no']
    },
    {
      fields: ['state_id']
    },
    {
      fields: ['role_id']
    },
    {
      fields: ['active']
    }
  ]
});

module.exports = User;