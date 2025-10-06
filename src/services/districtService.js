const { District, State, Range, CIDPoliceStation, CIDSubDivision, User } = require('../models');
const { Op } = require('sequelize');

class DistrictService {
  
  // Get all districts with pagination and filtering
  static async getAllDistricts(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC',
      search,
      stateId
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (stateId) {
      whereClause.stateId = stateId;
    }

    const { count, rows } = await District.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Range,
          as: 'ranges',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      districts: rows,
      total: count
    };
  }

  // Get district by ID
  static async getDistrictById(id) {
    return await District.findByPk(id, {
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Range,
          as: 'ranges',
          attributes: ['id', 'name', 'code', 'isActive'],
          order: [['name', 'ASC']]
        },
        {
          model: CIDPoliceStation,
          as: 'policeStations',
          attributes: ['id', 'name', 'code'],
          required: false
        }
      ]
    });
  }

  // Create new district
  static async createDistrict(districtData) {
    return await District.create(districtData);
  }

  // Update district
  static async updateDistrict(id, districtData) {
    const district = await District.findByPk(id);
    if (!district) return null;

    await district.update(districtData);
    return await this.getDistrictById(id);
  }

  // Delete district
  static async deleteDistrict(id) {
    const district = await District.findByPk(id);
    if (!district) return false;

    // Check if district has ranges
    const rangeCount = await Range.count({ where: { districtId: id } });
    if (rangeCount > 0) {
      throw new Error('Cannot delete district with existing ranges');
    }

    // Check if district has police stations
    const policeStationCount = await CIDPoliceStation.count({ where: { districtId: id } });
    if (policeStationCount > 0) {
      throw new Error('Cannot delete district with existing police stations');
    }

    await district.destroy();
    return true;
  }

  // Get districts by state
  static async getDistrictsByState(stateId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await District.findAndCountAll({
      where: { stateId },
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      districts: rows,
      total: count
    };
  }

  // Search districts
  static async searchDistricts(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      stateId
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    };

    if (stateId) {
      whereClause.stateId = stateId;
    }

    const { count, rows } = await District.findAndCountAll({
      where: whereClause,
      include: [{
        model: State,
        as: 'state',
        attributes: ['id', 'name']
      }],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      districts: rows,
      total: count
    };
  }

  // Get police stations by district
  static async getPoliceStationsByDistrict(districtId, options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await CIDPoliceStation.findAndCountAll({
      where: { districtId },
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      policeStations: rows,
      total: count
    };
  }

  // Get sub-divisions by district
  static async getSubDivisionsByDistrict(districtId, options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await CIDSubDivision.findAndCountAll({
      where: { districtId },
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      subDivisions: rows,
      total: count
    };
  }

  // Get active districts
  static async getActiveDistricts() {
    const whereClause = { active: true };
    return await District.findAll({
      where: whereClause,
      order: [['districtName', 'ASC']],
      attributes: ['id', 'districtName']
    });
  }

  // Activate district
  static async activateDistrict(id, updatedBy) {
    const district = await District.findByPk(id);
    if (!district) return null;

    await district.update({
      isActive: true,
      updatedBy
    });

    return district;
  }

  // Deactivate district
  static async deactivateDistrict(id, updatedBy) {
    const district = await District.findByPk(id);
    if (!district) return null;

    await district.update({
      isActive: false,
      updatedBy
    });

    return district;
  }

  // Get district statistics
  static async getDistrictStatistics(stateId = null) {
    const whereClause = {};
    if (stateId) {
      whereClause.stateId = stateId;
    }

    const [
      totalDistricts,
      activeDistricts,
      districtsWithRanges,
      districtsWithPoliceStations
    ] = await Promise.all([
      District.count({ where: whereClause }),
      District.count({ where: { ...whereClause, isActive: true } }),
      District.count({
        where: whereClause,
        include: [{
          model: Range,
          as: 'ranges',
          required: true
        }]
      }),
      District.count({
        where: whereClause,
        include: [{
          model: CIDPoliceStation,
          as: 'policeStations',
          required: true
        }]
      })
    ]);

    const rangeCounts = await District.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        [District.sequelize.fn('COUNT', District.sequelize.col('ranges.id')), 'rangeCount']
      ],
      include: [{
        model: Range,
        as: 'ranges',
        attributes: [],
        required: false
      }],
      group: ['District.id'],
      order: [[District.sequelize.literal('rangeCount'), 'DESC']]
    });

    return {
      totalDistricts,
      activeDistricts,
      inactiveDistricts: totalDistricts - activeDistricts,
      districtsWithRanges,
      districtsWithoutRanges: totalDistricts - districtsWithRanges,
      districtsWithPoliceStations,
      districtsWithoutPoliceStations: totalDistricts - districtsWithPoliceStations,
      rangeCounts: rangeCounts.map(district => ({
        id: district.id,
        name: district.name,
        rangeCount: parseInt(district.dataValues.rangeCount) || 0
      }))
    };
  }

  // Get district by code
  static async getDistrictByCode(code, stateId = null) {
    const whereClause = { code };
    if (stateId) {
      whereClause.stateId = stateId;
    }

    return await District.findOne({
      where: whereClause,
      include: [{
        model: State,
        as: 'state',
        attributes: ['id', 'name', 'code']
      }]
    });
  }

  // Check if district code exists in state
  static async isCodeExists(code, stateId, excludeId = null) {
    const whereClause = { code, stateId };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await District.count({ where: whereClause });
    return count > 0;
  }

  // Check if district name exists in state
  static async isNameExists(name, stateId, excludeId = null) {
    const whereClause = { name, stateId };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await District.count({ where: whereClause });
    return count > 0;
  }

  // Get districts with user count
  static async getDistrictsWithUserCount(stateId = null) {
    const whereClause = {};
    if (stateId) {
      whereClause.stateId = stateId;
    }

    return await District.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'code',
        [District.sequelize.fn('COUNT', District.sequelize.col('users.id')), 'userCount']
      ],
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['name']
        },
        {
          model: User,
          as: 'users',
          attributes: [],
          required: false
        }
      ],
      group: ['District.id', 'state.id'],
      order: [['name', 'ASC']]
    });
  }

  // Bulk update districts
  static async bulkUpdateDistricts(updates, updatedBy) {
    const promises = updates.map(({ id, ...data }) => 
      District.update(
        { ...data, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    const updatedIds = updates.map(u => u.id);
    return await District.findAll({
      where: { id: { [Op.in]: updatedIds } },
      include: [{
        model: State,
        as: 'state',
        attributes: ['id', 'name']
      }]
    });
  }

  // Get districts for dropdown
  static async getDistrictsForDropdown(stateId = null) {
    const whereClause = { isActive: true };
    if (stateId) {
      whereClause.stateId = stateId;
    }

    return await District.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'code', 'stateId'],
      order: [['name', 'ASC']]
    });
  }

  // Get district hierarchy (with state)
  static async getDistrictHierarchy(districtId) {
    return await District.findByPk(districtId, {
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Range,
          as: 'ranges',
          attributes: ['id', 'name', 'code'],
          where: { isActive: true },
          required: false,
          order: [['name', 'ASC']]
        }
      ]
    });
  }

}

module.exports = DistrictService;