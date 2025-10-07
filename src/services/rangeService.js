const { Range, State, User } = require('../models');
const { Op } = require('sequelize');

class RangeService {
  
  // Get all ranges with pagination and filtering
  static async getAllRanges(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'range_name',
      sortOrder = 'ASC',
      search,
      stateId
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { rangeName: { [Op.like]: `%${search}%` } },
        { rangeHead: { [Op.like]: `%${search}%` } },
        { rangeEmail: { [Op.like]: `%${search}%` } }
      ];
    }

    if (stateId) {
      whereClause.stateId = stateId;
    }

    const { count, rows } = await Range.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'stateName']
        }
      ],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      ranges: rows,
      total: count
    };
  }

  // Get range by ID
  static async getRangeById(id) {
    return await Range.findByPk(id, {
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'stateName']
        }
      ]
    });
  }

  // Create new range
  static async createRange(rangeData) {
    return await Range.create(rangeData);
  }

  // Update range
  static async updateRange(id, rangeData) {
    const range = await Range.findByPk(id);
    if (!range) return null;

    await range.update(rangeData);
    return await this.getRangeById(id);
  }

  // Delete range
  static async deleteRange(id) {
    const range = await Range.findByPk(id);
    if (!range) return false;

    await range.destroy();
    return true;
  }

  // Get ranges by state
  static async getRangesByState(stateId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'range_name',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await Range.findAndCountAll({
      where: { stateId },
      include: [{
        model: State,
        as: 'state',
        attributes: ['id', 'stateName']
      }],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      ranges: rows,
      total: count
    };
  }

  // Search ranges
  static async searchRanges(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      stateId
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { rangeName: { [Op.like]: `%${search}%` } },
        { rangeHead: { [Op.like]: `%${search}%` } },
        { rangeEmail: { [Op.like]: `%${search}%` } }
      ]
    };

    if (stateId) {
      whereClause.stateId = stateId;
    }

    const { count, rows } = await Range.findAndCountAll({
      where: whereClause,
      include: [{
        model: State,
        as: 'state',
        attributes: ['id', 'stateName']
      }],
      limit,
      offset,
      order: [['rangeName', 'ASC']]
    });

    return {
      ranges: rows,
      total: count
    };
  }

  // Get active ranges
  static async getActiveRanges() {
    return await Range.findAll({
      where: { active: true },
      order: [['rangeName', 'ASC']],
      attributes: ['id', 'rangeName', 'stateId']
    });
  }

  // Activate range
  static async activateRange(id, updatedBy) {
    const range = await Range.findByPk(id);
    if (!range) return null;

    await range.update({
      active: true,
      updatedBy
    });

    return range;
  }

  // Deactivate range
  static async deactivateRange(id, updatedBy) {
    const range = await Range.findByPk(id);
    if (!range) return null;

    await range.update({
      active: false,
      updatedBy
    });

    return range;
  }

  // Get range statistics
  static async getRangeStatistics(stateId = null) {
    const whereClause = {};

    if (stateId) {
      whereClause.stateId = stateId;
    }

    const [
      totalRanges,
      activeRanges
    ] = await Promise.all([
      Range.count({ where: whereClause }),
      Range.count({ where: { ...whereClause, active: true } })
    ]);

    return {
      totalRanges,
      activeRanges,
      inactiveRanges: totalRanges - activeRanges
    };
  }

  // Get users by range
  static async getUsersByRange(rangeId, options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: { rangeId },
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      users: rows,
      total: count
    };
  }

  // Check if range name exists in state
  static async isNameExists(rangeName, stateId, excludeId = null) {
    const whereClause = { 
      rangeName, 
      stateId 
    };
    
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await Range.count({ where: whereClause });
    return count > 0;
  }

  // Get ranges for dropdown
  static async getRangesForDropdown(stateId = null) {
    const whereClause = { active: true };

    if (stateId) {
      whereClause.stateId = stateId;
    }

    return await Range.findAll({
      where: whereClause,
      attributes: ['id', 'rangeName', 'stateId'],
      order: [['rangeName', 'ASC']]
    });
  }
}

module.exports = RangeService;