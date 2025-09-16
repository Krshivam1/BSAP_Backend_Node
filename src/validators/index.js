const { districtValidation, rangeValidation } = require('./geographyValidators');
const { 
  moduleValidation, 
  topicValidation, 
  subTopicValidation, 
  questionValidation,
  contentSearchValidation 
} = require('./contentValidators');

// Create validation middleware factory
const createValidationMiddleware = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : 
                 source === 'params' ? req.params : req.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      
      return res.status(400).json({
        status: 'ERROR',
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
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

// Enhanced validation middleware with all schemas
module.exports = {
  // District validations
  validateDistrictCreate: createValidationMiddleware(districtValidation.create),
  validateDistrictUpdate: createValidationMiddleware(districtValidation.update),
  validateDistrictSearch: createValidationMiddleware(districtValidation.search, 'query'),
  validateDistrictBulkUpdate: createValidationMiddleware(districtValidation.bulkUpdate),
  validateDistrictStatistics: createValidationMiddleware(districtValidation.statistics, 'query'),

  // Range validations
  validateRangeCreate: createValidationMiddleware(rangeValidation.create),
  validateRangeUpdate: createValidationMiddleware(rangeValidation.update),
  validateRangeSearch: createValidationMiddleware(rangeValidation.search, 'query'),

  // Module validations
  validateModuleCreate: createValidationMiddleware(moduleValidation.create),
  validateModuleUpdate: createValidationMiddleware(moduleValidation.update),
  validateModuleReorder: createValidationMiddleware(moduleValidation.reorder),

  // Topic validations
  validateTopicCreate: createValidationMiddleware(topicValidation.create),
  validateTopicUpdate: createValidationMiddleware(topicValidation.update),
  validateTopicCopy: createValidationMiddleware(topicValidation.copy),

  // SubTopic validations
  validateSubTopicCreate: createValidationMiddleware(subTopicValidation.create),
  validateSubTopicUpdate: createValidationMiddleware(subTopicValidation.update),
  validateSubTopicMove: createValidationMiddleware(subTopicValidation.move),

  // Question validations
  validateQuestionCreate: createValidationMiddleware(questionValidation.create),
  validateQuestionUpdate: createValidationMiddleware(questionValidation.update),
  validateQuestionMove: createValidationMiddleware(questionValidation.move),

  // Common search validation
  validateContentSearch: createValidationMiddleware(contentSearchValidation, 'query'),

  // Business rule validators
  validateUniqueDistrictCode: async (req, res, next) => {
    try {
      const { code, stateId } = req.body;
      const { id } = req.params;

      if (!code || !stateId) return next();

      const { District } = require('../models');
      const { Op } = require('sequelize');
      
      const whereClause = { code, stateId };
      if (id) {
        whereClause.id = { [Op.ne]: id };
      }

      const existingDistrict = await District.findOne({ where: whereClause });
      
      if (existingDistrict) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'District code already exists in this state',
          field: 'code'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  validateUniqueDistrictName: async (req, res, next) => {
    try {
      const { name, stateId } = req.body;
      const { id } = req.params;

      if (!name || !stateId) return next();

      const { District } = require('../models');
      const { Op } = require('sequelize');
      
      const whereClause = { name, stateId };
      if (id) {
        whereClause.id = { [Op.ne]: id };
      }

      const existingDistrict = await District.findOne({ where: whereClause });
      
      if (existingDistrict) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'District name already exists in this state',
          field: 'name'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  validateUniqueRangeCode: async (req, res, next) => {
    try {
      const { code, districtId } = req.body;
      const { id } = req.params;

      if (!code || !districtId) return next();

      const { Range } = require('../models');
      const { Op } = require('sequelize');
      
      const whereClause = { code, districtId };
      if (id) {
        whereClause.id = { [Op.ne]: id };
      }

      const existingRange = await Range.findOne({ where: whereClause });
      
      if (existingRange) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Range code already exists in this district',
          field: 'code'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  validateUniqueModuleName: async (req, res, next) => {
    try {
      const { name } = req.body;
      const { id } = req.params;

      if (!name) return next();

      const { Module } = require('../models');
      const { Op } = require('sequelize');
      
      const whereClause = { name };
      if (id) {
        whereClause.id = { [Op.ne]: id };
      }

      const existingModule = await Module.findOne({ where: whereClause });
      
      if (existingModule) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Module name already exists',
          field: 'name'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  validateUniqueTopicName: async (req, res, next) => {
    try {
      const { name, moduleId } = req.body;
      const { id } = req.params;

      if (!name || !moduleId) return next();

      const { Topic } = require('../models');
      const { Op } = require('sequelize');
      
      const whereClause = { name, moduleId };
      if (id) {
        whereClause.id = { [Op.ne]: id };
      }

      const existingTopic = await Topic.findOne({ where: whereClause });
      
      if (existingTopic) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Topic name already exists in this module',
          field: 'name'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  validateUniqueSubTopicName: async (req, res, next) => {
    try {
      const { name, topicId } = req.body;
      const { id } = req.params;

      if (!name || !topicId) return next();

      const { SubTopic } = require('../models');
      const { Op } = require('sequelize');
      
      const whereClause = { name, topicId };
      if (id) {
        whereClause.id = { [Op.ne]: id };
      }

      const existingSubTopic = await SubTopic.findOne({ where: whereClause });
      
      if (existingSubTopic) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Subtopic name already exists in this topic',
          field: 'name'
        });
      }

      next();
    } catch (error) {
      next(error);
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
            message: `${parentModel} not found`,
            field: parentField
          });
        }
        
        if (parent.hasOwnProperty('isActive') && parent.isActive === false) {
          return res.status(400).json({
            status: 'ERROR',
            message: `${parentModel} is not active`,
            field: parentField
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
        const { Op } = require('sequelize');
        const whereClause = { displayOrder };
        
        // Add scope validation (e.g., display order within same module/topic)
        if (scopeField && req.body[scopeField]) {
          whereClause[scopeField] = req.body[scopeField];
        }
        
        // Exclude current record for updates
        if (id) {
          whereClause.id = { [Op.ne]: id };
        }
        
        const existingRecord = await Model.findOne({ where: whereClause });
        
        if (existingRecord) {
          return res.status(400).json({
            status: 'ERROR',
            message: 'Display order already exists in this scope',
            field: 'displayOrder'
          });
        }
        
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  // Sanitization middleware
  sanitizeInput: (req, res, next) => {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Basic XSS prevention and sanitization
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^<]*>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          sanitizeObject(obj[key]);
        } else if (Array.isArray(obj[key])) {
          obj[key].forEach((item, index) => {
            if (typeof item === 'string') {
              obj[key][index] = item
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                .trim();
            } else if (typeof item === 'object' && item !== null) {
              sanitizeObject(item);
            }
          });
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