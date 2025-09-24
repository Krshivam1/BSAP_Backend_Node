const Joi = require('joi');
const logger = require('../utils/logger');

// Common validation schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  size: Joi.number().integer().min(1).max(100).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

const idSchema = Joi.number().integer().positive().required();

// Auth validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  mobileNo: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().min(6).required(),
  roleId: Joi.number().integer().positive().required(),
  stateId: Joi.number().integer().positive().optional(),
  rangeId: Joi.number().integer().positive().optional(),
  districtId: Joi.number().integer().positive().optional()
});

const passwordResetSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  newPassword: Joi.string().min(6).required()
});

const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required()
});

// User validation schemas
const userCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  mobileNo: Joi.string().pattern(/^[0-9]{10}$/).required(),
  roleId: Joi.number().integer().positive().required(),
  stateId: Joi.number().integer().positive().optional(),
  rangeId: Joi.number().integer().positive().optional(),
  districtId: Joi.number().integer().positive().optional(),
  password: Joi.string().min(6).optional()
});

const userUpdateSchema = Joi.object({
  email: Joi.string().email().optional(),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  mobileNo: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  roleId: Joi.number().integer().positive().optional(),
  stateId: Joi.number().integer().positive().optional(),
  rangeId: Joi.number().integer().positive().optional(),
  districtId: Joi.number().integer().positive().optional(),
  password: Joi.string().min(6).optional(),
  active: Joi.boolean().optional()
});

// Performance Statistics validation schemas
const statisticsCreateSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  questionId: Joi.number().integer().positive().required(),
  moduleId: Joi.number().integer().positive().required(),
  topicId: Joi.number().integer().positive().optional(),
  subTopicId: Joi.number().integer().positive().optional(),
  stateId: Joi.number().integer().positive().optional(),
  rangeId: Joi.number().integer().positive().optional(),
  districtId: Joi.number().integer().positive().optional(),
  value: Joi.number().required(),
  monthYear: Joi.string().required(),
  status: Joi.string().valid('INPROGRESS', 'SUCCESS').optional()
});

// Communication validation schemas
const communicationCreateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  userIds: Joi.alternatives().try(
    Joi.array().items(Joi.number().integer().positive()),
    Joi.string()
  ).optional(),
  message: Joi.string().min(1).optional()
});

const messageCreateSchema = Joi.object({
  message: Joi.string().min(1).required(),
  userIds: Joi.alternatives().try(
    Joi.array().items(Joi.number().integer().positive()),
    Joi.string()
  ).optional()
});

// District validation schemas
const districtCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  code: Joi.string().min(2).max(20).required(),
  description: Joi.string().max(500).optional(),
  stateId: Joi.number().integer().positive().required(),
  isActive: Joi.boolean().optional().default(true)
});

const districtUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  code: Joi.string().min(2).max(20).optional(),
  description: Joi.string().max(500).optional(),
  stateId: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional()
});

// Range validation schemas
const rangeCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  code: Joi.string().min(2).max(20).required(),
  description: Joi.string().max(500).optional(),
  districtId: Joi.number().integer().positive().required(),
  isActive: Joi.boolean().optional().default(true)
});

const rangeUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  code: Joi.string().min(2).max(20).optional(),
  description: Joi.string().max(500).optional(),
  districtId: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional()
});

// Module validation schemas
const moduleCreateSchema = Joi.object({
  moduleName: Joi.string().min(2).max(100).required().messages({
    'string.base': 'Module name must be a string',
    'string.empty': 'Module name is required',
    'string.min': 'Module name must be at least 2 characters long',
    'string.max': 'Module name cannot exceed 100 characters',
    'any.required': 'Module name is required'
  }),
  priority: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Priority must be a number',
    'number.integer': 'Priority must be an integer',
    'number.min': 'Priority must be at least 1'
  }),
  subMenuId: Joi.number().integer().positive().optional().messages({
    'number.base': 'Sub menu ID must be a number',
    'number.integer': 'Sub menu ID must be an integer',
    'number.positive': 'Sub menu ID must be positive'
  }),
  active: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'Active status must be true or false'
  }),
  createdBy: Joi.number().integer().positive().optional().messages({
    'number.base': 'Created by must be a number',
    'number.integer': 'Created by must be an integer',
    'number.positive': 'Created by must be positive'
  })
});

