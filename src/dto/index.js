// Base DTO
const BaseDTO = require('./BaseDTO');

// Geography DTOs
const {
  StateDTO,
  DistrictDTO,
  RangeDTO,
  PaginatedGeographyDTO,
  GeographyStatsDTO
} = require('./GeographyDTO');

// Content DTOs
const {
  ModuleDTO,
  TopicDTO,
  SubTopicDTO,
  QuestionDTO,
  PaginatedContentDTO,
  ContentStatsDTO
} = require('./ContentDTO');

// User DTOs
const {
  UserDTO,
  RoleDTO,
  UserHistoryDTO,
  PerformanceStatisticDTO,
  PerformanceAnalyticsDTO,
  PaginatedUserDTO
} = require('./UserDTO');

// Report DTOs
// const {
//   ReportRequestDTO,
//   ReportResponseDTO,
//   ReportMetadataDTO,
//   ReportStatisticsDTO,
//   ReportDataRowDTO,
//   ChartDataDTO,
//   ExportConfigDTO,
//   FilterOptionsDTO
// } = require('./ReportDTO');

/**
 * DTO Factory for creating appropriate DTOs
 */
class DTOFactory {
  /**
   * Create DTO from model data
   * @param {string} type DTO type
   * @param {Object} data Model data
   * @returns {BaseDTO} DTO instance
   */
  static create(type, data) {
    const dtoMap = {
      // Geography DTOs
      'state': StateDTO,
      'district': DistrictDTO,
      'range': RangeDTO,
      
      // Content DTOs
      'module': ModuleDTO,
      'topic': TopicDTO,
      'subtopic': SubTopicDTO,
      'question': QuestionDTO,
      
      // User DTOs
      'user': UserDTO,
      'role': RoleDTO,
      'userhistory': UserHistoryDTO,
      'performancestatistic': PerformanceStatisticDTO,
      
      // Report DTOs
      'reportrequest': ReportRequestDTO,
      'reportresponse': ReportResponseDTO,
      'reportmetadata': ReportMetadataDTO,
      'reportstatistics': ReportStatisticsDTO,
      'reportdatarow': ReportDataRowDTO,
      'chartdata': ChartDataDTO,
      'exportconfig': ExportConfigDTO,
      'filteroptions': FilterOptionsDTO
    };

    const DTOClass = dtoMap[type.toLowerCase()];
    if (!DTOClass) {
      throw new Error(`Unknown DTO type: ${type}`);
    }

    return new DTOClass(data);
  }

  /**
   * Create paginated DTO response
   * @param {string} type Entity type
   * @param {Array} data Data array
   * @param {number} total Total count
   * @param {number} page Current page
   * @param {number} limit Items per page
   * @returns {Object} Paginated response
   */
  static createPaginated(type, data, total, page = 1, limit = 10) {
    const paginatedMap = {
      'geography': PaginatedGeographyDTO,
      'content': PaginatedContentDTO,
      'user': PaginatedUserDTO
    };

    // Determine category based on type
    let category = 'content'; // default
    if (['state', 'district', 'range'].includes(type.toLowerCase())) {
      category = 'geography';
    } else if (['user', 'role', 'userhistory', 'performancestatistic'].includes(type.toLowerCase())) {
      category = 'user';
    }

    const PaginatedDTO = paginatedMap[category];
    if (!PaginatedDTO) {
      throw new Error(`Unknown paginated DTO category: ${category}`);
    }

    return new PaginatedDTO(data, total, page, limit);
  }

  /**
   * Create statistics DTO
   * @param {string} type Statistics type
   * @param {Object} data Statistics data
   * @returns {Object} Statistics DTO
   */
  static createStats(type, data) {
    const statsMap = {
      'geography': GeographyStatsDTO,
      'content': ContentStatsDTO,
      'performance': PerformanceAnalyticsDTO
    };

    const StatsDTO = statsMap[type.toLowerCase()];
    if (!StatsDTO) {
      throw new Error(`Unknown statistics DTO type: ${type}`);
    }

    return new StatsDTO(data);
  }
}

/**
 * Response formatter utility
 */
