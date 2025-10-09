const express = require('express');
const router = express.Router();
const PermissionHandleController = require('../controllers/permissionHandleController');
const { authenticate , authenticateWithPermission } = require('../middleware/auth');


router.get('/:roleId', authenticate, PermissionHandleController.getRolePermissions);

router.post('/:roleId', authenticate, PermissionHandleController.setRolePermissions);


router.get('/:roleId/check', authenticate, PermissionHandleController.checkPermissions);

module.exports = router;