const moduleUpdateSchema = Joi.object({
  moduleName: Joi.string().min(2).max(100).optional().messages({
    'string.base': 'Module name must be a string',
    'string.min': 'Module name must be at least 2 characters long',
    'string.max': 'Module name cannot exceed 100 characters'
  }),
  priority: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Priority must be a number',
    'number.integer': 'Priority must be an integer',
    'number.min': 'Priority must be at least 1'
  }),
  subMenuId: Joi.number().integer().positive().optional().messages({
    'number.base': 'Sub menu ID must be a number',
    'number.integer': 'Sub menu ID must be an integer',
    'number.positive': 'Sub menu ID must be positive'
  }),
  active: Joi.boolean().optional().messages({
    'boolean.base': 'Active status must be true or false'
  }),
  updatedBy: Joi.number().integer().positive().optional().messages({
    'number.base': 'Updated by must be a number',
    'number.integer': 'Updated by must be an integer',
    'number.positive': 'Updated by must be positive'
  })
});

// Topic validation schemas
const topicCreateSchema = Joi.object({
  topicName: Joi.string().min(2).max(100).required().messages({
    'string.base': 'Topic name must be a string',
    'string.min': 'Topic name must be at least 2 characters long',
    'string.max': 'Topic name cannot exceed 100 characters',
    'any.required': 'Topic name is required'
  }),
  subName: Joi.string().max(500).optional().allow('').messages({
    'string.base': 'Sub name must be a string',
    'string.max': 'Sub name cannot exceed 500 characters'
  }),
  moduleId: Joi.number().integer().positive().required().messages({
    'number.base': 'Module ID must be a number',
    'number.integer': 'Module ID must be an integer',
    'number.positive': 'Module ID must be positive',
    'any.required': 'Module ID is required'
  }),
  priority: Joi.number().integer().min(0).optional().default(0).messages({
    'number.base': 'Priority must be a number',
    'number.integer': 'Priority must be an integer',
    'number.min': 'Priority must be at least 0'
  }),
  formType: Joi.string().valid('NORMAL', 'Q/ST', 'SPECIAL').optional().messages({
    'string.base': 'Form type must be a string',
    'any.only': 'Form type must be one of: NORMAL, Q/ST, SPECIAL'
  }),
  isShowCummulative: Joi.boolean().optional().default(false).messages({
    'boolean.base': 'Show cumulative must be true or false'
  }),
  isShowPrevious: Joi.boolean().optional().default(false).messages({
    'boolean.base': 'Show previous must be true or false'
  }),
  isStartJan: Joi.boolean().optional().default(false).messages({
    'boolean.base': 'Start Jan must be true or false'
  }),
  startMonth: Joi.number().integer().min(1).max(12).optional().default(1).messages({
    'number.base': 'Start month must be a number',
    'number.integer': 'Start month must be an integer',
    'number.min': 'Start month must be between 1 and 12',
    'number.max': 'Start month must be between 1 and 12'
  }),
  endMonth: Joi.number().integer().min(1).max(12).optional().default(12).messages({
    'number.base': 'End month must be a number',
    'number.integer': 'End month must be an integer',
    'number.min': 'End month must be between 1 and 12',
    'number.max': 'End month must be between 1 and 12'
  }),
  active: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'Active status must be true or false'
  }),
  createdBy: Joi.number().integer().positive().optional().messages({
    'number.base': 'Created by must be a number',
    'number.integer': 'Created by must be an integer',
    'number.positive': 'Created by must be positive'
  })
});

