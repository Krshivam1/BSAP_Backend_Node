const express = require('express');
const router = express.Router();
const { communicationService } = require('../services');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCommunicationCreate, validateMessageCreate } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/communications/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow documents, images, and other common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * @route GET /api/communications
 * @desc Get all communications with pagination and filtering
 * @access Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      active: req.query.active !== undefined ? req.query.active === 'true' : true
    };

    const communications = await communicationService.getAllCommunications(filters);

    res.json({
      status: 'SUCCESS',
      message: 'Communications retrieved successfully',
      data: communications
    });

  } catch (error) {
    logger.error('Error getting communications:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve communications',
      error: error.message
    });
  }
});

/**
 * @route GET /api/communications/user
 * @desc Get communications for current user
 * @access Private
 */
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const communications = await communicationService.getCommunicationsForUser(userId);

    res.json({
      status: 'SUCCESS',
      message: 'User communications retrieved successfully',
      data: communications
    });

  } catch (error) {
    logger.error('Error getting user communications:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve user communications',
      error: error.message
    });
  }
});

/**
 * @route GET /api/communications/:id
 * @desc Get communication by ID
 * @access Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const communication = await communicationService.getCommunicationById(parseInt(id));

    res.json({
      status: 'SUCCESS',
      message: 'Communication retrieved successfully',
      data: communication
    });

  } catch (error) {
    logger.error('Error getting communication:', error);
    const statusCode = error.message === 'Communication not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/communications/start
 * @desc Start new communication
 * @access Private
 */
