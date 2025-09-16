const Joi = require('joi');

// District-specific validation schemas
const districtValidation = {
  // Create district validation
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'District name must be at least 2 characters long',
        'string.max': 'District name cannot exceed 100 characters',
        'any.required': 'District name is required'
      }),
    code: Joi.string()
      .min(2)
      .max(20)
      .pattern(/^[A-Z0-9_]+$/)
      .required()
      .messages({
        'string.min': 'District code must be at least 2 characters long',
        'string.max': 'District code cannot exceed 20 characters',
        'string.pattern.base': 'District code must contain only uppercase letters, numbers, and underscores',
        'any.required': 'District code is required'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    stateId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'State ID must be a number',
        'number.integer': 'State ID must be an integer',
        'number.positive': 'State ID must be positive',
        'any.required': 'State ID is required'
      }),
    isActive: Joi.boolean()
      .optional()
      .default(true)
  }),

  // Update district validation
  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'District name must be at least 2 characters long',
        'string.max': 'District name cannot exceed 100 characters'
      }),
    code: Joi.string()
      .min(2)
      .max(20)
      .pattern(/^[A-Z0-9_]+$/)
      .optional()
      .messages({
        'string.min': 'District code must be at least 2 characters long',
        'string.max': 'District code cannot exceed 20 characters',
        'string.pattern.base': 'District code must contain only uppercase letters, numbers, and underscores'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    stateId: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'State ID must be a number',
        'number.integer': 'State ID must be an integer',
        'number.positive': 'State ID must be positive'
      }),
    isActive: Joi.boolean().optional()
  }),

  // Search and filter validation
  search: Joi.object({
    search: Joi.string()
      .min(1)
      .max(100)
      .optional(),
    stateId: Joi.number()
      .integer()
      .positive()
      .optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string()
      .valid('name', 'code', 'createdAt', 'updatedAt')
      .optional()
      .default('name'),
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
  }),

  // Bulk operations validation
  bulkUpdate: Joi.object({
    updates: Joi.array()
      .items(
        Joi.object({
          id: Joi.number().integer().positive().required(),
          name: Joi.string().min(2).max(100).optional(),
          code: Joi.string().min(2).max(20).pattern(/^[A-Z0-9_]+$/).optional(),
          description: Joi.string().max(500).optional().allow(''),
          isActive: Joi.boolean().optional()
        })
      )
      .min(1)
      .max(50)
      .required()
      .messages({
        'array.min': 'At least one district update is required',
        'array.max': 'Maximum 50 districts can be updated at once'
      })
  }),

  // Statistics query validation
  statistics: Joi.object({
    stateId: Joi.number()
      .integer()
      .positive()
      .optional(),
    includeRanges: Joi.boolean()
      .optional()
      .default(false),
    includePoliceStations: Joi.boolean()
      .optional()
      .default(false)
  })
};

// Range-specific validation schemas
const rangeValidation = {
  // Create range validation
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Range name must be at least 2 characters long',
        'string.max': 'Range name cannot exceed 100 characters',
        'any.required': 'Range name is required'
      }),
    code: Joi.string()
      .min(2)
      .max(20)
      .pattern(/^[A-Z0-9_]+$/)
      .required()
      .messages({
        'string.min': 'Range code must be at least 2 characters long',
        'string.max': 'Range code cannot exceed 20 characters',
        'string.pattern.base': 'Range code must contain only uppercase letters, numbers, and underscores',
        'any.required': 'Range code is required'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    districtId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'District ID must be a number',
        'number.integer': 'District ID must be an integer',
        'number.positive': 'District ID must be positive',
        'any.required': 'District ID is required'
      }),
    isActive: Joi.boolean()
      .optional()
      .default(true)
  }),

  // Update range validation
  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    code: Joi.string()
      .min(2)
      .max(20)
      .pattern(/^[A-Z0-9_]+$/)
      .optional(),
    description: Joi.string()
      .max(500)
      .optional()
      .allow(''),
    districtId: Joi.number()
      .integer()
      .positive()
      .optional(),
    isActive: Joi.boolean().optional()
  }),

  // Search and filter validation
  search: Joi.object({
    search: Joi.string()
      .min(1)
      .max(100)
      .optional(),
    districtId: Joi.number()
      .integer()
      .positive()
      .optional(),
    stateId: Joi.number()
      .integer()
      .positive()
      .optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string()
      .valid('name', 'code', 'createdAt', 'updatedAt')
      .optional()
      .default('name'),
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
  })
};

module.exports = {
  districtValidation,
  rangeValidation
};