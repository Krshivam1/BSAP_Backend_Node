const { RoleMenu, RoleSubMenu, RolePermission } = require('../models');
const sequelize = require('../config/database');

class PermissionHandleService {
  
  // Get all permissions for a role
  static async getRolePermissions(roleId) {
    try {
      // Get menu permissions
      const menus = await RoleMenu.findAll({
        where: { roleId, active: true },
        attributes: ['menuId']
      });

      // Get sub-menu permissions
      const subMenus = await RoleSubMenu.findAll({
        where: { roleId, active: true },
        attributes: ['subMenuId']
      });

      // Get role permissions
      const rolePermissions = await RolePermission.findAll({
        where: { roleId, active: true },
        attributes: ['permissionId']
      });

      return {
        menu: menus.map(item => item.menuId),
        SubMenu: subMenus.map(item => item.subMenuId),
        RolePermission: rolePermissions.map(item => item.permissionId)
      };
    } catch (error) {
      console.error('Error in getRolePermissions:', error);
      throw error;
    }
  }

  // Set permissions for a role (delete existing and insert new)
  static async setRolePermissions(roleId, permissions) {
    const transaction = await sequelize.transaction();

    try {
      const { menu = [], SubMenu = [], RolePermission: rolePermissions = [] } = permissions;

      // Delete existing permissions for this role
      await Promise.all([
        RoleMenu.destroy({
          where: { roleId },
          transaction
        }),
        RoleSubMenu.destroy({
          where: { roleId },
          transaction
        }),
        RolePermission.destroy({
          where: { roleId },
          transaction
        })
      ]);

      // Prepare data for bulk insert
      const menuData = menu.map(menuId => ({
        roleId,
        menuId,
        active: true
      }));

      const subMenuData = SubMenu.map(subMenuId => ({
        roleId,
        subMenuId,
        active: true
      }));

      const rolePermissionData = rolePermissions.map(permissionId => ({
        roleId,
        permissionId,
        active: true
      }));

      // Insert new permissions
      const insertPromises = [];
      
      if (menuData.length > 0) {
        insertPromises.push(RoleMenu.bulkCreate(menuData, { transaction }));
      }
      
      if (subMenuData.length > 0) {
        insertPromises.push(RoleSubMenu.bulkCreate(subMenuData, { transaction }));
      }
      
      if (rolePermissionData.length > 0) {
        insertPromises.push(RolePermission.bulkCreate(rolePermissionData, { transaction }));
      }

      await Promise.all(insertPromises);

      await transaction.commit();

      // Return the updated permissions
      return await this.getRolePermissions(roleId);
    } catch (error) {
      await transaction.rollback();
      console.error('Error in setRolePermissions:', error);
      throw error;
    }
  }

  // Get permissions with details (including related data)
  static async getRolePermissionsWithDetails(roleId) {
    try {
      // Get menu permissions with menu details
      const menus = await RoleMenu.findAll({
        where: { roleId, active: true },
        include: [{
          association: 'menu',
          attributes: ['id', 'menuName', 'menuUrl']
        }]
      });

      // Get sub-menu permissions with sub-menu details
      const subMenus = await RoleSubMenu.findAll({
        where: { roleId, active: true },
        include: [{
          association: 'subMenu',
          attributes: ['id', 'menuName', 'menuUrl']
        }]
      });

      // Get role permissions with permission details
      const rolePermissions = await RolePermission.findAll({
        where: { roleId, active: true },
        include: [{
          association: 'permission',
          attributes: ['id', 'permissionName', 'description']
        }]
      });

      return {
        menus: menus.map(item => ({
          id: item.menuId,
          ...item.menu?.toJSON()
        })),
        subMenus: subMenus.map(item => ({
          id: item.subMenuId,
          ...item.subMenu?.toJSON()
        })),
        permissions: rolePermissions.map(item => ({
          id: item.permissionId,
          ...item.permission?.toJSON()
        }))
      };
    } catch (error) {
      console.error('Error in getRolePermissionsWithDetails:', error);
      throw error;
    }
  }

  // Check if role has specific permission
  static async hasPermission(roleId, permissionId) {
    try {
      const permission = await RolePermission.findOne({
        where: { roleId, permissionId, active: true }
      });
      
      return !!permission;
    } catch (error) {
      console.error('Error in hasPermission:', error);
      throw error;
    }
  }

  // Check if role has menu access
  static async hasMenuAccess(roleId, menuId) {
    try {
      const menuAccess = await RoleMenu.findOne({
        where: { roleId, menuId, active: true }
      });
      
      return !!menuAccess;
    } catch (error) {
      console.error('Error in hasMenuAccess:', error);
      throw error;
    }
  }

  // Check if role has sub-menu access
  static async hasSubMenuAccess(roleId, subMenuId) {
    try {
      const subMenuAccess = await RoleSubMenu.findOne({
        where: { roleId, subMenuId, active: true }
      });
      
      return !!subMenuAccess;
    } catch (error) {
      console.error('Error in hasSubMenuAccess:', error);
      throw error;
    }
  }
}

module.exports = PermissionHandleService;