class ResponseFormatter {
  /**
   * Format success response
   * @param {*} data Response data
   * @param {string} message Success message
   * @returns {Object} Formatted response
   */
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data: data && data.toResponse ? data.toResponse() : data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format error response
   * @param {string} message Error message
   * @param {Array} errors Error details
   * @param {number} code Error code
   * @returns {Object} Formatted error response
   */
  static error(message = 'Error', errors = [], code = 500) {
    return {
      success: false,
      message,
      errors,
      code,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format validation error response
   * @param {Array} validationErrors Validation errors
   * @returns {Object} Formatted validation error response
   */
  static validationError(validationErrors) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validationErrors,
      code: 400,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format paginated response
   * @param {Object} paginatedData Paginated DTO
   * @param {string} message Success message
   * @returns {Object} Formatted paginated response
   */
  static paginated(paginatedData, message = 'Success') {
    const response = paginatedData.toResponse ? paginatedData.toResponse() : paginatedData;
    
    return {
      success: true,
      message,
      data: response.data,
      pagination: response.pagination,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format list response with metadata
   * @param {Array} data Data array
   * @param {Object} metadata Additional metadata
   * @param {string} message Success message
   * @returns {Object} Formatted list response
   */
  static list(data, metadata = {}, message = 'Success') {
    return {
      success: true,
      message,
      data: Array.isArray(data) 
        ? data.map(item => item.toResponse ? item.toResponse() : item)
        : [],
      metadata: {
        count: Array.isArray(data) ? data.length : 0,
        ...metadata
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format statistics response
   * @param {Object} statsData Statistics DTO
   * @param {string} message Success message
   * @returns {Object} Formatted statistics response
   */
  static statistics(statsData, message = 'Statistics retrieved successfully') {
    return {
      success: true,
      message,
      statistics: statsData.toResponse ? statsData.toResponse() : statsData,
      generatedAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * DTO transformation utilities
 */
class DTOTransformer {
  /**
   * Transform model to DTO
   * @param {Object} model Sequelize model instance
   * @param {string} type DTO type
   * @returns {BaseDTO} DTO instance
   */
  static modelToDTO(model, type) {
    if (!model) return null;

    const data = model.toJSON ? model.toJSON() : model;
    return DTOFactory.create(type, data);
  }

  /**
   * Transform array of models to DTOs
   * @param {Array} models Array of model instances
   * @param {string} type DTO type
   * @returns {Array} Array of DTO instances
   */
  static modelsToDTO(models, type) {
    if (!Array.isArray(models)) return [];

    return models.map(model => this.modelToDTO(model, type));
  }

  /**
   * Transform sequelize findAndCountAll result to paginated DTO
   * @param {Object} result Sequelize findAndCountAll result
   * @param {string} type DTO type
   * @param {number} page Current page
   * @param {number} limit Items per page
   * @returns {Object} Paginated DTO
   */
  static sequelizeToPaginated(result, type, page = 1, limit = 10) {
    const { rows, count } = result;
    const dtos = this.modelsToDTO(rows, type);
    
    // Determine category for paginated DTO
    let category = 'content';
    if (['state', 'district', 'range'].includes(type.toLowerCase())) {
      category = 'geography';
    } else if (['user', 'role', 'userhistory', 'performancestatistic'].includes(type.toLowerCase())) {
      category = 'user';
    }

    return DTOFactory.createPaginated(category, dtos, count, page, limit);
  }

  /**
   * Transform raw statistics data to statistics DTO
   * @param {Object} data Raw statistics data
   * @param {string} type Statistics type
   * @returns {Object} Statistics DTO
   */
  static dataToStats(data, type) {
    return DTOFactory.createStats(type, data);
  }
}

module.exports = {
  // Base DTO
  BaseDTO,
  
  // Geography DTOs
  StateDTO,
  DistrictDTO,
  RangeDTO,
  PaginatedGeographyDTO,
  GeographyStatsDTO,
  
  // Content DTOs
  ModuleDTO,
  TopicDTO,
  SubTopicDTO,
  QuestionDTO,
  PaginatedContentDTO,
  ContentStatsDTO,
  
  // User DTOs
  UserDTO,
  RoleDTO,
  UserHistoryDTO,
  PerformanceStatisticDTO,
  PerformanceAnalyticsDTO,
  PaginatedUserDTO,
  
  // Report DTOs
  // ReportRequestDTO,
  // ReportResponseDTO,
  // ReportMetadataDTO,
  // ReportStatisticsDTO,
  // ReportDataRowDTO,
  // ChartDataDTO,
  // ExportConfigDTO,
  // FilterOptionsDTO,
  
  // Utilities
  DTOFactory,
  ResponseFormatter,
  DTOTransformer
};