router.post('/start', authMiddleware, upload.array('attachments', 5), validateCommunicationCreate, async (req, res) => {
  try {
    const { name, description, userIds, message } = req.body;
    const createdBy = req.user.id;

    // Parse userIds if it's a string
    let parsedUserIds = [];
    if (userIds) {
      parsedUserIds = typeof userIds === 'string' ? JSON.parse(userIds) : userIds;
    }

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      fileType: file.mimetype
    })) : [];

    const communicationData = {
      name,
      description,
      userIds: parsedUserIds,
      messageData: message ? {
        message,
        userIds: parsedUserIds,
        attachments
      } : null
    };

    const communication = await communicationService.createCommunication(communicationData, createdBy);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Communication started successfully',
      data: communication
    });

  } catch (error) {
    logger.error('Error starting communication:', error);
    const statusCode = error.message.includes('already exists') ? 409 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/communications/:id/reply
 * @desc Reply to communication
 * @access Private
 */
router.post('/:id/reply', authMiddleware, upload.array('attachments', 5), validateMessageCreate, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, userIds } = req.body;
    const createdBy = req.user.id;

    // Parse userIds if it's a string
    let parsedUserIds = [];
    if (userIds) {
      parsedUserIds = typeof userIds === 'string' ? JSON.parse(userIds) : userIds;
    }

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      fileType: file.mimetype
    })) : [];

    const messageData = {
      message,
      userIds: parsedUserIds,
      attachments
    };

    const createdMessage = await communicationService.createMessage(parseInt(id), messageData, createdBy);

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Reply sent successfully',
      data: createdMessage
    });

  } catch (error) {
    logger.error('Error replying to communication:', error);
    const statusCode = error.message === 'Communication not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/communications/:id
 * @desc Update communication
 * @access Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedBy = req.user.id;

    const communication = await communicationService.updateCommunication(
      parseInt(id), 
      updateData, 
      updatedBy
    );

    res.json({
      status: 'SUCCESS',
      message: 'Communication updated successfully',
      data: communication
    });

  } catch (error) {
    logger.error('Error updating communication:', error);
    const statusCode = error.message === 'Communication not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/communications/:id
 * @desc Delete communication (soft delete)
 * @access Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user.id;

    const result = await communicationService.deleteCommunication(parseInt(id), deletedBy);

    res.json({
      status: 'SUCCESS',
      message: result.message
    });

  } catch (error) {
    logger.error('Error deleting communication:', error);
    const statusCode = error.message === 'Communication not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route GET /api/communications/:id/messages
 * @desc Get messages for a communication
 * @access Private
 */
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const communication = await communicationService.getCommunicationById(parseInt(id));

    res.json({
      status: 'SUCCESS',
      message: 'Communication messages retrieved successfully',
      data: communication.messages || []
    });

  } catch (error) {
    logger.error('Error getting communication messages:', error);
    const statusCode = error.message === 'Communication not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route GET /api/communications/:id/users
 * @desc Get users in a communication
 * @access Private
 */
router.get('/:id/users', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const communication = await communicationService.getCommunicationById(parseInt(id));

    res.json({
      status: 'SUCCESS',
      message: 'Communication users retrieved successfully',
      data: communication.communicationUsers || []
    });

  } catch (error) {
    logger.error('Error getting communication users:', error);
    const statusCode = error.message === 'Communication not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route POST /api/communications/:id/users
 * @desc Add users to communication
 * @access Private
 */
router.post('/:id/users', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const addedBy = req.user.id;

    const result = await communicationService.addUsersToCommunnication(
      parseInt(id), 
      userIds, 
      addedBy
    );

    res.json({
      status: 'SUCCESS',
      message: result.message
    });

  } catch (error) {
    logger.error('Error adding users to communication:', error);
    const statusCode = error.message === 'Communication not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/communications/:id/users/:userId
 * @desc Remove user from communication
 * @access Private
 */
router.delete('/:id/users/:userId', authMiddleware, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const removedBy = req.user.id;

    const result = await communicationService.removeUserFromCommunication(
      parseInt(id), 
      parseInt(userId), 
      removedBy
    );

    res.json({
      status: 'SUCCESS',
      message: result.message
    });

  } catch (error) {
    logger.error('Error removing user from communication:', error);
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/communications/messages/:messageId/status
 * @desc Update message read status
 * @access Private
 */
router.put('/messages/:messageId/status', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['READ', 'UNREAD'].includes(status)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid status. Must be READ or UNREAD'
      });
    }

    const result = await communicationService.updateMessageStatus(
      parseInt(messageId), 
      userId, 
      status
    );

    res.json({
      status: 'SUCCESS',
      message: result.message
    });

  } catch (error) {
    logger.error('Error updating message status:', error);
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route GET /api/communications/:id/statistics
 * @desc Get communication statistics
 * @access Private
 */
router.get('/:id/statistics', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const statistics = await communicationService.getCommunicationStatistics(parseInt(id));

    res.json({
      status: 'SUCCESS',
      message: 'Communication statistics retrieved successfully',
      data: statistics
    });

  } catch (error) {
    logger.error('Error getting communication statistics:', error);
    const statusCode = error.message === 'Communication not found' ? 404 : 500;
    res.status(statusCode).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @route GET /api/communications/search/:searchTerm
 * @desc Search communications
 * @access Private
 */
router.get('/search/:searchTerm', authMiddleware, async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { userId } = req.query;

    const filters = {
      userId: userId ? parseInt(userId) : undefined
    };

    const communications = await communicationService.searchCommunications(searchTerm, filters);

    res.json({
      status: 'SUCCESS',
      message: 'Search completed successfully',
      data: communications
    });

  } catch (error) {
    logger.error('Error searching communications:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Search failed',
      error: error.message
    });
  }
});

/**
 * @route GET /api/communications/:id/update-status
 * @desc Get update status for communication and user
 * @access Private
 */
router.get('/:id/update-status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const statuses = await communicationService.getUpdateStatusByCommunicationAndUser(
      parseInt(id), 
      userId
    );

    res.json({
      status: 'SUCCESS',
      message: 'Update statuses retrieved successfully',
      data: statuses
    });

  } catch (error) {
    logger.error('Error getting update statuses:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve update statuses',
      error: error.message
    });
  }
});

module.exports = router;