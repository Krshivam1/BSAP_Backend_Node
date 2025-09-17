const { userService } = require('../services');
const logger = require('../utils/logger');

// Controller handlers for User operations

async function createUser(req, res) {
  try {
    const created = await userService.createUser(req.body, req.user.id);
    res.status(201).json({ status: 'SUCCESS', message: 'User created successfully', data: created });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(400).json({ status: 'ERROR', message: error.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await userService.getAllUsers(req.query);
    res.json({ status: 'SUCCESS', message: 'Users retrieved successfully', data: users });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch users', error: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const id = parseInt(req.params.id);
    // Allow self or admin roles
    const isSelf = req.user.id === id;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role?.roleName);
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ status: 'ERROR', message: 'Access denied' });
    }

    const user = await userService.getUserById(id);
    res.json({ status: 'SUCCESS', message: 'User retrieved successfully', data: user });
  } catch (error) {
    logger.error('Get user error:', error);
    const status = /not found/i.test(error.message) ? 404 : 500;
    res.status(status).json({ status: 'ERROR', message: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const id = parseInt(req.params.id);
    const isSelf = req.user.id === id;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role?.roleName);
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ status: 'ERROR', message: 'Access denied' });
    }

    const updated = await userService.updateUser(id, req.body, req.user.id);
    res.json({ status: 'SUCCESS', message: 'User updated successfully', data: updated });
  } catch (error) {
    logger.error('Update user error:', error);
    const status = /not found/i.test(error.message) ? 404 : 400;
    res.status(status).json({ status: 'ERROR', message: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (req.user.id === id) {
      return res.status(400).json({ status: 'ERROR', message: 'Cannot delete your own account' });
    }
    await userService.deleteUser(id, req.user.id);
    res.json({ status: 'SUCCESS', message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    const status = /not found/i.test(error.message) ? 404 : 400;
    res.status(status).json({ status: 'ERROR', message: error.message });
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