const topicUpdateSchema = Joi.object({
  topicName: Joi.string().min(2).max(100).optional().messages({
    'string.base': 'Topic name must be a string',
    'string.min': 'Topic name must be at least 2 characters long',
    'string.max': 'Topic name cannot exceed 100 characters'
  }),
  subName: Joi.string().max(500).optional().allow('').messages({
    'string.base': 'Sub name must be a string',
    'string.max': 'Sub name cannot exceed 500 characters'
  }),
  moduleId: Joi.number().integer().positive().optional().messages({
    'number.base': 'Module ID must be a number',
    'number.integer': 'Module ID must be an integer',
    'number.positive': 'Module ID must be positive'
  }),
  priority: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Priority must be a number',
    'number.integer': 'Priority must be an integer',
    'number.min': 'Priority must be at least 0'
  }),
  formType: Joi.string().valid('NORMAL', 'Q/ST', 'SPECIAL').optional().messages({
    'string.base': 'Form type must be a string',
    'any.only': 'Form type must be one of: NORMAL, Q/ST, SPECIAL'
  }),
  isShowCummulative: Joi.boolean().optional().messages({
    'boolean.base': 'Show cumulative must be true or false'
  }),
  isShowPrevious: Joi.boolean().optional().messages({
    'boolean.base': 'Show previous must be true or false'
  }),
  isStartJan: Joi.boolean().optional().messages({
    'boolean.base': 'Start Jan must be true or false'
  }),
  startMonth: Joi.number().integer().min(1).max(12).optional().messages({
    'number.base': 'Start month must be a number',
    'number.integer': 'Start month must be an integer',
    'number.min': 'Start month must be between 1 and 12',
    'number.max': 'Start month must be between 1 and 12'
  }),
  endMonth: Joi.number().integer().min(1).max(12).optional().messages({
    'number.base': 'End month must be a number',
    'number.integer': 'End month must be an integer',
    'number.min': 'End month must be between 1 and 12',
    'number.max': 'End month must be between 1 and 12'
  }),
  active: Joi.boolean().optional().messages({
    'boolean.base': 'Active status must be true or false'
  }),
  updatedBy: Joi.number().integer().positive().optional().messages({
    'number.base': 'Updated by must be a number',
    'number.integer': 'Updated by must be an integer',
    'number.positive': 'Updated by must be positive'
  })
});

// SubTopic validation schemas
const subTopicCreateSchema = Joi.object({
  subTopicName: Joi.string().min(2).max(100).required(),
  topicId: Joi.number().integer().positive().required(),
  priority: Joi.number().integer().positive().optional(),
  active: Joi.boolean().optional().default(true)
});

const subTopicUpdateSchema = Joi.object({
  subTopicName: Joi.string().min(2).max(100).optional(),
  topicId: Joi.number().integer().positive().optional(),
  priority: Joi.number().integer().positive().optional(),
  active: Joi.boolean().optional()
});

// Question validation schemas
const questionCreateSchema = Joi.object({
  question: Joi.string().min(5).max(1000).required(),
  description: Joi.string().max(1000).optional(),
  questionType: Joi.string().valid('TEXT', 'NUMBER', 'BOOLEAN', 'MULTIPLE_CHOICE', 'RATING').optional().default('TEXT'),
  maxScore: Joi.number().positive().optional().default(100),
  topicId: Joi.number().integer().positive().required(),
  subTopicId: Joi.number().integer().positive().optional(),
  displayOrder: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional().default(true)
});

const questionUpdateSchema = Joi.object({
  question: Joi.string().min(5).max(1000).optional(),
  description: Joi.string().max(1000).optional(),
  questionType: Joi.string().valid('TEXT', 'NUMBER', 'BOOLEAN', 'MULTIPLE_CHOICE', 'RATING').optional(),
  maxScore: Joi.number().positive().optional(),
  topicId: Joi.number().integer().positive().optional(),
  subTopicId: Joi.number().integer().positive().optional(),
  displayOrder: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional()
});

// Bulk operations validation schemas
const bulkUpdateSchema = Joi.object({
  updates: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().required()
    }).unknown(true)
  ).min(1).required()
});

const reorderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().required(),
      displayOrder: Joi.number().integer().positive().required()
    })
  ).min(1).required()
});

// Search and filter validation schemas
const searchSchema = Joi.object({
  search: Joi.string().min(1).max(100).optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional().default('ASC'),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10)
});

