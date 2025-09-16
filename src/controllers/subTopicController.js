const express = require('express');
const router = express.Router();
const SubTopicService = require('../services/subTopicService');
const { authenticate } = require('../middleware/auth');
const { validateSubTopic, validatePagination } = require('../middleware/validationMiddleware');

// GET /api/sub-topics - Get all sub-topics with pagination
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      search,
      topicId,
      status 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search,
      topicId,
      status
    };

    const result = await SubTopicService.getAllSubTopics(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-topics retrieved successfully',
      data: result.subTopics,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve sub-topics',
      error: error.message
    });
  }
});

// GET /api/sub-topics/:id - Get sub-topic by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const subTopic = await SubTopicService.getSubTopicById(id);
    
    if (!subTopic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-topic retrieved successfully',
      data: subTopic
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve sub-topic',
      error: error.message
    });
  }
});

// POST /api/sub-topics - Create new sub-topic
router.post('/', authenticate, validateSubTopic, async (req, res) => {
  try {
    const subTopicData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const subTopic = await SubTopicService.createSubTopic(subTopicData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Sub-topic created successfully',
      data: subTopic
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Sub-topic with this name already exists in this topic'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create sub-topic',
      error: error.message
    });
  }
});

// PUT /api/sub-topics/:id - Update sub-topic
router.put('/:id', authenticate, validateSubTopic, async (req, res) => {
  try {
    const { id } = req.params;
    const subTopicData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const subTopic = await SubTopicService.updateSubTopic(id, subTopicData);
    
    if (!subTopic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-topic updated successfully',
      data: subTopic
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Sub-topic with this name already exists in this topic'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update sub-topic',
      error: error.message
    });
  }
});

// DELETE /api/sub-topics/:id - Delete sub-topic
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SubTopicService.deleteSubTopic(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-topic deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete sub-topic',
      error: error.message
    });
  }
});

// GET /api/sub-topics/by-topic/:topicId - Get sub-topics by topic
router.get('/by-topic/:topicId', authenticate, validatePagination, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'displayOrder', 
      sortOrder = 'ASC',
      status 
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      status
    };

    const result = await SubTopicService.getSubTopicsByTopic(topicId, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-topics retrieved successfully',
      data: result.subTopics,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve sub-topics',
      error: error.message
    });
  }
});

// GET /api/sub-topics/:id/questions - Get questions by sub-topic
router.get('/:id/questions', authenticate, validatePagination, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    };

    const result = await SubTopicService.getQuestionsBySubTopic(id, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Questions retrieved successfully',
      data: result.questions,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve questions',
      error: error.message
    });
  }
});

// GET /api/sub-topics/search/:searchTerm - Search sub-topics
router.get('/search/:searchTerm', authenticate, validatePagination, async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 10, topicId, status } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm,
      topicId,
      status
    };

    const result = await SubTopicService.searchSubTopics(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-topics search completed',
      data: result.subTopics,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to search sub-topics',
      error: error.message
    });
  }
});

// GET /api/sub-topics/active - Get all active sub-topics
router.get('/status/active', authenticate, async (req, res) => {
  try {
    const { topicId } = req.query;
    const subTopics = await SubTopicService.getActiveSubTopics(topicId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Active sub-topics retrieved successfully',
      data: subTopics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active sub-topics',
      error: error.message
    });
  }
});

// POST /api/sub-topics/:id/activate - Activate sub-topic
router.post('/:id/activate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const subTopic = await SubTopicService.activateSubTopic(id, req.user.id);
    
    if (!subTopic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-topic activated successfully',
      data: subTopic
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate sub-topic',
      error: error.message
    });
  }
});

// POST /api/sub-topics/:id/deactivate - Deactivate sub-topic
router.post('/:id/deactivate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const subTopic = await SubTopicService.deactivateSubTopic(id, req.user.id);
    
    if (!subTopic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-topic deactivated successfully',
      data: subTopic
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate sub-topic',
      error: error.message
    });
  }
});

// PUT /api/sub-topics/:id/order - Update sub-topic display order
router.put('/:id/order', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;
    
    if (typeof displayOrder !== 'number') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Display order must be a number'
      });
    }

    const subTopic = await SubTopicService.updateSubTopicOrder(id, displayOrder, req.user.id);
    
    if (!subTopic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Sub-topic order updated successfully',
      data: subTopic
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update sub-topic order',
      error: error.message
    });
  }
});

// GET /api/sub-topics/statistics - Get sub-topic statistics
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const { topicId } = req.query;
    const statistics = await SubTopicService.getSubTopicStatistics(topicId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-topic statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve sub-topic statistics',
      error: error.message
    });
  }
});

// POST /api/sub-topics/:id/clone - Clone sub-topic
router.post('/:id/clone', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, topicId, description } = req.body;
    
    if (!name || !topicId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Name and topic ID are required for cloning'
      });
    }

    const clonedSubTopic = await SubTopicService.cloneSubTopic(id, {
      name,
      topicId,
      description,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    if (!clonedSubTopic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-topic not found'
      });
    }

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Sub-topic cloned successfully',
      data: clonedSubTopic
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Sub-topic with this name already exists in the target topic'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to clone sub-topic',
      error: error.message
    });
  }
});

// PUT /api/sub-topics/reorder - Reorder sub-topics within a topic
router.put('/reorder', authenticate, async (req, res) => {
  try {
    const { topicId, subTopicOrders } = req.body;
    
    if (!topicId || !Array.isArray(subTopicOrders)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Topic ID and sub-topic orders array are required'
      });
    }

    const updatedSubTopics = await SubTopicService.reorderSubTopics(topicId, subTopicOrders, req.user.id);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-topics reordered successfully',
      data: updatedSubTopics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to reorder sub-topics',
      error: error.message
    });
  }
});

// GET /api/sub-topics/:id/performance-statistics - Get performance statistics for sub-topic
router.get('/:id/performance-statistics', authenticate, validatePagination, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate,
      userId 
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
      userId
    };

    const result = await SubTopicService.getPerformanceStatistics(id, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Performance statistics retrieved successfully',
      data: result.statistics,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve performance statistics',
      error: error.message
    });
  }
});

module.exports = router;
