const winston = require('winston');
const {
  AppException,
  ValidationException,
  AuthenticationException,
  AuthorizationException,
  NotFoundException,
  ConflictException,
  BusinessRuleException,
  DatabaseException
} = require('../exceptions');

// Configure logger for error handling
const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Enhanced Error Handling Middleware
 */
class ErrorHandler {
  /**
   * Main error handling middleware
   */
  static handle(error, req, res, next) {
    // Log the error
    ErrorHandler.logError(error, req);

    // Handle different error types
    if (error instanceof AppException) {
      return ErrorHandler.handleAppException(error, req, res);
    }

    // Handle Sequelize errors
    if (error.name && error.name.startsWith('Sequelize')) {
      const dbException = DatabaseException.fromSequelize(error);
      return ErrorHandler.handleAppException(dbException, req, res);
    }

    // Handle Joi validation errors
    if (error.isJoi) {
      const validationException = ValidationException.fromJoi(error);
      return ErrorHandler.handleAppException(validationException, req, res);
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      const authException = new AuthenticationException('Invalid token');
      return ErrorHandler.handleAppException(authException, req, res);
    }

    if (error.name === 'TokenExpiredError') {
      const authException = new AuthenticationException('Token expired');
      return ErrorHandler.handleAppException(authException, req, res);
    }

    // Handle Multer errors (file upload)
    if (error.code === 'LIMIT_FILE_SIZE') {
      const fileException = new ValidationException(
        'File size too large',
        [{ field: 'file', message: 'File size exceeds the maximum limit' }]
      );
      return ErrorHandler.handleAppException(fileException, req, res);
    }

    // Handle syntax errors
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      const syntaxException = new ValidationException('Invalid JSON in request body');
      return ErrorHandler.handleAppException(syntaxException, req, res);
    }

    // Handle legacy error format
    return ErrorHandler.handleLegacyError(error, req, res);
  }

  /**
   * Handle application exceptions
   */
  static handleAppException(exception, req, res) {
    const response = exception.toResponse();
    
    // Add request context for debugging
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query
      };
    }

    return res.status(exception.statusCode).json(response);
  }

  /**
   * Handle legacy error format (backward compatibility)
   */
  static handleLegacyError(err, req, res) {
    let error = { ...err };
    error.message = err.message;

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = 'Resource not found';
      error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      const message = 'Duplicate field value entered';
      error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      error = { message, statusCode: 400 };
    }

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
      const message = err.errors.map(e => e.message).join(', ');
      error = { message, statusCode: 400 };
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
      const message = 'Duplicate field value entered';
      error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  /**
   * Log error with context
   */
  static logError(error, req) {
    const logData = {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    };

    // Add error-specific data
    if (error instanceof AppException) {
      logData.errorCode = error.code;
      logData.statusCode = error.statusCode;
      logData.details = error.details;
    }

    // Add request body for POST/PUT/PATCH (but sanitize sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      logData.requestBody = ErrorHandler.sanitizeRequestBody(req.body);
    }

    errorLogger.error('Application Error', logData);
  }

  /**
   * Sanitize request body for logging (remove sensitive fields)
   */
  static sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Handle 404 errors (route not found)
   */
  static notFound(req, res, next) {
    const notFoundException = new NotFoundException(
      'Route', 
      `${req.method} ${req.url}`
    );
    
    next(notFoundException);
  }

  /**
   * Handle async route errors
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Validation error formatter for express-validator
   */
  static handleValidationErrors(req, res, next) {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const validationErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }));

      const validationException = new ValidationException(
        'Request validation failed',
        validationErrors
      );
      
      return next(validationException);
    }
    
    next();
  }
}

// Legacy export for backward compatibility
const errorHandler = ErrorHandler.handle;

module.exports = errorHandler;
module.exports.ErrorHandler = ErrorHandler;