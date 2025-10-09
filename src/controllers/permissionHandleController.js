const PermissionHandleService = require('../services/permissionHandleService');

class PermissionHandleController {

  // GET /:roleId - Get all permissions for a role
  static async getRolePermissions(req, res) {
    try {
      const { roleId } = req.params;
      const { details } = req.query;

      if (!roleId || isNaN(parseInt(roleId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid role ID is required'
        });
      }

      let permissions;
      
      if (details === 'true') {
        permissions = await PermissionHandleService.getRolePermissionsWithDetails(parseInt(roleId));
      } else {
        permissions = await PermissionHandleService.getRolePermissions(parseInt(roleId));
      }

      res.status(200).json({
        success: true,
        message: 'Role permissions retrieved successfully',
        data: permissions
      });

    } catch (error) {
      console.error('Error in getRolePermissions controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve role permissions',
        error: error.message
      });
    }
  }

  // POST /:roleId - Set permissions for a role
  static async setRolePermissions(req, res) {
    try {
      const { roleId } = req.params;
      const permissions = req.body;

      if (!roleId || isNaN(parseInt(roleId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid role ID is required'
        });
      }

      // Validate request body structure
      if (!permissions || typeof permissions !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Permissions object is required'
        });
      }

      // Validate arrays if provided
      const { menu, SubMenu, RolePermission } = permissions;
      
      if (menu && !Array.isArray(menu)) {
        return res.status(400).json({
          success: false,
          message: 'Menu must be an array of IDs'
        });
      }

      if (SubMenu && !Array.isArray(SubMenu)) {
        return res.status(400).json({
          success: false,
          message: 'SubMenu must be an array of IDs'
        });
      }

      if (RolePermission && !Array.isArray(RolePermission)) {
        return res.status(400).json({
          success: false,
          message: 'RolePermission must be an array of IDs'
        });
      }

      // Validate that all array elements are valid integers
      const validateIds = (arr, fieldName) => {
        if (arr) {
          const invalidIds = arr.filter(id => !Number.isInteger(id) || id <= 0);
          if (invalidIds.length > 0) {
            throw new Error(`Invalid IDs in ${fieldName}: ${invalidIds.join(', ')}`);
          }
        }
      };

      validateIds(menu, 'menu');
      validateIds(SubMenu, 'SubMenu');
      validateIds(RolePermission, 'RolePermission');

      const updatedPermissions = await PermissionHandleService.setRolePermissions(
        parseInt(roleId), 
        permissions
      );

      res.status(200).json({
        success: true,
        message: 'Role permissions updated successfully',
        data: updatedPermissions
      });

    } catch (error) {
      console.error('Error in setRolePermissions controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role permissions',
        error: error.message
      });
    }
  }

  // GET /:roleId/check - Check specific permissions
  static async checkPermissions(req, res) {
    try {
      const { roleId } = req.params;
      const { permissionId, menuId, subMenuId } = req.query;

      if (!roleId || isNaN(parseInt(roleId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid role ID is required'
        });
      }

      const results = {};

      if (permissionId) {
        results.hasPermission = await PermissionHandleService.hasPermission(
          parseInt(roleId), 
          parseInt(permissionId)
        );
      }

      if (menuId) {
        results.hasMenuAccess = await PermissionHandleService.hasMenuAccess(
          parseInt(roleId), 
          parseInt(menuId)
        );
      }

      if (subMenuId) {
        results.hasSubMenuAccess = await PermissionHandleService.hasSubMenuAccess(
          parseInt(roleId), 
          parseInt(subMenuId)
        );
      }

      res.status(200).json({
        success: true,
        message: 'Permission check completed',
        data: results
      });

    } catch (error) {
      console.error('Error in checkPermissions controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check permissions',
        error: error.message
      });
    }
  }
}

module.exports = PermissionHandleController;