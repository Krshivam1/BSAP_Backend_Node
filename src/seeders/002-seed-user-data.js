'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed Roles
    const roles = [
      {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with full system access',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ADMIN',
        description: 'Administrator with management access',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'STATE_ADMIN',
        description: 'State level administrator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'DISTRICT_ADMIN',
        description: 'District level administrator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'RANGE_OFFICER',
        description: 'Range level officer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'USER',
        description: 'Regular user with basic access',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'AUDITOR',
        description: 'Auditor with read-only access',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Roles', roles, {});

    // Seed Permissions
    const permissions = [
      // User management permissions
      { name: 'USER_CREATE', description: 'Create users', resource: 'USER', action: 'CREATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'USER_READ', description: 'View users', resource: 'USER', action: 'READ', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'USER_UPDATE', description: 'Update users', resource: 'USER', action: 'UPDATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'USER_DELETE', description: 'Delete users', resource: 'USER', action: 'DELETE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Role management permissions
      { name: 'ROLE_CREATE', description: 'Create roles', resource: 'ROLE', action: 'CREATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'ROLE_READ', description: 'View roles', resource: 'ROLE', action: 'READ', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'ROLE_UPDATE', description: 'Update roles', resource: 'ROLE', action: 'UPDATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'ROLE_DELETE', description: 'Delete roles', resource: 'ROLE', action: 'DELETE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Geography management permissions
      { name: 'GEOGRAPHY_CREATE', description: 'Create geography entities', resource: 'GEOGRAPHY', action: 'CREATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'GEOGRAPHY_READ', description: 'View geography entities', resource: 'GEOGRAPHY', action: 'READ', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'GEOGRAPHY_UPDATE', description: 'Update geography entities', resource: 'GEOGRAPHY', action: 'UPDATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'GEOGRAPHY_DELETE', description: 'Delete geography entities', resource: 'GEOGRAPHY', action: 'DELETE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Content management permissions
      { name: 'CONTENT_CREATE', description: 'Create content', resource: 'CONTENT', action: 'CREATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'CONTENT_READ', description: 'View content', resource: 'CONTENT', action: 'READ', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'CONTENT_UPDATE', description: 'Update content', resource: 'CONTENT', action: 'UPDATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'CONTENT_DELETE', description: 'Delete content', resource: 'CONTENT', action: 'DELETE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Performance management permissions
      { name: 'PERFORMANCE_CREATE', description: 'Create performance records', resource: 'PERFORMANCE', action: 'CREATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'PERFORMANCE_READ', description: 'View performance records', resource: 'PERFORMANCE', action: 'READ', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'PERFORMANCE_UPDATE', description: 'Update performance records', resource: 'PERFORMANCE', action: 'UPDATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'PERFORMANCE_DELETE', description: 'Delete performance records', resource: 'PERFORMANCE', action: 'DELETE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'PERFORMANCE_REVIEW', description: 'Review performance records', resource: 'PERFORMANCE', action: 'REVIEW', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'PERFORMANCE_APPROVE', description: 'Approve performance records', resource: 'PERFORMANCE', action: 'APPROVE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Communication permissions
      { name: 'COMMUNICATION_CREATE', description: 'Create communications', resource: 'COMMUNICATION', action: 'CREATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'COMMUNICATION_READ', description: 'View communications', resource: 'COMMUNICATION', action: 'READ', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'COMMUNICATION_UPDATE', description: 'Update communications', resource: 'COMMUNICATION', action: 'UPDATE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'COMMUNICATION_DELETE', description: 'Delete communications', resource: 'COMMUNICATION', action: 'DELETE', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // System permissions
      { name: 'SYSTEM_CONFIG', description: 'Manage system configuration', resource: 'SYSTEM', action: 'CONFIG', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'SYSTEM_BACKUP', description: 'Manage system backup', resource: 'SYSTEM', action: 'BACKUP', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'SYSTEM_AUDIT', description: 'View system audit logs', resource: 'SYSTEM', action: 'AUDIT', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Report permissions
      { name: 'REPORT_VIEW', description: 'View reports', resource: 'REPORT', action: 'VIEW', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'REPORT_EXPORT', description: 'Export reports', resource: 'REPORT', action: 'EXPORT', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'REPORT_ADMIN', description: 'Manage reports', resource: 'REPORT', action: 'ADMIN', isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('Permissions', permissions, {});

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const users = [
      {
        username: 'admin',
        email: 'admin@performancestatistics.in',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+91-9999999999',
        designation: 'System Administrator',
        organization: 'Performance Statistics System',
        stateId: 11, // Karnataka
        districtId: null,
        rangeId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'testuser',
        email: 'test@performancestatistics.in',
        password: await bcrypt.hash('test123', 10),
        firstName: 'Test',
        lastName: 'User',
        phone: '+91-8888888888',
        designation: 'Test Officer',
        organization: 'Performance Statistics System',
        stateId: 11, // Karnataka
        districtId: 5, // Bengaluru Urban
        rangeId: 9, // Bengaluru Urban Range 1
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Users', users, {});

    // Get role and user IDs for role assignments
    const [superAdminRole, adminRole, userRole] = await queryInterface.sequelize.query(
      'SELECT id FROM Roles WHERE name IN (:roles) ORDER BY name',
      {
        replacements: { roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    const [adminUser, testUser] = await queryInterface.sequelize.query(
      'SELECT id FROM Users ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Assign roles to users
    const userRoles = [
      {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        isActive: true,
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: testUser.id,
        roleId: userRole.id,
        isActive: true,
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('UserRoles', userRoles, {});

    // Get all permission IDs
    const allPermissions = await queryInterface.sequelize.query(
      'SELECT id FROM Permissions ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Assign all permissions to SUPER_ADMIN role
    const superAdminPermissions = allPermissions.map(permission => ({
      roleId: superAdminRole.id,
      permissionId: permission.id,
      isActive: true,
      grantedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('RolePermissions', superAdminPermissions, {});

    // Assign basic permissions to USER role
    const basicPermissionNames = ['USER_READ', 'GEOGRAPHY_READ', 'CONTENT_READ', 'PERFORMANCE_CREATE', 'PERFORMANCE_READ', 'PERFORMANCE_UPDATE', 'COMMUNICATION_READ', 'REPORT_VIEW'];
    
    const basicPermissions = await queryInterface.sequelize.query(
      'SELECT id FROM Permissions WHERE name IN (:names)',
      {
        replacements: { names: basicPermissionNames },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    const userPermissions = basicPermissions.map(permission => ({
      roleId: userRole.id,
      permissionId: permission.id,
      isActive: true,
      grantedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('RolePermissions', userPermissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RolePermissions', null, {});
    await queryInterface.bulkDelete('UserRoles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Permissions', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};