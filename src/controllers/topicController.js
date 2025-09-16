const express = require('express');
const router = express.Router();
const TopicService = require('../services/topicService');
const authMiddleware = require('../middleware/authMiddleware');
const { validateTopic, validatePagination } = require('../middleware/validationMiddleware');

// GET /api/topics - Get all topics with pagination
router.get('/', authMiddleware, validatePagination, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      search,
      moduleId,
      status 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search,
      moduleId,
      status
    };

    const result = await TopicService.getAllTopics(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Topics retrieved successfully',
      data: result.topics,
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
      message: 'Failed to retrieve topics',
      error: error.message
    });
  }
});

// GET /api/topics/:id - Get topic by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await TopicService.getTopicById(id);
    
    if (!topic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Topic retrieved successfully',
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve topic',
      error: error.message
    });
  }
});

// POST /api/topics - Create new topic
router.post('/', authMiddleware, validateTopic, async (req, res) => {
  try {
    const topicData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const topic = await TopicService.createTopic(topicData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Topic created successfully',
      data: topic
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Topic with this name already exists in this module'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create topic',
      error: error.message
    });
  }
});

// PUT /api/topics/:id - Update topic
router.put('/:id', authMiddleware, validateTopic, async (req, res) => {
  try {
    const { id } = req.params;
    const topicData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const topic = await TopicService.updateTopic(id, topicData);
    
    if (!topic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Topic updated successfully',
      data: topic
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Topic with this name already exists in this module'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update topic',
      error: error.message
    });
  }
});

// DELETE /api/topics/:id - Delete topic
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TopicService.deleteTopic(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete topic',
      error: error.message
    });
  }
});

// GET /api/topics/by-module/:moduleId - Get topics by module
router.get('/by-module/:moduleId', authMiddleware, validatePagination, async (req, res) => {
  try {
    const { moduleId } = req.params;
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

    const result = await TopicService.getTopicsByModule(moduleId, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Topics retrieved successfully',
      data: result.topics,
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
      message: 'Failed to retrieve topics',
      error: error.message
    });
  }
});

// GET /api/topics/:id/sub-topics - Get sub-topics by topic
router.get('/:id/sub-topics', authMiddleware, validatePagination, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    };

    const result = await TopicService.getSubTopicsByTopic(id, options);
    
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

// GET /api/topics/search/:searchTerm - Search topics
router.get('/search/:searchTerm', authMiddleware, validatePagination, async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 10, moduleId, status } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm,
      moduleId,
      status
    };

    const result = await TopicService.searchTopics(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Topics search completed',
      data: result.topics,
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
      message: 'Failed to search topics',
      error: error.message
    });
  }
});

// GET /api/topics/active - Get all active topics
router.get('/status/active', authMiddleware, async (req, res) => {
  try {
    const { moduleId } = req.query;
    const topics = await TopicService.getActiveTopics(moduleId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Active topics retrieved successfully',
      data: topics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active topics',
      error: error.message
    });
  }
});

// POST /api/topics/:id/activate - Activate topic
router.post('/:id/activate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await TopicService.activateTopic(id, req.user.id);
    
    if (!topic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Topic activated successfully',
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate topic',
      error: error.message
    });
  }
});

// POST /api/topics/:id/deactivate - Deactivate topic
router.post('/:id/deactivate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await TopicService.deactivateTopic(id, req.user.id);
    
    if (!topic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Topic deactivated successfully',
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate topic',
      error: error.message
    });
  }
});

// PUT /api/topics/:id/order - Update topic display order
router.put('/:id/order', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;
    
    if (typeof displayOrder !== 'number') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Display order must be a number'
      });
    }

    const topic = await TopicService.updateTopicOrder(id, displayOrder, req.user.id);
    
    if (!topic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Topic not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Topic order updated successfully',
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update topic order',
      error: error.message
    });
  }
});

// GET /api/topics/statistics - Get topic statistics
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const { moduleId } = req.query;
    const statistics = await TopicService.getTopicStatistics(moduleId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Topic statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve topic statistics',
      error: error.message
    });
  }
});

// POST /api/topics/:id/clone - Clone topic
router.post('/:id/clone', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, moduleId, description } = req.body;
    
    if (!name || !moduleId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Name and module ID are required for cloning'
      });
    }

    const clonedTopic = await TopicService.cloneTopic(id, {
      name,
      moduleId,
      description,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    if (!clonedTopic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Topic not found'
      });
    }

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Topic cloned successfully',
      data: clonedTopic
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Topic with this name already exists in the target module'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to clone topic',
      error: error.message
    });
  }
});

// PUT /api/topics/reorder - Reorder topics within a module
router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    const { moduleId, topicOrders } = req.body;
    
    if (!moduleId || !Array.isArray(topicOrders)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Module ID and topic orders array are required'
      });
    }

    const updatedTopics = await TopicService.reorderTopics(moduleId, topicOrders, req.user.id);
    
    res.json({
      status: 'SUCCESS',
      message: 'Topics reordered successfully',
      data: updatedTopics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to reorder topics',
      error: error.message
    });
  }
});

module.exports = router;