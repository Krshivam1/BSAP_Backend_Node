const UserService = require('../services/userService');

// GET /api/users - Search and list users
async function search(req, res) {
  try {
    const { page = 1, limit = 10, status, search, sortBy, sortOrder, roleId, stateId } = req.query;
    
    console.log('User search request:', { page, limit, status, search, sortBy, sortOrder, roleId, stateId });

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: search || '',
      status,
      roleId: roleId ? parseInt(roleId) : undefined,
      stateId: stateId ? parseInt(stateId) : undefined,
      sortBy: sortBy || 'firstName',
      sortOrder: sortOrder || 'ASC' 
    };

    const result = await UserService.getAllUsers(options);
    
    res.json({
      status: 'SUCCESS',
      message: search ? 'Users search completed' : 'Users retrieved successfully',
      data: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to search users',
      error: error.message
    });
  }
}

// GET /api/users/:id - Get user by ID
async function detail(req, res) {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve user',
      error: error.message
    });
  }
}

// POST /api/users - Create new user
async function create(req, res) {
  try {
    const userData = {
      firstName: req.body.firstName || req.body.first_name,
      lastName: req.body.lastName || req.body.last_name,
      email: req.body.email,
      password: req.body.password,
      mobileNo: req.body.mobileNo || req.body.mobile_no,
      contactNo: req.body.contactNo || req.body.contact_no,
      userImage: req.body.userImage || req.body.user_image,
      stateId: req.body.stateId || req.body.state_id,
      rangeId: req.body.rangeId || req.body.range_id,
      districtId: req.body.districtId || req.body.district_id,
      roleId: req.body.roleId || req.body.role_id,
      joiningDate: req.body.joiningDate || req.body.joining_date,
      endDate: req.body.endDate || req.body.end_date,
      numberSubdivision: req.body.numberSubdivision || req.body.number_subdivision,
      numberCircle: req.body.numberCircle || req.body.number_circle,
      numberPs: req.body.numberPs || req.body.number_ps,
      numberOp: req.body.numberOp || req.body.number_op,
      active: req.body.active !== undefined ? req.body.active : true,
      createdBy: req.user?.id || 1,
      updatedBy: req.user?.id || 1
    };

    const user = await UserService.createUser(userData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'User with this email already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create user',
      error: error.message
    });
  }
}

// PUT /api/users/:id - Update user
async function update(req, res) {
  try {
    const { id } = req.params;
    
    const userData = {
      ...req.body,
      updatedBy: req.user?.id || 1
    };

    if (req.body.first_name) userData.firstName = req.body.first_name;
    if (req.body.last_name) userData.lastName = req.body.last_name;
    if (req.body.mobile_no) userData.mobileNo = req.body.mobile_no;
    if (req.body.contact_no) userData.contactNo = req.body.contact_no;
    if (req.body.user_image) userData.userImage = req.body.user_image;
    if (req.body.state_id) userData.stateId = req.body.state_id;
    if (req.body.range_id) userData.rangeId = req.body.range_id;
    if (req.body.district_id) userData.districtId = req.body.district_id;
    if (req.body.role_id) userData.roleId = req.body.role_id;
    if (req.body.joining_date) userData.joiningDate = req.body.joining_date;
    if (req.body.end_date) userData.endDate = req.body.end_date;
    if (req.body.number_subdivision) userData.numberSubdivision = req.body.number_subdivision;
    if (req.body.number_circle) userData.numberCircle = req.body.number_circle;
    if (req.body.number_ps) userData.numberPs = req.body.number_ps;
    if (req.body.number_op) userData.numberOp = req.body.number_op;

    const user = await UserService.updateUser(id, userData);
    
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'User with this email already exists'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update user',
      error: error.message
    });
  }
}

// DELETE /api/users/:id - Delete user
async function remove(req, res) {
  try {
    const { id } = req.params;
    const deleted = await UserService.deleteUser(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete user',
      error: error.message
    });
  }
}

// GET /api/users/active - Get active users
async function active(req, res) {
  try {
    const users = await UserService.getActiveUsers();
    
    res.json({
      status: 'SUCCESS',
      message: 'Active users retrieved successfully',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active users',
      error: error.message
    });
  }
}

// POST /api/users/:id/toggle-status - Toggle user status
async function toggleStatus(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const user = await UserService.toggleUserStatus(id, active);
    
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to toggle user status',
      error: error.message
    });
  }
}

// POST /api/users/:id/verify - Verify user
async function verify(req, res) {
  try {
    const { id } = req.params;
    const user = await UserService.verifyUser(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'User verified successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to verify user',
      error: error.message
    });
  }
}

// POST /api/users/:id/change-password - Change user password
async function changePassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'New password is required'
      });
    }

    const success = await UserService.updatePassword(id, newPassword);
    
    if (!success) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to change password',
      error: error.message
    });
  }
}

module.exports = {
  search,
  detail,
  create,
  update,
  remove,
  active,
  toggleStatus,
  verify,
  changePassword
};