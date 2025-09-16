const express = require('express');
const router = express.Router();
const QuestionService = require('../services/questionService');
const { authenticate } = require('../middleware/auth');
const { validateQuestion, validatePagination } = require('../middleware/validationMiddleware');

// GET /api/questions - Get all questions with pagination
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      search,
      subTopicId,
      type,
      status 
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search,
      subTopicId,
      type,
      status
    };

    const result = await QuestionService.getAllQuestions(options);
    
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

// GET /api/questions/:id - Get question by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const question = await QuestionService.getQuestionById(id);
    
    if (!question) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Question not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Question retrieved successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve question',
      error: error.message
    });
  }
});

// POST /api/questions - Create new question
router.post('/', authenticate, validateQuestion, async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const question = await QuestionService.createQuestion(questionData);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Question with this name already exists in this sub-topic'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create question',
      error: error.message
    });
  }
});

// PUT /api/questions/:id - Update question
router.put('/:id', authenticate, validateQuestion, async (req, res) => {
  try {
    const { id } = req.params;
    const questionData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const question = await QuestionService.updateQuestion(id, questionData);
    
    if (!question) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Question not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Question with this name already exists in this sub-topic'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update question',
      error: error.message
    });
  }
});

// DELETE /api/questions/:id - Delete question
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await QuestionService.deleteQuestion(id);
    
    if (!deleted) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Question not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete question',
      error: error.message
    });
  }
});

// GET /api/questions/by-sub-topic/:subTopicId - Get questions by sub-topic
router.get('/by-sub-topic/:subTopicId', authenticate, validatePagination, async (req, res) => {
  try {
    const { subTopicId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'displayOrder', 
      sortOrder = 'ASC',
      type,
      status 
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      type,
      status
    };

    const result = await QuestionService.getQuestionsBySubTopic(subTopicId, options);
    
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

// GET /api/questions/by-type/:type - Get questions by type
router.get('/by-type/:type', authenticate, validatePagination, async (req, res) => {
  try {
    const { type } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      subTopicId 
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      subTopicId
    };

    const result = await QuestionService.getQuestionsByType(type, options);
    
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

// GET /api/questions/search/:searchTerm - Search questions
router.get('/search/:searchTerm', authenticate, validatePagination, async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 10, subTopicId, type, status } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm,
      subTopicId,
      type,
      status
    };

    const result = await QuestionService.searchQuestions(options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Questions search completed',
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
      message: 'Failed to search questions',
      error: error.message
    });
  }
});

// GET /api/questions/active - Get all active questions
router.get('/status/active', authenticate, async (req, res) => {
  try {
    const { subTopicId, type } = req.query;
    const questions = await QuestionService.getActiveQuestions(subTopicId, type);
    
    res.json({
      status: 'SUCCESS',
      message: 'Active questions retrieved successfully',
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active questions',
      error: error.message
    });
  }
});

// POST /api/questions/:id/activate - Activate question
router.post('/:id/activate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const question = await QuestionService.activateQuestion(id, req.user.id);
    
    if (!question) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Question not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Question activated successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to activate question',
      error: error.message
    });
  }
});

// POST /api/questions/:id/deactivate - Deactivate question
router.post('/:id/deactivate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const question = await QuestionService.deactivateQuestion(id, req.user.id);
    
    if (!question) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Question not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Question deactivated successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to deactivate question',
      error: error.message
    });
  }
});

// PUT /api/questions/:id/order - Update question display order
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

    const question = await QuestionService.updateQuestionOrder(id, displayOrder, req.user.id);
    
    if (!question) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Question not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Question order updated successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update question order',
      error: error.message
    });
  }
});

// GET /api/questions/types - Get question types
router.get('/config/types', authenticate, async (req, res) => {
  try {
    const types = await QuestionService.getQuestionTypes();
    
    res.json({
      status: 'SUCCESS',
      message: 'Question types retrieved successfully',
      data: types
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve question types',
      error: error.message
    });
  }
});

// GET /api/questions/statistics - Get question statistics
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const { subTopicId, type } = req.query;
    const statistics = await QuestionService.getQuestionStatistics(subTopicId, type);
    
    res.json({
      status: 'SUCCESS',
      message: 'Question statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve question statistics',
      error: error.message
    });
  }
});

// POST /api/questions/:id/clone - Clone question
router.post('/:id/clone', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subTopicId, description } = req.body;
    
    if (!name || !subTopicId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Name and sub-topic ID are required for cloning'
      });
    }

    const clonedQuestion = await QuestionService.cloneQuestion(id, {
      name,
      subTopicId,
      description,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    if (!clonedQuestion) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Question not found'
      });
    }

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Question cloned successfully',
      data: clonedQuestion
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Question with this name already exists in the target sub-topic'
      });
    }
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to clone question',
      error: error.message
    });
  }
});

// PUT /api/questions/reorder - Reorder questions within a sub-topic
router.put('/reorder', authenticate, async (req, res) => {
  try {
    const { subTopicId, questionOrders } = req.body;
    
    if (!subTopicId || !Array.isArray(questionOrders)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Sub-topic ID and question orders array are required'
      });
    }

    const updatedQuestions = await QuestionService.reorderQuestions(subTopicId, questionOrders, req.user.id);
    
    res.json({
      status: 'SUCCESS',
      message: 'Questions reordered successfully',
      data: updatedQuestions
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to reorder questions',
      error: error.message
    });
  }
});

// POST /api/questions/bulk-create - Bulk create questions
router.post('/bulk-create', authenticate, async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Questions array is required'
      });
    }

    // Add audit fields to each question
    const questionsWithAudit = questions.map(question => ({
      ...question,
      createdBy: req.user.id,
      updatedBy: req.user.id
    }));

    const createdQuestions = await QuestionService.bulkCreateQuestions(questionsWithAudit);
    
    res.status(201).json({
      status: 'SUCCESS',
      message: `${createdQuestions.length} questions created successfully`,
      data: createdQuestions
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to bulk create questions',
      error: error.message
    });
  }
});

// GET /api/questions/:id/performance-statistics - Get performance statistics for question
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

    const result = await QuestionService.getPerformanceStatistics(id, options);
    
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

// PUT /api/questions/:id/metadata - Update question metadata
router.put('/:id/metadata', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      difficulty, 
      estimatedTime, 
      tags, 
      category,
      priority 
    } = req.body;

    const question = await QuestionService.updateQuestionMetadata(id, {
      difficulty,
      estimatedTime,
      tags,
      category,
      priority,
      updatedBy: req.user.id
    });
    
    if (!question) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Question not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Question metadata updated successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update question metadata',
      error: error.message
    });
  }
});

module.exports = router;
