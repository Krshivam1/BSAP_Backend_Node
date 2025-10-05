const QuestionService = require('../services/questionService');

// Utility: parse status query into boolean isActive
function parseIsActive(status) {
  if (status === undefined || status === null) return undefined;
  const s = String(status).toLowerCase();
  if (['active', 'true', '1', 'yes'].includes(s)) return true;
  if (['inactive', 'false', '0', 'no'].includes(s)) return false;
  return undefined;
}

// GET /api/questions - Get all questions with pagination
async function list(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'priority', 
      sortOrder = 'ASC',
      search,
      topicId,
      subTopicId,
      type,
      status,
      moduleId
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      search,
      topicId,
      subTopicId,
      moduleId,
      questionType: type,
      isActive: parseIsActive(status)
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
}

// GET /api/questions/:id - Get question by ID
async function detail(req, res) {
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
}

// POST /api/questions - Create new question
async function create(req, res) {
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
}

// PUT /api/questions/:id - Update question
async function update(req, res) {
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
}

// DELETE /api/questions/:id - Delete question
async function remove(req, res) {
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
}

// GET /api/questions/by-topic/:topicId - Get questions by topic
async function byTopic(req, res) {
  try {
    const { topicId } = req.params;
    const { 
      sortBy = 'priority', 
      sortOrder = 'ASC',
      type,
      status,
      excludeSubTopicQuestions = false
    } = req.query;
    
    const options = {
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      questionType: type,
      isActive: parseIsActive(status),
      excludeSubTopicQuestions: excludeSubTopicQuestions === 'true'
    };

    const result = await QuestionService.getQuestionsByTopic(topicId, options);
    
    res.json({
      status: 'SUCCESS',
      message: 'Questions retrieved successfully',
      data: result.questions,
      total: result.total
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve questions',
      error: error.message
    });
  }
}

// GET /api/questions/by-sub-topic/:subTopicId - Get questions by sub-topic
async function bySubTopic(req, res) {
  try {
    const { subTopicId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'priority', 
      sortOrder = 'ASC',
      type,
      status 
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      questionType: type,
      isActive: parseIsActive(status)
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
}

// GET /api/questions/by-type/:type - Get questions by type
async function byType(req, res) {
  try {
    const { type } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'priority', 
      sortOrder = 'ASC',
      topicId,
      subTopicId,
      moduleId,
      status
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
      topicId,
      subTopicId,
      moduleId,
      questionType: type,
      isActive: parseIsActive(status)
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
}

// GET /api/questions/search/:searchTerm - Search questions
async function search(req, res) {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 10, topicId, subTopicId, moduleId, type, status } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm,
      topicId,
      subTopicId,
      moduleId,
      questionType: type,
      isActive: parseIsActive(status)
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
}

// GET /api/questions/active - Get all active questions
async function active(req, res) {
  try {
    const { topicId, subTopicId, moduleId, type } = req.query;
    const questions = await QuestionService.getActiveQuestions(topicId, subTopicId, moduleId);
    const filtered = type ? questions.filter(q => q.questionType === type) : questions;
    
    res.json({
      status: 'SUCCESS',
      message: 'Active questions retrieved successfully',
      data: filtered
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve active questions',
      error: error.message
    });
  }
}

// POST /api/questions/:id/activate - Activate question
async function activate(req, res) {
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
}

// POST /api/questions/:id/deactivate - Deactivate question
async function deactivate(req, res) {
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
}

// PUT /api/questions/:id/order - Update question display order
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;
    
    if (typeof displayOrder !== 'number') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Display order must be a number'
      });
    }

    // Service doesn't have single updateOrder; reuse reorderQuestions for a single item
    const updated = await QuestionService.reorderQuestions([
      { id: parseInt(id, 10), displayOrder }
    ], req.user.id);
    const question = updated && updated.length ? updated.find(q => q.id === parseInt(id, 10)) : null;
    
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
}

