const TopicService = require('../services/topicService');

// Utility: parse status query into boolean isActive
function parseIsActive(status) {
  if (status === undefined || status === null) return undefined;
  const s = String(status).toLowerCase();
  if (['active', 'true', '1', 'yes'].includes(s)) return true;
  if (['inactive', 'false', '0', 'no'].includes(s)) return false;
  return undefined;
}

// GET /api/topics - Get all topics with pagination
async function list(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'priority', 
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
      isActive: parseIsActive(status)
    };

    const result = await TopicService.getAllTopics(options);
    
    const totalPages = Math.ceil(result.total / options.limit);
    
    res.json({
      status: 'SUCCESS',
      message: 'Topics retrieved successfully',
      data: result.topics,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: totalPages,
        hasNextPage: options.page < totalPages,
        hasPrevPage: options.page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve topics',
      error: error.message
    });
  }
}

// GET /api/topics/:id - Get topic by ID
async function detail(req, res) {
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
}

// POST /api/topics - Create new topic
async function create(req, res) {
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
}

// PUT /api/topics/:id - Update topic
async function update(req, res) {
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
}

// DELETE /api/topics/:id - Delete topic
async function remove(req, res) {
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
}

// GET /api/topics/by-module/:moduleId - Get topics by module
async function byModule(req, res) {
  try {
    const { moduleId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'priority', 
      sortOrder = 'ASC',
      status 
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      isActive: parseIsActive(status)
    };

    const result = await TopicService.getTopicsByModule(moduleId, options);
    
    const totalPages = Math.ceil(result.total / options.limit);
    
    res.json({
      status: 'SUCCESS',
      message: 'Topics retrieved successfully',
      data: result.topics,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: totalPages,
        hasNextPage: options.page < totalPages,
        hasPrevPage: options.page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve topics',
      error: error.message
    });
  }
}

// GET /api/topics/:id/sub-topics - Get sub-topics by topic
async function subTopics(req, res) {
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
    
    const totalPages = Math.ceil(result.total / options.limit);
    
    res.json({
      status: 'SUCCESS',
      message: 'Sub-topics retrieved successfully',
      data: result.subTopics,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: totalPages,
        hasNextPage: options.page < totalPages,
        hasPrevPage: options.page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve sub-topics',
      error: error.message
    });
  }
}

// GET /api/topics/search/:searchTerm - Search topics
async function search(req, res) {
  try {
    const { searchTerm } = req.params;
  const { page = 1, limit = 10, moduleId, status } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm,
      moduleId,
      isActive: parseIsActive(status)
    };

    const result = await TopicService.searchTopics(options);
    
    const totalPages = Math.ceil(result.total / options.limit);
    
    res.json({
      status: 'SUCCESS',
      message: 'Topics search completed',
      data: result.topics,
      pagination: {
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: totalPages,
        hasNextPage: options.page < totalPages,
        hasPrevPage: options.page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to search topics',
      error: error.message
    });
  }
}

// GET /api/topics/active - Get all active topics
async function active(req, res) {
  try {
    const topics = await TopicService.getActiveTopics();
    
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
}

// POST /api/topics/:id/activate - Activate topic
async function activate(req, res) {
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
}

// POST /api/topics/:id/deactivate - Deactivate topic
async function deactivate(req, res) {
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
}

// PUT /api/topics/:id/order - Update topic display order
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    
    if (typeof priority !== 'number') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Priority must be a number'
      });
    }

    // Service doesn't provide single update order; reuse reorderTopics for a single item
    const updated = await TopicService.reorderTopics([
      { id: parseInt(id, 10), priority }
    ], req.user.id);
    const topic = updated && updated.length ? updated.find(t => t.id === parseInt(id, 10)) : null;
    
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
}

// GET /api/topics/statistics - Get topic statistics
async function stats(req, res) {
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
}

// POST /api/topics/:id/clone - Clone topic
async function clone(req, res) {
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
}

// PUT /api/topics/reorder - Reorder topics within a module
async function reorder(req, res) {
  try {
    // Accept both { topicOrders: [...] } and { items: [...] }
    const topicOrders = Array.isArray(req.body.topicOrders)
      ? req.body.topicOrders
      : Array.isArray(req.body.items) ? req.body.items : null;

    if (!Array.isArray(topicOrders) || topicOrders.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Topic orders array is required'
      });
    }

    const updatedTopics = await TopicService.reorderTopics(topicOrders, req.user.id);
    
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
}

// GET /api/topics/module/:moduleId - Get topics by module ID for form generation
async function byModuleForForm(req, res) {
  try {
    const { moduleId } = req.params;
    const topics = await TopicService.findTopicByModuleId(moduleId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Topics for module retrieved successfully',
      data: topics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve topics for module',
      error: error.message
    });
  }
}

// GET /api/topics/:id/form-config - Get topic with form configuration
async function formConfig(req, res) {
  try {
    const { id } = req.params;
    const topic = await TopicService.getTopicWithFormConfig(id);
    
    if (!topic) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Topic not found'
      });
    }
    
    res.json({
      status: 'SUCCESS',
      message: 'Topic form configuration retrieved successfully',
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve topic form configuration',
      error: error.message
    });
  }
}

module.exports = {
  list,
  detail,
  create,
  update,
  remove,
  byModule,
  subTopics,
  search,
  active,
  activate,
  deactivate,
  updateOrder,
  stats,
  clone,
  reorder,
  byModuleForForm,
  formConfig
};
