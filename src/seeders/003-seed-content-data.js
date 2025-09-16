'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed Modules
    const modules = [
      {
        name: 'Crime Investigation',
        description: 'Module for crime investigation management and tracking',
        icon: 'fas fa-search',
        route: '/crime-investigation',
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Traffic Management',
        description: 'Module for traffic violations and management',
        icon: 'fas fa-traffic-light',
        route: '/traffic-management',
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Law and Order',
        description: 'Module for law and order maintenance activities',
        icon: 'fas fa-gavel',
        route: '/law-order',
        displayOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Community Policing',
        description: 'Module for community engagement and policing activities',
        icon: 'fas fa-users',
        route: '/community-policing',
        displayOrder: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cyber Crime',
        description: 'Module for cyber crime investigation and prevention',
        icon: 'fas fa-shield-alt',
        route: '/cyber-crime',
        displayOrder: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Training and Development',
        description: 'Module for police training and skill development',
        icon: 'fas fa-graduation-cap',
        route: '/training',
        displayOrder: 6,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Modules', modules, {});

    // Get module IDs for topic seeding
    const insertedModules = await queryInterface.sequelize.query(
      'SELECT id, name FROM Modules ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Seed Topics
    const topics = [
      // Crime Investigation Topics
      {
        name: 'Crime Registration',
        description: 'FIR registration and case documentation',
        moduleId: insertedModules[0].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Evidence Collection',
        description: 'Physical and digital evidence collection procedures',
        moduleId: insertedModules[0].id,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Suspect Investigation',
        description: 'Suspect identification and interrogation',
        moduleId: insertedModules[0].id,
        displayOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Case Closure',
        description: 'Case completion and closure procedures',
        moduleId: insertedModules[0].id,
        displayOrder: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Traffic Management Topics
      {
        name: 'Traffic Violation Handling',
        description: 'Processing traffic violations and fines',
        moduleId: insertedModules[1].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Accident Investigation',
        description: 'Road accident investigation and reporting',
        moduleId: insertedModules[1].id,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Traffic Control',
        description: 'Traffic signal management and crowd control',
        moduleId: insertedModules[1].id,
        displayOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Law and Order Topics
      {
        name: 'Patrol Management',
        description: 'Police patrol scheduling and execution',
        moduleId: insertedModules[2].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Public Order Maintenance',
        description: 'Maintaining public order during events',
        moduleId: insertedModules[2].id,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Emergency Response',
        description: 'Emergency situation response procedures',
        moduleId: insertedModules[2].id,
        displayOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Community Policing Topics
      {
        name: 'Community Outreach',
        description: 'Community engagement and awareness programs',
        moduleId: insertedModules[3].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Citizen Feedback',
        description: 'Collecting and processing citizen feedback',
        moduleId: insertedModules[3].id,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Cyber Crime Topics
      {
        name: 'Digital Forensics',
        description: 'Digital evidence analysis and forensics',
        moduleId: insertedModules[4].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Online Fraud Investigation',
        description: 'Investigation of online fraud and scams',
        moduleId: insertedModules[4].id,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Training Topics
      {
        name: 'Physical Training',
        description: 'Physical fitness and combat training',
        moduleId: insertedModules[5].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Legal Training',
        description: 'Legal procedures and law training',
        moduleId: insertedModules[5].id,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Topics', topics, {});

    // Get topic IDs for subtopic and question seeding
    const insertedTopics = await queryInterface.sequelize.query(
      'SELECT id, name, moduleId FROM Topics ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Seed SubTopics (only for some topics)
    const subTopics = [
      // Crime Registration subtopics
      {
        name: 'FIR Documentation',
        description: 'Proper FIR documentation procedures',
        topicId: insertedTopics[0].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Case Classification',
        description: 'Crime classification and categorization',
        topicId: insertedTopics[0].id,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Evidence Collection subtopics
      {
        name: 'Physical Evidence',
        description: 'Collection and preservation of physical evidence',
        topicId: insertedTopics[1].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Digital Evidence',
        description: 'Digital evidence collection and chain of custody',
        topicId: insertedTopics[1].id,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Traffic Violation subtopics
      {
        name: 'Speeding Violations',
        description: 'Handling speeding violation cases',
        topicId: insertedTopics[4].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Parking Violations',
        description: 'Managing parking violation enforcement',
        topicId: insertedTopics[4].id,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('SubTopics', subTopics, {});

    // Get subtopic IDs for question seeding
    const insertedSubTopics = await queryInterface.sequelize.query(
      'SELECT id, name, topicId FROM SubTopics ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Seed Questions
    const questions = [
      // FIR Documentation questions
      {
        question: 'What is the standard procedure for registering an FIR?',
        description: 'Evaluate knowledge of FIR registration procedures',
        questionType: 'MULTIPLE_CHOICE',
        options: JSON.stringify([
          'Record complaint immediately without verification',
          'Verify complainant identity and record details accurately',
          'Delay registration until investigation',
          'Register only if case is serious'
        ]),
        maxScore: 10,
        topicId: insertedTopics[0].id,
        subTopicId: insertedSubTopics[0].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Rate the importance of accurate FIR documentation (1-5 scale)',
        description: 'Assess understanding of FIR documentation importance',
        questionType: 'RATING',
        scaleMin: 1,
        scaleMax: 5,
        maxScore: 5,
        topicId: insertedTopics[0].id,
        subTopicId: insertedSubTopics[0].id,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Case Classification questions
      {
        question: 'How many major crime categories are there in IPC?',
        description: 'Test knowledge of IPC crime categories',
        questionType: 'NUMBER',
        maxScore: 5,
        topicId: insertedTopics[0].id,
        subTopicId: insertedSubTopics[1].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Physical Evidence questions
      {
        question: 'What are the key steps in evidence collection?',
        description: 'Evaluate knowledge of evidence collection procedures',
        questionType: 'TEXT',
        maxScore: 15,
        topicId: insertedTopics[1].id,
        subTopicId: insertedSubTopics[2].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Digital Evidence questions
      {
        question: 'Is it mandatory to maintain chain of custody for digital evidence?',
        description: 'Test understanding of digital evidence protocols',
        questionType: 'BOOLEAN',
        maxScore: 5,
        topicId: insertedTopics[1].id,
        subTopicId: insertedSubTopics[3].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Speeding Violations questions
      {
        question: 'What is the standard fine for overspeeding in urban areas?',
        description: 'Test knowledge of traffic violation penalties',
        questionType: 'MULTIPLE_CHOICE',
        options: JSON.stringify([
          '₹500',
          '₹1000', 
          '₹2000',
          '₹5000'
        ]),
        maxScore: 5,
        topicId: insertedTopics[4].id,
        subTopicId: insertedSubTopics[4].id,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // General topic questions (without subtopics)
      {
        question: 'Describe the ideal patrol route planning strategy',
        description: 'Evaluate patrol management knowledge',
        questionType: 'TEXT',
        maxScore: 20,
        topicId: insertedTopics[7].id, // Patrol Management
        subTopicId: null,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Rate the effectiveness of community policing (1-10 scale)',
        description: 'Assess community policing understanding',
        questionType: 'SCALE',
        scaleMin: 1,
        scaleMax: 10,
        maxScore: 10,
        topicId: insertedTopics[10].id, // Community Outreach
        subTopicId: null,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Questions', questions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Questions', null, {});
    await queryInterface.bulkDelete('SubTopics', null, {});
    await queryInterface.bulkDelete('Topics', null, {});
    await queryInterface.bulkDelete('Modules', null, {});
  }
};