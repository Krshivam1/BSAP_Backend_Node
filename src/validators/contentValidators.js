const Joi = require('joi');

// Module-specific validation schemas
const moduleValidation = {
  // Create module validation
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Module name must be at least 2 characters long',
        'string.max': 'Module name cannot exceed 100 characters',
        'any.required': 'Module name is required'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    icon: Joi.string()
      .max(50)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Icon cannot exceed 50 characters'
      }),
    route: Joi.string()
      .max(100)
      .pattern(/^\/[a-zA-Z0-9\-_\/]*$/)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Route cannot exceed 100 characters',
        'string.pattern.base': 'Route must start with / and contain only alphanumeric characters, hyphens, underscores, and forward slashes'
      }),
    displayOrder: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'Display order must be a number',
        'number.integer': 'Display order must be an integer',
        'number.positive': 'Display order must be positive'
      }),
    isActive: Joi.boolean()
      .optional()
      .default(true)
  }),

  // Update module validation
  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    description: Joi.string()
      .max(500)
      .optional()
      .allow(''),
    icon: Joi.string()
      .max(50)
      .optional()
      .allow(''),
    route: Joi.string()
      .max(100)
      .pattern(/^\/[a-zA-Z0-9\-_\/]*$/)
      .optional()
      .allow(''),
    displayOrder: Joi.number()
      .integer()
      .positive()
      .optional(),
    isActive: Joi.boolean().optional()
  }),

  // Reorder validation
  reorder: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          id: Joi.number().integer().positive().required(),
          displayOrder: Joi.number().integer().positive().required()
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one module order is required'
      })
  })
};

// Topic-specific validation schemas
const topicValidation = {
  // Create topic validation
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Topic name must be at least 2 characters long',
        'string.max': 'Topic name cannot exceed 100 characters',
        'any.required': 'Topic name is required'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    moduleId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Module ID must be a number',
        'number.integer': 'Module ID must be an integer',
        'number.positive': 'Module ID must be positive',
        'any.required': 'Module ID is required'
      }),
    displayOrder: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'Display order must be a number',
        'number.integer': 'Display order must be an integer',
        'number.positive': 'Display order must be positive'
      }),
    isActive: Joi.boolean()
      .optional()
      .default(true)
  }),

  // Update topic validation
  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    description: Joi.string()
      .max(500)
      .optional()
      .allow(''),
    moduleId: Joi.number()
      .integer()
      .positive()
      .optional(),
    displayOrder: Joi.number()
      .integer()
      .positive()
      .optional(),
    isActive: Joi.boolean().optional()
  }),

  // Copy topic validation
  copy: Joi.object({
    targetModuleId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Target module ID must be a number',
        'number.integer': 'Target module ID must be an integer',
        'number.positive': 'Target module ID must be positive',
        'any.required': 'Target module ID is required'
      }),
    copySubTopics: Joi.boolean()
      .optional()
      .default(true),
    copyQuestions: Joi.boolean()
      .optional()
      .default(true)
  })
};

// SubTopic-specific validation schemas
const subTopicValidation = {
  // Create subtopic validation
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Subtopic name must be at least 2 characters long',
        'string.max': 'Subtopic name cannot exceed 100 characters',
        'any.required': 'Subtopic name is required'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    topicId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Topic ID must be a number',
        'number.integer': 'Topic ID must be an integer',
        'number.positive': 'Topic ID must be positive',
        'any.required': 'Topic ID is required'
      }),
    displayOrder: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'Display order must be a number',
        'number.integer': 'Display order must be an integer',
        'number.positive': 'Display order must be positive'
      }),
    isActive: Joi.boolean()
      .optional()
      .default(true)
  }),

  // Update subtopic validation
  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    description: Joi.string()
      .max(500)
      .optional()
      .allow(''),
    topicId: Joi.number()
      .integer()
      .positive()
      .optional(),
    displayOrder: Joi.number()
      .integer()
      .positive()
      .optional(),
    isActive: Joi.boolean().optional()
  }),

  // Move subtopic validation
  move: Joi.object({
    targetTopicId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Target topic ID must be a number',
        'number.integer': 'Target topic ID must be an integer',
        'number.positive': 'Target topic ID must be positive',
        'any.required': 'Target topic ID is required'
      })
  })
};

