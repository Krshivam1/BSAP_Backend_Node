/**
 * Base Application Exception class
 * All custom exceptions should extend this class
 */
class AppException extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = true;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert exception to response format
   */
  toResponse() {
    return {
      success: false,
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }

  /**
   * Convert exception to log format
   */
  toLogFormat() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
      timestamp: this.timestamp
    };
  }
}

/**
 * Validation Exception
 * Thrown when request validation fails
 */
class ValidationException extends AppException {
  constructor(message = 'Validation failed', validationErrors = [], field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.validationErrors = validationErrors;
    this.field = field;
    this.details = {
      field,
      validationErrors: Array.isArray(validationErrors) ? validationErrors : [validationErrors]
    };
  }

  /**
   * Create from Joi validation error
   */
  static fromJoi(joiError) {
    const validationErrors = joiError.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    return new ValidationException(
      'Request validation failed',
      validationErrors
    );
  }

  /**
   * Create from Sequelize validation error
   */
  static fromSequelize(sequelizeError) {
    const validationErrors = sequelizeError.errors?.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value,
      type: error.type
    })) || [];

    return new ValidationException(
      'Database validation failed',
      validationErrors
    );
  }
}

/**
 * Authentication Exception
 * Thrown when authentication fails
 */
class AuthenticationException extends AppException {
  constructor(message = 'Authentication failed', code = 'AUTH_FAILED') {
    super(message, 401, code);
  }
}

/**
 * Authorization Exception
 * Thrown when user lacks required permissions
 */
class AuthorizationException extends AppException {
  constructor(message = 'Access denied', requiredPermission = null, userPermissions = []) {
    super(message, 403, 'ACCESS_DENIED');
    this.details = {
      requiredPermission,
      userPermissions
    };
  }
}

/**
 * Resource Not Found Exception
 * Thrown when requested resource doesn't exist
 */
class NotFoundException extends AppException {
  constructor(resource = 'Resource', identifier = null) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    super(message, 404, 'RESOURCE_NOT_FOUND');
    this.details = {
      resource,
      identifier
    };
  }
}

/**
 * Conflict Exception
 * Thrown when resource conflicts with existing data
 */
class ConflictException extends AppException {
  constructor(message = 'Resource conflict', conflictField = null, conflictValue = null) {
    super(message, 409, 'RESOURCE_CONFLICT');
    this.details = {
      conflictField,
      conflictValue
    };
  }
}

/**
 * Business Rule Exception
 * Thrown when business rules are violated
 */
class BusinessRuleException extends AppException {
  constructor(message = 'Business rule violation', rule = null, context = null) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION');
    this.details = {
      rule,
      context
    };
  }
}

/**
 * External Service Exception
 * Thrown when external service calls fail
 */
class ExternalServiceException extends AppException {
  constructor(message = 'External service error', service = null, operation = null) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
    this.details = {
      service,
      operation
    };
  }
}

/**
 * Rate Limit Exception
 * Thrown when rate limits are exceeded
 */
class RateLimitException extends AppException {
  constructor(message = 'Rate limit exceeded', limit = null, resetTime = null) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.details = {
      limit,
      resetTime
    };
  }
}

/**
 * File Operation Exception
 * Thrown when file operations fail
 */
class FileOperationException extends AppException {
  constructor(message = 'File operation failed', operation = null, filename = null) {
    super(message, 422, 'FILE_OPERATION_ERROR');
    this.details = {
      operation,
      filename
    };
  }
}

/**
 * Database Exception
 * Thrown when database operations fail
 */
class DatabaseException extends AppException {
  constructor(message = 'Database operation failed', operation = null, table = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.details = {
      operation,
      table
    };
  }

  /**
   * Create from Sequelize error
   */
  static fromSequelize(sequelizeError, operation = null, table = null) {
    let message = 'Database operation failed';
    let code = 'DATABASE_ERROR';
    let statusCode = 500;

    // Handle specific Sequelize error types
    switch (sequelizeError.name) {
      case 'SequelizeUniqueConstraintError':
        message = 'Duplicate entry found';
        code = 'DUPLICATE_ENTRY';
        statusCode = 409;
        break;
      case 'SequelizeForeignKeyConstraintError':
        message = 'Foreign key constraint violation';
        code = 'FOREIGN_KEY_VIOLATION';
        statusCode = 422;
        break;
      case 'SequelizeValidationError':
        return ValidationException.fromSequelize(sequelizeError);
      case 'SequelizeConnectionError':
        message = 'Database connection failed';
        code = 'CONNECTION_ERROR';
        statusCode = 503;
        break;
      case 'SequelizeTimeoutError':
        message = 'Database operation timeout';
        code = 'TIMEOUT_ERROR';
        statusCode = 408;
        break;
      default:
        message = sequelizeError.message || message;
    }

    const exception = new DatabaseException(message, operation, table);
    exception.code = code;
    exception.statusCode = statusCode;
    exception.originalError = sequelizeError;
    
    return exception;
  }
}

module.exports = {
  AppException,
  ValidationException,
  AuthenticationException,
  AuthorizationException,
  NotFoundException,
  ConflictException,
  BusinessRuleException,
  ExternalServiceException,
  RateLimitException,
  FileOperationException,
  DatabaseException
};