'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get user, geography, and content IDs for seeding
    const users = await queryInterface.sequelize.query(
      'SELECT id, stateId, districtId, rangeId FROM Users WHERE username IN (:usernames)',
      {
        replacements: { usernames: ['admin', 'testuser'] },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    const modules = await queryInterface.sequelize.query(
      'SELECT id FROM Modules ORDER BY id LIMIT 3',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const topics = await queryInterface.sequelize.query(
      'SELECT id, moduleId FROM Topics ORDER BY id LIMIT 5',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const questions = await queryInterface.sequelize.query(
      'SELECT id, topicId, maxScore FROM Questions ORDER BY id LIMIT 8',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Seed System Configuration
    const systemConfigs = [
      {
        configKey: 'APP_NAME',
        configValue: 'Performance Statistics System',
        configType: 'STRING',
        description: 'Application name displayed in the system',
        category: 'GENERAL',
        isEditable: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        configKey: 'APP_VERSION',
        configValue: '1.0.0',
        configType: 'STRING',
        description: 'Current application version',
        category: 'GENERAL',
        isEditable: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        configKey: 'MAX_LOGIN_ATTEMPTS',
        configValue: '5',
        configType: 'NUMBER',
        description: 'Maximum login attempts before account lockout',
        category: 'SECURITY',
        isEditable: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        configKey: 'SESSION_TIMEOUT',
        configValue: '3600',
        configType: 'NUMBER',
        description: 'Session timeout in seconds',
        category: 'SECURITY',
        isEditable: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        configKey: 'PASSWORD_MIN_LENGTH',
        configValue: '8',
        configType: 'NUMBER',
        description: 'Minimum password length requirement',
        category: 'SECURITY',
        isEditable: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        configKey: 'ENABLE_EMAIL_NOTIFICATIONS',
        configValue: 'true',
        configType: 'BOOLEAN',
        description: 'Enable email notifications',
        category: 'NOTIFICATIONS',
        isEditable: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        configKey: 'DEFAULT_PAGE_SIZE',
        configValue: '10',
        configType: 'NUMBER',
        description: 'Default pagination page size',
        category: 'UI',
        isEditable: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        configKey: 'MAX_FILE_UPLOAD_SIZE',
        configValue: '10485760',
        configType: 'NUMBER',
        description: 'Maximum file upload size in bytes (10MB)',
        category: 'FILES',
        isEditable: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('SystemConfig', systemConfigs, {});

    // Seed sample performance statistics
    const performanceStats = [];
    const submissionDates = [
      new Date('2024-01-15'),
      new Date('2024-01-20'),
      new Date('2024-02-05'),
      new Date('2024-02-15'),
      new Date('2024-03-01'),
      new Date('2024-03-10'),
      new Date('2024-03-20'),
      new Date('2024-04-01')
    ];

    const statuses = ['SUBMITTED', 'REVIEWED', 'APPROVED', 'DRAFT'];
    const responses = [
      { answer: 'Verify complainant identity and record details accurately', timeSpent: 45 },
      { rating: 5, confidence: 'high' },
      { value: 23, explanation: 'Based on IPC sections' },
      { text: 'Secure the scene, photograph evidence, collect samples with proper labeling, maintain chain of custody', detail: 'comprehensive' },
      { boolean: true, reasoning: 'Mandatory for legal validity' },
      { choice: '₹1000', reference: 'Motor Vehicle Act 2019' },
      { description: 'Zone-based patrol with high crime area focus, community interaction points, emergency response readiness', strategy: 'proactive' },
      { scale: 8, factors: 'community trust, crime prevention, local knowledge' }
    ];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const user = users[i % users.length];
      
      // Calculate score based on question type and response quality
      let score = Math.floor(Math.random() * question.maxScore * 0.8) + question.maxScore * 0.2;
      score = Math.min(score, question.maxScore);

      performanceStats.push({
        userId: user.id,
        stateId: user.stateId,
        districtId: user.districtId,
        rangeId: user.rangeId,
        moduleId: topics.find(t => t.id === question.topicId)?.moduleId || modules[0].id,
        topicId: question.topicId,
        subTopicId: null,
        questionId: question.id,
        score: score,
        maxScore: question.maxScore,
        response: JSON.stringify(responses[i]),
        submissionDate: submissionDates[i],
        status: statuses[i % statuses.length],
        remarks: i % 3 === 0 ? 'Good understanding demonstrated' : null,
        reviewedBy: i % 4 === 0 ? users[0].id : null,
        reviewedAt: i % 4 === 0 ? new Date(submissionDates[i].getTime() + 86400000) : null,
        createdAt: submissionDates[i],
        updatedAt: new Date()
      });
    }

    // Add some topic-level performance stats (without specific questions)
    for (let i = 0; i < 5; i++) {
      const topic = topics[i];
      const user = users[i % users.length];
      
      performanceStats.push({
        userId: user.id,
        stateId: user.stateId,
        districtId: user.districtId,
        rangeId: user.rangeId,
        moduleId: topic.moduleId,
        topicId: topic.id,
        subTopicId: null,
        questionId: null,
        score: Math.floor(Math.random() * 80) + 60, // 60-140 range
        maxScore: 150,
        response: JSON.stringify({
          type: 'topic_assessment',
          completedQuestions: Math.floor(Math.random() * 10) + 5,
          averageTime: Math.floor(Math.random() * 300) + 120,
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
        }),
        submissionDate: submissionDates[i],
        status: 'APPROVED',
        remarks: 'Topic assessment completed successfully',
        reviewedBy: users[0].id,
        reviewedAt: new Date(submissionDates[i].getTime() + 172800000), // 2 days later
        createdAt: submissionDates[i],
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('PerformanceStatistics', performanceStats, {});

    // Seed sample communications
    const communications = [
      {
        title: 'System Maintenance Notice',
        description: 'The system will undergo scheduled maintenance on Sunday from 2:00 AM to 4:00 AM. Please save your work before this time.',
        type: 'ANNOUNCEMENT',
        priority: 'MEDIUM',
        senderId: users[0].id,
        targetType: 'ALL',
        targetValue: null,
        scheduledAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'New Training Module Available',
        description: 'A new training module on "Digital Evidence Handling" has been added. Please complete it before the end of this month.',
        type: 'NOTIFICATION',
        priority: 'HIGH',
        senderId: users[0].id,
        targetType: 'ROLE',
        targetValue: 'USER',
        scheduledAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Performance Review Due',
        description: 'Your monthly performance review is due. Please submit your responses by Friday.',
        type: 'ALERT',
        priority: 'URGENT',
        senderId: users[0].id,
        targetType: 'USER',
        targetValue: users[1].id.toString(),
        scheduledAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Communications', communications, {});

    // Get communication IDs for user assignments
    const insertedCommunications = await queryInterface.sequelize.query(
      'SELECT id, targetType, targetValue FROM Communications ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Seed communication users
    const communicationUsers = [];
    
    insertedCommunications.forEach((comm, index) => {
      if (comm.targetType === 'ALL') {
        // Send to all users
        users.forEach(user => {
          communicationUsers.push({
            communicationId: comm.id,
            userId: user.id,
            isRead: Math.random() > 0.5,
            readAt: Math.random() > 0.5 ? new Date() : null,
            isDelivered: true,
            deliveredAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      } else if (comm.targetType === 'USER') {
        // Send to specific user
        const targetUserId = parseInt(comm.targetValue);
        if (users.some(u => u.id === targetUserId)) {
          communicationUsers.push({
            communicationId: comm.id,
            userId: targetUserId,
            isRead: false,
            readAt: null,
            isDelivered: true,
            deliveredAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } else if (comm.targetType === 'ROLE') {
        // Send to users with specific role (simplified - send to test user)
        communicationUsers.push({
          communicationId: comm.id,
          userId: users[1].id,
          isRead: Math.random() > 0.3,
          readAt: Math.random() > 0.3 ? new Date() : null,
          isDelivered: true,
          deliveredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    await queryInterface.bulkInsert('CommunicationUsers', communicationUsers, {});

    // Seed some user history records
    const userHistory = [
      {
        userId: users[0].id,
        action: 'LOGIN',
        description: 'User logged in successfully',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
        isSuccess: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        userId: users[1].id,
        action: 'LOGIN',
        description: 'User logged in successfully',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
        isSuccess: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        userId: users[1].id,
        action: 'PERFORMANCE_SUBMIT',
        description: 'Performance data submitted for Crime Investigation module',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
        isSuccess: true,
        metadata: JSON.stringify({
          moduleId: modules[0].id,
          topicId: topics[0].id,
          score: 85,
          maxScore: 100
        }),
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        userId: users[0].id,
        action: 'USER_CREATE',
        description: 'Created new user account',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
        isSuccess: true,
        metadata: JSON.stringify({
          createdUserId: users[1].id,
          roles: ['USER']
        }),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    await queryInterface.bulkInsert('UserHistory', userHistory, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserHistory', null, {});
    await queryInterface.bulkDelete('CommunicationUsers', null, {});
    await queryInterface.bulkDelete('Communications', null, {});
    await queryInterface.bulkDelete('PerformanceStatistics', null, {});
    await queryInterface.bulkDelete('SystemConfig', null, {});
  }
};