// Question-specific validation schemas
const questionValidation = {
  // Create question validation
  create: Joi.object({
    question: Joi.string()
      .min(5)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Question must be at least 5 characters long',
        'string.max': 'Question cannot exceed 1000 characters',
        'any.required': 'Question is required'
      }),
    description: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    questionType: Joi.string()
      .valid('TEXT', 'NUMBER', 'BOOLEAN', 'MULTIPLE_CHOICE', 'RATING', 'SCALE')
      .optional()
      .default('TEXT')
      .messages({
        'any.only': 'Question type must be one of: TEXT, NUMBER, BOOLEAN, MULTIPLE_CHOICE, RATING, SCALE'
      }),
    maxScore: Joi.number()
      .positive()
      .max(1000)
      .optional()
      .default(100)
      .messages({
        'number.base': 'Max score must be a number',
        'number.positive': 'Max score must be positive',
        'number.max': 'Max score cannot exceed 1000'
      }),
    topicId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Topic ID must be a number',
        'number.integer': 'Topic ID must be an integer',
        'number.positive': 'Topic ID must be positive',
        'any.required': 'Topic ID is required'
      }),
    subTopicId: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'Subtopic ID must be a number',
        'number.integer': 'Subtopic ID must be an integer',
        'number.positive': 'Subtopic ID must be positive'
      }),
    options: Joi.when('questionType', {
      is: Joi.string().valid('MULTIPLE_CHOICE'),
      then: Joi.array()
        .items(Joi.string().min(1).max(200))
        .min(2)
        .max(10)
        .required()
        .messages({
          'array.min': 'Multiple choice questions must have at least 2 options',
          'array.max': 'Multiple choice questions cannot have more than 10 options'
        }),
      otherwise: Joi.forbidden()
    }),
    scaleMin: Joi.when('questionType', {
      is: Joi.string().valid('RATING', 'SCALE'),
      then: Joi.number().integer().min(0).max(10).optional().default(1),
      otherwise: Joi.forbidden()
    }),
    scaleMax: Joi.when('questionType', {
      is: Joi.string().valid('RATING', 'SCALE'),
      then: Joi.number().integer().min(2).max(100).optional().default(5),
      otherwise: Joi.forbidden()
    }),
    displayOrder: Joi.number()
      .integer()
      .positive()
      .optional(),
    isActive: Joi.boolean()
      .optional()
      .default(true)
  }),

  // Update question validation
  update: Joi.object({
    question: Joi.string()
      .min(5)
      .max(1000)
      .optional(),
    description: Joi.string()
      .max(1000)
      .optional()
      .allow(''),
    questionType: Joi.string()
      .valid('TEXT', 'NUMBER', 'BOOLEAN', 'MULTIPLE_CHOICE', 'RATING', 'SCALE')
      .optional(),
    maxScore: Joi.number()
      .positive()
      .max(1000)
      .optional(),
    topicId: Joi.number()
      .integer()
      .positive()
      .optional(),
    subTopicId: Joi.number()
      .integer()
      .positive()
      .optional(),
    options: Joi.when('questionType', {
      is: Joi.string().valid('MULTIPLE_CHOICE'),
      then: Joi.array()
        .items(Joi.string().min(1).max(200))
        .min(2)
        .max(10)
        .optional(),
      otherwise: Joi.forbidden()
    }),
    scaleMin: Joi.when('questionType', {
      is: Joi.string().valid('RATING', 'SCALE'),
      then: Joi.number().integer().min(0).max(10).optional(),
      otherwise: Joi.forbidden()
    }),
    scaleMax: Joi.when('questionType', {
      is: Joi.string().valid('RATING', 'SCALE'),
      then: Joi.number().integer().min(2).max(100).optional(),
      otherwise: Joi.forbidden()
    }),
    displayOrder: Joi.number()
      .integer()
      .positive()
      .optional(),
    isActive: Joi.boolean().optional()
  }),

  // Move question validation
  move: Joi.object({
    targetTopicId: Joi.number()
      .integer()
      .positive()
      .required(),
    targetSubTopicId: Joi.number()
      .integer()
      .positive()
      .optional()
  })
};

// Common search validation for content entities
const contentSearchValidation = Joi.object({
  search: Joi.string()
    .min(1)
    .max(100)
    .optional(),
  moduleId: Joi.number()
    .integer()
    .positive()
    .optional(),
  topicId: Joi.number()
    .integer()
    .positive()
    .optional(),
  subTopicId: Joi.number()
    .integer()
    .positive()
    .optional(),
  questionType: Joi.string()
    .valid('TEXT', 'NUMBER', 'BOOLEAN', 'MULTIPLE_CHOICE', 'RATING', 'SCALE')
    .optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string()
    .valid('name', 'question', 'displayOrder', 'createdAt', 'updatedAt')
    .optional()
    .default('displayOrder'),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .optional()
    .default('ASC'),
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
});

module.exports = {
  moduleValidation,
  topicValidation,
  subTopicValidation,
  questionValidation,
  contentSearchValidation
};