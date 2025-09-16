const BaseDTO = require('./BaseDTO');

/**
 * State DTO class
 */
class StateDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.districts = [];
    this.users = [];
    
    // Set relationship data if provided
    if (data.districts) {
      this.districts = Array.isArray(data.districts) 
        ? data.districts.map(d => new DistrictDTO(d))
        : [];
    }
    
    if (data.users) {
      this.users = Array.isArray(data.users) 
        ? data.users.map(u => ({ id: u.id, name: u.firstName + ' ' + u.lastName }))
        : [];
    }
  }

  /**
   * Get state summary for dropdown/selection
   * @returns {Object} State summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      isActive: this.isActive
    };
  }

  /**
   * Get state with statistics
   * @returns {Object} State with counts
   */
  getWithStats() {
    return {
      ...this.toJSON(),
      districtCount: this.districts ? this.districts.length : 0,
      userCount: this.users ? this.users.length : 0
    };
  }

  /**
   * Convert to response format for API
   * @returns {Object} API response format
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      districts: this.districts.map(d => d.getSummary ? d.getSummary() : d),
      districtCount: this.districts ? this.districts.length : 0
    };
  }
}

/**
 * District DTO class
 */
class DistrictDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.state = null;
    this.ranges = [];
    this.policeStations = [];
    this.users = [];
    
    // Set relationship data if provided
    if (data.state) {
      this.state = new StateDTO(data.state);
    }
    
    if (data.ranges) {
      this.ranges = Array.isArray(data.ranges) 
        ? data.ranges.map(r => new RangeDTO(r))
        : [];
    }
    
    if (data.policeStations) {
      this.policeStations = Array.isArray(data.policeStations) 
        ? data.policeStations.map(ps => ({ id: ps.id, name: ps.name, code: ps.code }))
        : [];
    }

    if (data.users) {
      this.users = Array.isArray(data.users) 
        ? data.users.map(u => ({ id: u.id, name: u.firstName + ' ' + u.lastName }))
        : [];
    }
  }

  /**
   * Get district summary for dropdown/selection
   * @returns {Object} District summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      stateId: this.stateId,
      stateName: this.state ? this.state.name : null,
      isActive: this.isActive
    };
  }

  /**
   * Get district with hierarchy information
   * @returns {Object} District with hierarchy
   */
  getWithHierarchy() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      isActive: this.isActive,
      state: this.state ? this.state.getSummary() : null,
      ranges: this.ranges.map(r => r.getSummary ? r.getSummary() : r),
      rangeCount: this.ranges ? this.ranges.length : 0,
      policeStationCount: this.policeStations ? this.policeStations.length : 0
    };
  }

  /**
   * Convert to response format for API
   * @returns {Object} API response format
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      stateId: this.stateId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      state: this.state ? this.state.getSummary() : null,
      ranges: this.ranges.map(r => r.getSummary ? r.getSummary() : r),
      rangeCount: this.ranges ? this.ranges.length : 0,
      policeStationCount: this.policeStations ? this.policeStations.length : 0,
      userCount: this.users ? this.users.length : 0
    };
  }

  /**
   * Get district breadcrumb path
   * @returns {Object} Breadcrumb information
   */
  getBreadcrumb() {
    return {
      state: this.state ? {
        id: this.state.id,
        name: this.state.name
      } : null,
      district: {
        id: this.id,
        name: this.name
      }
    };
  }
}

/**
 * Range DTO class
 */
class RangeDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    
    // Initialize relationships
    this.district = null;
    this.policeStations = [];
    this.users = [];
    
    // Set relationship data if provided
    if (data.district) {
      this.district = new DistrictDTO(data.district);
    }
    
    if (data.policeStations) {
      this.policeStations = Array.isArray(data.policeStations) 
        ? data.policeStations.map(ps => ({ id: ps.id, name: ps.name, code: ps.code }))
        : [];
    }

    if (data.users) {
      this.users = Array.isArray(data.users) 
        ? data.users.map(u => ({ id: u.id, name: u.firstName + ' ' + u.lastName }))
        : [];
    }
  }

  /**
   * Get range summary for dropdown/selection
   * @returns {Object} Range summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      districtId: this.districtId,
      districtName: this.district ? this.district.name : null,
      isActive: this.isActive
    };
  }

  /**
   * Get range with hierarchy information
   * @returns {Object} Range with hierarchy
   */
  getWithHierarchy() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      isActive: this.isActive,
      district: this.district ? this.district.getSummary() : null,
      policeStations: this.policeStations,
      policeStationCount: this.policeStations ? this.policeStations.length : 0
    };
  }

  /**
   * Convert to response format for API
   * @returns {Object} API response format
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      districtId: this.districtId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      district: this.district ? this.district.getSummary() : null,
      policeStations: this.policeStations,
      policeStationCount: this.policeStations ? this.policeStations.length : 0,
      userCount: this.users ? this.users.length : 0
    };
  }

  /**
   * Get range breadcrumb path
   * @returns {Object} Breadcrumb information
   */
  getBreadcrumb() {
    const breadcrumb = {
      range: {
        id: this.id,
        name: this.name
      }
    };

    if (this.district) {
      breadcrumb.state = this.district.state ? {
        id: this.district.state.id,
        name: this.district.state.name
      } : null;
      breadcrumb.district = {
        id: this.district.id,
        name: this.district.name
      };
    }

    return breadcrumb;
  }
}

/**
 * Paginated response DTO for geographic entities
 */
class PaginatedGeographyDTO extends BaseDTO {
  constructor(data, total, page = 1, limit = 10) {
    super();
    this.data = Array.isArray(data) ? data : [];
    this.total = total || 0;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(this.total / this.limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }

  /**
   * Convert to response format
   * @returns {Object} Paginated response
   */
  toResponse() {
    return {
      data: this.data.map(item => 
        item.toResponse ? item.toResponse() : item
      ),
      pagination: {
        total: this.total,
        page: this.page,
        limit: this.limit,
        totalPages: this.totalPages,
        hasNext: this.hasNext,
        hasPrev: this.hasPrev
      }
    };
  }
}

/**
 * Geography statistics DTO
 */
class GeographyStatsDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
  }

  /**
   * Convert to response format
   * @returns {Object} Statistics response
   */
  toResponse() {
    return {
      summary: {
        totalStates: this.totalStates || 0,
        totalDistricts: this.totalDistricts || 0,
        totalRanges: this.totalRanges || 0,
        activeStates: this.activeStates || 0,
        activeDistricts: this.activeDistricts || 0,
        activeRanges: this.activeRanges || 0
      },
      distributions: {
        districtsByState: this.districtsByState || [],
        rangesByDistrict: this.rangesByDistrict || [],
        usersByLocation: this.usersByLocation || []
      },
      trends: {
        recentActivity: this.recentActivity || [],
        growthMetrics: this.growthMetrics || {}
      }
    };
  }
}

module.exports = {
  StateDTO,
  DistrictDTO,
  RangeDTO,
  PaginatedGeographyDTO,
  GeographyStatsDTO
};