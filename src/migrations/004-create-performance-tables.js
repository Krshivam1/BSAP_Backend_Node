'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create PerformanceStatistics table
    await queryInterface.createTable('PerformanceStatistics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      stateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'States',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      districtId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Districts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rangeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Ranges',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      moduleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Modules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      topicId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Topics',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subTopicId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'SubTopics',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      questionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Questions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      score: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      maxScore: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      response: {
        type: Sequelize.JSON,
        allowNull: true
      },
      submissionDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'DRAFT'
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reviewedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create SystemConfig table for application settings
    await queryInterface.createTable('SystemConfig', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      configKey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      configValue: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      configType: {
        type: Sequelize.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE'),
        allowNull: false,
        defaultValue: 'STRING'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'GENERAL'
      },
      isEditable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Communication tables for messaging system
    await queryInterface.createTable('Communications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('ANNOUNCEMENT', 'NOTIFICATION', 'MESSAGE', 'ALERT'),
        allowNull: false,
        defaultValue: 'NOTIFICATION'
      },
      priority: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
        allowNull: false,
        defaultValue: 'MEDIUM'
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      targetType: {
        type: Sequelize.ENUM('ALL', 'ROLE', 'USER', 'GEOGRAPHY'),
        allowNull: false,
        defaultValue: 'ALL'
      },
      targetValue: {
        type: Sequelize.STRING,
        allowNull: true
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.createTable('CommunicationUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      communicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Communications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isDelivered: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add comprehensive indexes for performance optimization
    await queryInterface.addIndex('PerformanceStatistics', ['userId']);
    await queryInterface.addIndex('PerformanceStatistics', ['stateId']);
    await queryInterface.addIndex('PerformanceStatistics', ['districtId']);
    await queryInterface.addIndex('PerformanceStatistics', ['rangeId']);
    await queryInterface.addIndex('PerformanceStatistics', ['moduleId']);
    await queryInterface.addIndex('PerformanceStatistics', ['topicId']);
    await queryInterface.addIndex('PerformanceStatistics', ['subTopicId']);
    await queryInterface.addIndex('PerformanceStatistics', ['questionId']);
    await queryInterface.addIndex('PerformanceStatistics', ['submissionDate']);
    await queryInterface.addIndex('PerformanceStatistics', ['status']);
    await queryInterface.addIndex('PerformanceStatistics', ['userId', 'moduleId', 'topicId']);
    await queryInterface.addIndex('PerformanceStatistics', ['stateId', 'districtId', 'rangeId']);
    
    await queryInterface.addIndex('SystemConfig', ['category']);
    await queryInterface.addIndex('SystemConfig', ['isActive']);
    
    await queryInterface.addIndex('Communications', ['senderId']);
    await queryInterface.addIndex('Communications', ['type']);
    await queryInterface.addIndex('Communications', ['priority']);
    await queryInterface.addIndex('Communications', ['targetType']);
    await queryInterface.addIndex('Communications', ['scheduledAt']);
    await queryInterface.addIndex('Communications', ['isActive']);
    
    await queryInterface.addIndex('CommunicationUsers', ['communicationId']);
    await queryInterface.addIndex('CommunicationUsers', ['userId']);
    await queryInterface.addIndex('CommunicationUsers', ['isRead']);
    await queryInterface.addIndex('CommunicationUsers', ['communicationId', 'userId'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order due to foreign key constraints
    await queryInterface.dropTable('CommunicationUsers');
    await queryInterface.dropTable('Communications');
    await queryInterface.dropTable('SystemConfig');
    await queryInterface.dropTable('PerformanceStatistics');
  }
};