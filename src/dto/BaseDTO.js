/**
 * Base DTO class with common transformation methods
 */
class BaseDTO {
  constructor(data = {}) {
    this.setData(data);
  }

  /**
   * Set data with automatic transformation
   * @param {Object} data - Raw data object
   */
  setData(data) {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          this[key] = this.transformValue(key, data[key]);
        }
      });
    }
  }

  /**
   * Transform individual values based on field type
   * @param {string} key - Field name
   * @param {*} value - Field value
   * @returns {*} Transformed value
   */
  transformValue(key, value) {
    // Handle Sequelize model instances
    if (value && typeof value === 'object' && value.dataValues) {
      return value.dataValues;
    }

    // Handle Date fields
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Handle boolean conversion
    if (typeof value === 'boolean') {
      return value;
    }

    // Handle numeric fields
    if (key.toLowerCase().includes('id') && typeof value === 'string' && !isNaN(value)) {
      return parseInt(value);
    }

    return value;
  }

  /**
   * Convert DTO to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    const result = {};
    Object.keys(this).forEach(key => {
      if (!key.startsWith('_') && typeof this[key] !== 'function') {
        result[key] = this[key];
      }
    });
    return result;
  }

  /**
   * Convert DTO to response format
   * @returns {Object} Response formatted object
   */
  toResponse() {
    return this.toJSON();
  }

  /**
   * Create DTO from database model
   * @param {Object} model - Database model instance
   * @returns {BaseDTO} DTO instance
   */
  static fromModel(model) {
    if (!model) return null;
    return new this(model.dataValues || model);
  }

  /**
   * Create DTOs from array of models
   * @param {Array} models - Array of database models
   * @returns {Array} Array of DTO instances
   */
  static fromModels(models) {
    if (!Array.isArray(models)) return [];
    return models.map(model => this.fromModel(model));
  }

  /**
   * Validate required fields
   * @param {Array} requiredFields - Array of required field names
   * @throws {Error} If required fields are missing
   */
  validateRequired(requiredFields = []) {
    const missing = requiredFields.filter(field => 
      this[field] === undefined || this[field] === null || this[field] === ''
    );
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Remove sensitive fields from DTO
   * @param {Array} sensitiveFields - Array of field names to remove
   * @returns {Object} Sanitized object
   */
  sanitize(sensitiveFields = ['password', 'token', 'secret']) {
    const sanitized = this.toJSON();
    sensitiveFields.forEach(field => {
      delete sanitized[field];
    });
    return sanitized;
  }

  /**
   * Pick only specified fields
   * @param {Array} fields - Array of field names to include
   * @returns {Object} Object with only specified fields
   */
  pick(fields = []) {
    const result = {};
    fields.forEach(field => {
      if (this[field] !== undefined) {
        result[field] = this[field];
      }
    });
    return result;
  }

  /**
   * Omit specified fields
   * @param {Array} fields - Array of field names to exclude
   * @returns {Object} Object without specified fields
   */
  omit(fields = []) {
    const result = this.toJSON();
    fields.forEach(field => {
      delete result[field];
    });
    return result;
  }
}

module.exports = BaseDTO;