// GET /api/questions/types - Get question types
async function types(req, res) {
  try {
    // Static list aligned with validation schema
    const types = ['TEXT', 'NUMBER', 'BOOLEAN', 'MULTIPLE_CHOICE', 'RATING'];
    
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
}

// GET /api/questions/statistics - Get question statistics
async function stats(req, res) {
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
}

// POST /api/questions/:id/clone - Clone question
async function clone(req, res) {
  try {
    const { id } = req.params;
    const { targetTopicId, targetSubTopicId = null } = req.body;
    if (!targetTopicId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'targetTopicId is required to clone question'
      });
    }

    const clonedQuestion = await QuestionService.copyQuestion(id, targetTopicId, targetSubTopicId, req.user.id);
    
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
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to clone question',
      error: error.message
    });
  }
}

// PUT /api/questions/reorder - Reorder questions within a sub-topic
async function reorder(req, res) {
  try {
    const { subTopicId } = req.body;
    // Accept both { questionOrders: [...] } and { items: [...] }
    const questionOrders = Array.isArray(req.body.questionOrders)
      ? req.body.questionOrders
      : Array.isArray(req.body.items) ? req.body.items : null;

    if (!Array.isArray(questionOrders) || questionOrders.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Question orders array is required'
      });
    }

    const updatedQuestions = await QuestionService.reorderQuestions(questionOrders, req.user.id);
    
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
}

// POST /api/questions/bulk-create - Bulk create questions
async function bulkCreate(req, res) {
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
}

// GET /api/questions/:id/performance-statistics - Get performance statistics for question
async function performanceStatistics(req, res) {
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
      startDate,
      endDate,
      userId
    };

    const stats = await QuestionService.getQuestionPerformanceStats(id, options);

    res.json({
      status: 'SUCCESS',
      message: 'Performance statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve performance statistics',
      error: error.message
    });
  }
}

// PUT /api/questions/:id/metadata - Update question metadata
async function updateMetadata(req, res) {
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
}

// GET /api/questions/topic/:topicId/formulas - Get questions with formulas for a topic
async function withFormulas(req, res) {
  try {
    const { topicId } = req.params;
    const questions = await QuestionService.getQuestionsWithFormulas(topicId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Questions with formulas retrieved successfully',
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve questions with formulas',
      error: error.message
    });
  }
}

// GET /api/questions/topic/:topicId/for-formula - Get questions for formula builder
async function forFormula(req, res) {
  try {
    const { topicId } = req.params;
    const { excludeQuestionId } = req.query;
    const questions = await QuestionService.getQuestionsForFormula(topicId, excludeQuestionId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Questions for formula retrieved successfully',
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve questions for formula',
      error: error.message
    });
  }
}

// GET /api/questions/topic/:topicId/form - Get questions for form generation
async function forForm(req, res) {
  try {
    const { topicId } = req.params;
    const { subTopicId } = req.query;
    const questions = await QuestionService.getQuestionsForForm(topicId, subTopicId);
    
    res.json({
      status: 'SUCCESS',
      message: 'Questions for form retrieved successfully',
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to retrieve questions for form',
      error: error.message
    });
  }
}

// POST /api/questions/validate-formula - Validate question formula
async function validateFormula(req, res) {
  try {
    const { formula, topicId } = req.body;
    
    if (!formula) {
      return res.json({
        status: 'SUCCESS',
        message: 'No formula to validate',
        data: { valid: true }
      });
    }

    const availableQuestions = await QuestionService.getQuestionsForFormula(topicId);
    const isValid = QuestionService.validateFormula(formula, availableQuestions);
    
    res.json({
      status: 'SUCCESS',
      message: 'Formula validation completed',
      data: { valid: isValid }
    });
  } catch (error) {
    res.status(400).json({
      status: 'ERROR',
      message: 'Formula validation failed',
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
  byTopic,
  bySubTopic,
  byType,
  search,
  active,
  activate,
  deactivate,
  updateOrder,
  types,
  stats,
  clone,
  reorder,
  bulkCreate,
  performanceStatistics,
  updateMetadata,
  withFormulas,
  forFormula,
  forForm,
  validateFormula
};
