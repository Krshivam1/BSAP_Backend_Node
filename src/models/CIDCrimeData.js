const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CIDCrimeData = sequelize.define('CIDCrimeData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cidCrimeCategoryId: {
    type: DataTypes.INTEGER,
    field: 'cid_crime_category_id',
    allowNull: true,
    references: {
      model: 'cid_crime_categories',
      key: 'id'
    }
  },
  cidCrimeCategoryTypeId: {
    type: DataTypes.INTEGER,
    field: 'cid_crime_category_type_id',
    allowNull: true,
    references: {
      model: 'cid_crime_category_types',
      key: 'id'
    }
  },
  cidCrimeModusId: {
    type: DataTypes.INTEGER,
    field: 'cid_crime_modus_id',
    allowNull: true,
    references: {
      model: 'cid_crime_modus',
      key: 'id'
    }
  },
  cidDistrictId: {
    type: DataTypes.INTEGER,
    field: 'cid_district_id',
    allowNull: true,
    references: {
      model: 'cid_districts',
      key: 'id'
    }
  },
  cidSubDivisionId: {
    type: DataTypes.INTEGER,
    field: 'cid_sub_division_id',
    allowNull: true,
    references: {
      model: 'cid_sub_divisions',
      key: 'id'
    }
  },
  cidPoliceStationId: {
    type: DataTypes.INTEGER,
    field: 'cid_police_station_id',
    allowNull: true,
    references: {
      model: 'cid_police_stations',
      key: 'id'
    }
  },
  caseNo: {
    type: DataTypes.STRING,
    field: 'case_no',
    allowNull: true
  },
  section: {
    type: DataTypes.STRING,
    allowNull: true
  },
  placeOfOccurance: {
    type: DataTypes.STRING,
    field: 'place_of_occurance',
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address1: {
    type: DataTypes.STRING,
    field: 'address_1',
    allowNull: true
  },
  address2: {
    type: DataTypes.STRING,
    field: 'address_2',
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  cashCollection: {
    type: DataTypes.STRING,
    field: 'cash_collection',
    allowNull: true
  },
  lootedItems: {
    type: DataTypes.TEXT,
    field: 'looted_items',
    allowNull: true
  },
  otherEvidence: {
    type: DataTypes.TEXT,
    field: 'other_evidence',
    allowNull: true
  },
  remark: {
    type: DataTypes.TEXT,
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
  tableName: 'cid_crime_data',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

module.exports = CIDCrimeData;