// CID Crime Data validation schemas
const crimeDataCreateSchema = Joi.object({
  firNumber: Joi.string().required(),
  crimeNumber: Joi.string().optional(),
  categoryId: Joi.number().integer().positive().required(),
  categoryTypeId: Joi.number().integer().positive().optional(),
  modusId: Joi.number().integer().positive().optional(),
  districtId: Joi.number().integer().positive().required(),
  policeStationId: Joi.number().integer().positive().optional(),
  subDivisionId: Joi.number().integer().positive().optional(),
  dateOfOccurrence: Joi.date().required(),
  timeOfOccurrence: Joi.string().optional(),
  placeOfOccurrence: Joi.string().required(),
  briefFacts: Joi.string().optional(),
  victims: Joi.array().items(Joi.object()).optional(),
  accused: Joi.array().items(Joi.object()).optional(),
  deceased: Joi.array().items(Joi.object()).optional()
});

const crimeDataUpdateSchema = Joi.object({
  firNumber: Joi.string().optional(),
  crimeNumber: Joi.string().optional(),
  categoryId: Joi.number().integer().positive().optional(),
  categoryTypeId: Joi.number().integer().positive().optional(),
  modusId: Joi.number().integer().positive().optional(),
  districtId: Joi.number().integer().positive().optional(),
  policeStationId: Joi.number().integer().positive().optional(),
  subDivisionId: Joi.number().integer().positive().optional(),
  dateOfOccurrence: Joi.date().optional(),
  timeOfOccurrence: Joi.string().optional(),
  placeOfOccurrence: Joi.string().optional(),
  briefFacts: Joi.string().optional()
});

// Generic validation middleware factory
const createValidationMiddleware = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : 
                 source === 'params' ? req.params : req.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
      errors: {
        wrap: {
          label: ''
        }
      }
    });

    if (error) {
      const errorDetails = error.details.map(detail => {
        let message = detail.message;
        
        // Custom error messages for common validation types
        if (detail.type === 'any.required') {
          message = `${detail.path.join('.')} is required`;
        } else if (detail.type === 'string.min') {
          message = `${detail.path.join('.')} must be at least ${detail.context.limit} characters long`;
        } else if (detail.type === 'string.max') {
          message = `${detail.path.join('.')} cannot exceed ${detail.context.limit} characters`;
        } else if (detail.type === 'string.email') {
          message = `${detail.path.join('.')} must be a valid email address`;
        } else if (detail.type === 'number.positive') {
          message = `${detail.path.join('.')} must be a positive number`;
        } else if (detail.type === 'number.integer') {
          message = `${detail.path.join('.')} must be an integer`;
        } else if (detail.type === 'boolean.base') {
          message = `${detail.path.join('.')} must be true or false`;
        }

        return {
          field: detail.path.join('.'),
          message: message,
          type: detail.type
        };
      });

      logger.warn('Validation error:', {
        source,
        errors: errorDetails,
        data: JSON.stringify(data)
      });
      
      return res.status(400).json({
        status: 'ERROR',
        message: 'Validation failed. Please check the provided data.',
        errors: errorDetails,
        timestamp: new Date().toISOString()
      });
    }

    // Replace the original data with validated data
    if (source === 'query') {
      req.query = value;
    } else if (source === 'params') {
      req.params = value;
    } else {
      req.body = value;
    }

    next();
  };
};

