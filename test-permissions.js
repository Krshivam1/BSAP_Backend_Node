const { hasPermission } = require('./src/middleware/auth');
const { User, Role, Permission, RolePermission } = require('./src/models');

async function testPermissionSystem() {
  try {
    console.log('Testing Permission System...\n');

    // Test 1: Check if a user has a specific permission
    console.log('Test 1: Checking user permission...');
    const userId = 1; // Assuming admin user with ID 1
    const permissionCode = 'USER_VIEW_ALL';
    
    const hasUserViewPermission = await hasPermission(userId, permissionCode);
    console.log(`User ${userId} has ${permissionCode}: ${hasUserViewPermission}\n`);

    // Test 2: Get all permissions for a user
    console.log('Test 2: Getting all permissions for user...');
    const userWithPermissions = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'role',
        include: [{
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
          where: { active: true }
        }]
      }]
    });

    if (userWithPermissions && userWithPermissions.role && userWithPermissions.role.permissions) {
      console.log(`User ${userWithPermissions.firstName} ${userWithPermissions.lastName} (${userWithPermissions.role.roleName}) has ${userWithPermissions.role.permissions.length} permissions:`);
      userWithPermissions.role.permissions.slice(0, 5).forEach(perm => {
        console.log(`- ${perm.permissionName} (${perm.permissionCode}): ${perm.permissionUrl}`);
      });
      if (userWithPermissions.role.permissions.length > 5) {
        console.log(`... and ${userWithPermissions.role.permissions.length - 5} more permissions`);
      }
    }

    console.log('\nPermission system test completed successfully!');
  } catch (error) {
    console.error('Permission system test failed:', error.message);
  }
}

// Run the test
testPermissionSystem();