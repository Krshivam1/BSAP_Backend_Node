const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Main sequelize instance for the application
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false, // Changed to false to match migration table names
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    timezone: '+05:30', // IST timezone
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true
    }
  }
);

// Configuration for Sequelize CLI (migrations and seeders)
const config = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'performance_statistics',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: console.log,
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'SequelizeMeta',
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData'
  },
  test: {
    username: process.env.TEST_DB_USERNAME || 'root',
    password: process.env.TEST_DB_PASSWORD || 'password',
    database: process.env.TEST_DB_NAME || 'performance_statistics_test',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4'
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    logging: false,
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    logging: false,
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize'
  }
};

module.exports = sequelize;
module.exports.config = config;