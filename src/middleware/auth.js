const jwt = require('jsonwebtoken');
const { User, Role, Permission, RolePermission } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Enhanced authenticate with permission check
const authenticateWithPermission = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // Get the current endpoint URL and method
    const method = req.method.toUpperCase();
    
    // Debug: log all URL components
    console.log('URL Components:', {
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path,
      routePath: req.route ? req.route.path : null
    });
    
    // Construct the URL more carefully
    let currentUrl = req.route ? req.route.path : req.path;
    const baseUrl = req.baseUrl || '';
    let fullUrl = baseUrl + currentUrl;
    
    // Clean up the URL: remove trailing slash, query parameters, and normalize
    fullUrl = fullUrl.replace(/\/$/, '').split('?')[0];
    
    // If fullUrl is empty or just baseUrl, use the original path
    if (!fullUrl || fullUrl === baseUrl) {
      fullUrl = req.originalUrl.split('?')[0].replace(/\/$/, '');
    }
    
    console.log('Final URL for permission check:', fullUrl);
    
    // Find permission for this endpoint
    // Try multiple URL variations for better matching
    const urlsToTry = [
      fullUrl,
      fullUrl + '/',
      fullUrl.replace(/\/$/, ''),
      req.originalUrl.split('?')[0],
      req.originalUrl.split('?')[0].replace(/\/$/, '')
    ];
    
    let permission = null;
    
    // First try exact matches with all URL variations
    for (const urlToTry of urlsToTry) {
      permission = await Permission.findOne({
        where: {
          permissionUrl: urlToTry,
          active: true
        }
      });
      
      if (permission) {
        console.log(`Exact match found: ${urlToTry} → ${permission.permissionName}`);
        break;
      }
    }

    // If no exact match found, try to match pattern (for dynamic routes like :id)
    if (!permission) {
      const allPermissions = await Permission.findAll({
        where: { active: true }
      });
      
      for (const perm of allPermissions) {
        // Convert route pattern to regex (e.g., /api/users/:id -> /api/users/[^/]+)
        const pattern = perm.permissionUrl.replace(/:[\w]+/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        
        // Try pattern matching against all URL variations
        for (const urlToTry of urlsToTry) {
          if (regex.test(urlToTry)) {
            permission = perm;
            console.log(`Pattern match found: ${urlToTry} matches ${perm.permissionUrl} → ${perm.permissionName}`);
            break;
          }
        }
        
        if (permission) break;
      }
    }

    if (!permission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. No permission found for ${method} ${fullUrl}`
      });
    }

    // Check if user's role has this permission
    const rolePermission = await RolePermission.findOne({
      where: {
        roleId: user.roleId,
        permissionId: permission.id,
        active: true
      }
    });

    if (!rolePermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${user.role.roleName}' does not have permission for '${permission.permissionName}'`
      });
    }

    req.user = user;
    req.permission = permission;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (roles.length && !roles.includes(req.user.role.roleName)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions'
      });
    }

    next();
  };
};

// Utility function to check if user has specific permission
const hasPermission = async (userId, permissionCode) => {
  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    if (!user || !user.active) {
      return false;
    }

    const permission = await Permission.findOne({
      where: {
        permissionCode: permissionCode,
        active: true
      }
    });

    if (!permission) {
      return false;
    }

    const rolePermission = await RolePermission.findOne({
      where: {
        roleId: user.roleId,
        permissionId: permission.id,
        active: true
      }
    });

    return !!rolePermission;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

// Middleware to check specific permission by code
const checkPermission = (permissionCode) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const userHasPermission = await hasPermission(req.user.id, permissionCode);
    
    if (!userHasPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Permission '${permissionCode}' required`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authenticateWithPermission,
  authorize,
  hasPermission,
  checkPermission
};