// Export validation middleware functions
module.exports = {
  // Common validations
  validatePagination: createValidationMiddleware(paginationSchema, 'query'),
  validateId: createValidationMiddleware(Joi.object({ id: idSchema }), 'params'),
  validateSearch: createValidationMiddleware(searchSchema, 'query'),

  // Auth validations
  validateLogin: createValidationMiddleware(loginSchema),
  validateSignup: createValidationMiddleware(signupSchema),
  validatePasswordReset: createValidationMiddleware(passwordResetSchema),
  validateOTP: createValidationMiddleware(otpSchema),

  // User validations
  validateUserCreate: createValidationMiddleware(userCreateSchema),
  validateUserUpdate: createValidationMiddleware(userUpdateSchema),

  // District validations
  validateDistrictCreate: createValidationMiddleware(districtCreateSchema),
  validateDistrictUpdate: createValidationMiddleware(districtUpdateSchema),

  // Range validations
  validateRangeCreate: createValidationMiddleware(rangeCreateSchema),
  validateRangeUpdate: createValidationMiddleware(rangeUpdateSchema),

  // Module validations
  validateModuleCreate: createValidationMiddleware(moduleCreateSchema),
  validateModuleUpdate: createValidationMiddleware(moduleUpdateSchema),

  // Topic validations
  validateTopicCreate: createValidationMiddleware(topicCreateSchema),
  validateTopicUpdate: createValidationMiddleware(topicUpdateSchema),

  // SubTopic validations
  validateSubTopicCreate: createValidationMiddleware(subTopicCreateSchema),
  validateSubTopicUpdate: createValidationMiddleware(subTopicUpdateSchema),

  // Question validations
  validateQuestionCreate: createValidationMiddleware(questionCreateSchema),
  validateQuestionUpdate: createValidationMiddleware(questionUpdateSchema),

  // Bulk operations validations
  validateBulkUpdate: createValidationMiddleware(bulkUpdateSchema),
  validateReorder: createValidationMiddleware(reorderSchema),

  // Performance Statistics validations
  validateStatisticsCreate: createValidationMiddleware(statisticsCreateSchema),

  // Communication validations
  validateCommunicationCreate: createValidationMiddleware(communicationCreateSchema),
  validateMessageCreate: createValidationMiddleware(messageCreateSchema),

  // CID Crime Data validations
  validateCrimeDataCreate: createValidationMiddleware(crimeDataCreateSchema),
  validateCrimeDataUpdate: createValidationMiddleware(crimeDataUpdateSchema),

  // Custom validation functions
  validateArrayOfIds: (fieldName) => {
    return (req, res, next) => {
      const ids = req.body[fieldName];
      
      if (ids && Array.isArray(ids)) {
        const schema = Joi.array().items(Joi.number().integer().positive()).min(1);
        const { error } = schema.validate(ids);
        
        if (error) {
          return res.status(400).json({
            status: 'ERROR',
            message: `Invalid ${fieldName}: ${error.details[0].message}`
          });
        }
      }
      
      next();
    };
  },

  validateDateRange: (req, res, next) => {
    const { dateFrom, dateTo } = req.query;
    
    if (dateFrom && dateTo) {
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Invalid date format'
        });
      }
      
      if (startDate > endDate) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Start date cannot be greater than end date'
        });
      }
    }
    
    next();
  },

  validateMonthYear: (req, res, next) => {
    const { monthYear } = req.body;
    
    if (monthYear) {
      const monthYearPattern = /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-\d{4}$/;
      
      if (!monthYearPattern.test(monthYear)) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Invalid month-year format. Expected format: MMM-YYYY (e.g., JAN-2023)'
        });
      }
    }
    
    next();
  },

  // Business rule validations
  validateUniqueCode: (modelName, codeField = 'code', scopeField = null) => {
    return async (req, res, next) => {
      try {
        const { [codeField]: code } = req.body;
        const { id } = req.params;
        
        if (!code) return next();

        const Model = require(`../models/${modelName}`);
        const whereClause = { [codeField]: code };
        
        // Add scope validation (e.g., district code unique within state)
        if (scopeField && req.body[scopeField]) {
          whereClause[scopeField] = req.body[scopeField];
        }
        
        // Exclude current record for updates
        if (id) {
          whereClause.id = { [require('sequelize').Op.ne]: id };
        }
        
        const existingRecord = await Model.findOne({ where: whereClause });
        
        if (existingRecord) {
          return res.status(400).json({
            status: 'ERROR',
            message: `${codeField} already exists`
          });
        }
        
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  validateUniqueName: (modelName, nameField = 'name', scopeField = null) => {
    return async (req, res, next) => {
      try {
        const { [nameField]: name } = req.body;
        const { id } = req.params;
        
        if (!name) return next();

        const Model = require(`../models/${modelName}`);
        const whereClause = { [nameField]: name };
        
        // Add scope validation (e.g., topic name unique within module)
        if (scopeField && req.body[scopeField]) {
          whereClause[scopeField] = req.body[scopeField];
        }
        
        // Exclude current record for updates
        if (id) {
          whereClause.id = { [require('sequelize').Op.ne]: id };
        }
        
        const existingRecord = await Model.findOne({ where: whereClause });
        
        if (existingRecord) {
          return res.status(400).json({
            status: 'ERROR',
            message: `A record with this ${nameField.replace(/([A-Z])/g, ' $1').toLowerCase()} already exists`,
            field: nameField,
            timestamp: new Date().toISOString()
          });
        }
        
        next();
      } catch (error) {
        logger.error('Error in validateUniqueName middleware:', error);
        return res.status(500).json({
          status: 'ERROR',
          message: 'Internal server error during validation',
          timestamp: new Date().toISOString()
        });
      }
    };
  },

  // Specific validation for module name uniqueness
  validateUniqueModuleName: async (req, res, next) => {
    try {
      const { moduleName } = req.body;
      const { id } = req.params;
      
      if (!moduleName) return next();

      const Module = require('../models/Module');
      const whereClause = { moduleName };
      
      // Exclude current record for updates
      if (id) {
        whereClause.id = { [require('sequelize').Op.ne]: id };
      }
      
      const existingModule = await Module.findOne({ where: whereClause });
      
      if (existingModule) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'A module with this name already exists',
          field: 'moduleName',
          timestamp: new Date().toISOString()
        });
      }
      
      next();
    } catch (error) {
      logger.error('Error in validateUniqueModuleName middleware:', error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Internal server error during module name validation',
        timestamp: new Date().toISOString()
      });
    }
  },

  validateParentExists: (parentModel, parentField) => {
    return async (req, res, next) => {
      try {
        const parentId = req.body[parentField];
        
        if (!parentId) return next();

        const ParentModel = require(`../models/${parentModel}`);
        const parent = await ParentModel.findByPk(parentId);
        
        if (!parent) {
          return res.status(400).json({
            status: 'ERROR',
            message: `${parentModel} not found`
          });
        }
        
        if (parent.isActive === false) {
          return res.status(400).json({
            status: 'ERROR',
            message: `${parentModel} is not active`
          });
        }
        
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  validateHierarchy: (childField, parentField) => {
    return async (req, res, next) => {
      try {
        const childId = req.body[childField];
        const parentId = req.body[parentField];
        
        if (!childId || !parentId) return next();

        // Prevent circular references
        if (childId === parentId) {
          return res.status(400).json({
            status: 'ERROR',
            message: 'Circular reference detected'
          });
        }
        
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  validateDisplayOrder: (modelName, scopeField = null) => {
    return async (req, res, next) => {
      try {
        const { displayOrder } = req.body;
        const { id } = req.params;
        
        if (!displayOrder) return next();

        const Model = require(`../models/${modelName}`);
        const whereClause = { displayOrder };
        
        // Add scope validation (e.g., display order within same module/topic)
        if (scopeField && req.body[scopeField]) {
          whereClause[scopeField] = req.body[scopeField];
        }
        
        // Exclude current record for updates
        if (id) {
          whereClause.id = { [require('sequelize').Op.ne]: id };
        }
        
        const existingRecord = await Model.findOne({ where: whereClause });
        
        if (existingRecord) {
          return res.status(400).json({
            status: 'ERROR',
            message: 'Display order already exists'
          });
        }
        
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  validateFileUpload: (allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
    return (req, res, next) => {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      for (const file of req.files) {
        // Check file size
        if (file.size > maxSize) {
          return res.status(400).json({
            status: 'ERROR',
            message: `File ${file.originalname} exceeds maximum size of ${maxSize / (1024 * 1024)}MB`
          });
        }

        // Check file type
        if (allowedTypes.length > 0) {
          const fileExtension = file.originalname.split('.').pop().toLowerCase();
          if (!allowedTypes.includes(fileExtension)) {
            return res.status(400).json({
              status: 'ERROR',
              message: `File type ${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
            });
          }
        }
      }

      next();
    };
  },

  // Sanitization middleware
  sanitizeInput: (req, res, next) => {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Basic XSS prevention
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      sanitizeObject(req.query);
    }

    next();
  }
};