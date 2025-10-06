const { Range, District, State, CIDPoliceStation, User } = require('../models');
const { Op } = require('sequelize');

class RangeService {
  
  // Get all ranges with pagination and filtering
  static async getAllRanges(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC',
      search,
      districtId,
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

    if (districtId) {
      whereClause.districtId = districtId;
    }

    const includeClause = [
      {
        model: District,
        as: 'district',
        attributes: ['id', 'name', 'code'],
        include: [{
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'code'],
          ...(stateId && { where: { id: stateId } })
        }]
      }
    ];

    const { count, rows } = await Range.findAndCountAll({
      where: whereClause,
      include: includeClause,
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
          model: District,
          as: 'district',
          attributes: ['id', 'name', 'code'],
          include: [{
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'code']
          }]
        },
        {
          model: CIDPoliceStation,
          as: 'policeStations',
          attributes: ['id', 'name', 'code', 'isActive'],
          required: false,
          order: [['name', 'ASC']]
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

    // Check if range has police stations
    const policeStationCount = await CIDPoliceStation.count({ where: { rangeId: id } });
    if (policeStationCount > 0) {
      throw new Error('Cannot delete range with existing police stations');
    }

    await range.destroy();
    return true;
  }

  // Get ranges by district
  static async getRangesByDistrict(districtId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await Range.findAndCountAll({
      where: { districtId },
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
      districtId,
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

    if (districtId) {
      whereClause.districtId = districtId;
    }

    const includeClause = [{
      model: District,
      as: 'district',
      attributes: ['id', 'name'],
      include: [{
        model: State,
        as: 'state',
        attributes: ['id', 'name'],
        ...(stateId && { where: { id: stateId } })
      }]
    }];

    const { count, rows } = await Range.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      ranges: rows,
      total: count
    };
  }

  // Get police stations by range
  static async getPoliceStationsByRange(rangeId, options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await CIDPoliceStation.findAndCountAll({
      where: { rangeId },
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      policeStations: rows,
      total: count
    };
  }

  // Get active ranges
  static async getActiveRanges() {
    const whereClause = { active: true };
    // const includeClause = [{
    //   model: District,
    //   as: 'district',
    //   attributes: ['id', 'name'],
    //   ...(stateId && { where: { stateId } })
    // }];

    return await Range.findAll({
      where: whereClause,
      order: [['rangeName', 'ASC']],
      attributes: ['id', 'rangeName']
    });
  }

  // Activate range
  static async activateRange(id, updatedBy) {
    const range = await Range.findByPk(id);
    if (!range) return null;

    await range.update({
      isActive: true,
      updatedBy
    });

    return range;
  }

  // Deactivate range
  static async deactivateRange(id, updatedBy) {
    const range = await Range.findByPk(id);
    if (!range) return null;

    await range.update({
      isActive: false,
      updatedBy
    });

    return range;
  }

  // Get range statistics
  static async getRangeStatistics(districtId = null, stateId = null) {
    const whereClause = {};
    const includeClause = [];

    if (districtId) {
      whereClause.districtId = districtId;
    }

    if (stateId && !districtId) {
      includeClause.push({
        model: District,
        as: 'district',
        where: { stateId },
        attributes: []
      });
    }

    const [
      totalRanges,
      activeRanges,
      rangesWithPoliceStations
    ] = await Promise.all([
      Range.count({ 
        where: whereClause,
        ...(includeClause.length && { include: includeClause })
      }),
      Range.count({ 
        where: { ...whereClause, isActive: true },
        ...(includeClause.length && { include: includeClause })
      }),
      Range.count({
        where: whereClause,
        include: [
          ...includeClause,
          {
            model: CIDPoliceStation,
            as: 'policeStations',
            required: true
          }
        ]
      })
    ]);

    const policeStationCounts = await Range.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        [Range.sequelize.fn('COUNT', Range.sequelize.col('policeStations.id')), 'policeStationCount']
      ],
      include: [
        ...(includeClause.length ? includeClause : []),
        {
          model: CIDPoliceStation,
          as: 'policeStations',
          attributes: [],
          required: false
        }
      ],
      group: ['Range.id'],
      order: [[Range.sequelize.literal('policeStationCount'), 'DESC']]
    });

    return {
      totalRanges,
      activeRanges,
      inactiveRanges: totalRanges - activeRanges,
      rangesWithPoliceStations,
      rangesWithoutPoliceStations: totalRanges - rangesWithPoliceStations,
      policeStationCounts: policeStationCounts.map(range => ({
        id: range.id,
        name: range.name,
        policeStationCount: parseInt(range.dataValues.policeStationCount) || 0
      }))
    };
  }

  // Get range by code
  static async getRangeByCode(code, districtId = null) {
    const whereClause = { code };
    if (districtId) {
      whereClause.districtId = districtId;
    }

    return await Range.findOne({
      where: whereClause,
      include: [{
        model: District,
        as: 'district',
        attributes: ['id', 'name', 'code'],
        include: [{
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'code']
        }]
      }]
    });
  }

  // Check if range code exists in district
  static async isCodeExists(code, districtId, excludeId = null) {
    const whereClause = { code, districtId };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await Range.count({ where: whereClause });
    return count > 0;
  }

  // Check if range name exists in district
  static async isNameExists(name, districtId, excludeId = null) {
    const whereClause = { name, districtId };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await Range.count({ where: whereClause });
    return count > 0;
  }

  // Get ranges with user count
  static async getRangesWithUserCount(districtId = null, stateId = null) {
    const whereClause = {};
    const includeClause = [];

    if (districtId) {
      whereClause.districtId = districtId;
    }

    if (stateId && !districtId) {
      includeClause.push({
        model: District,
        as: 'district',
        where: { stateId },
        attributes: ['name']
      });
    } else {
      includeClause.push({
        model: District,
        as: 'district',
        attributes: ['name']
      });
    }

    return await Range.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'code',
        [Range.sequelize.fn('COUNT', Range.sequelize.col('users.id')), 'userCount']
      ],
      include: [
        ...includeClause,
        {
          model: User,
          as: 'users',
          attributes: [],
          required: false
        }
      ],
      group: ['Range.id', 'district.id'],
      order: [['name', 'ASC']]
    });
  }

  // Bulk update ranges
  static async bulkUpdateRanges(updates, updatedBy) {
    const promises = updates.map(({ id, ...data }) => 
      Range.update(
        { ...data, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    const updatedIds = updates.map(u => u.id);
    return await Range.findAll({
      where: { id: { [Op.in]: updatedIds } },
      include: [{
        model: District,
        as: 'district',
        attributes: ['id', 'name']
      }]
    });
  }

  // Get ranges for dropdown
  static async getRangesForDropdown(districtId = null, stateId = null) {
    const whereClause = { isActive: true };
    const includeClause = [];

    if (districtId) {
      whereClause.districtId = districtId;
    }

    if (stateId && !districtId) {
      includeClause.push({
        model: District,
        as: 'district',
        where: { stateId },
        attributes: []
      });
    }

    return await Range.findAll({
      where: whereClause,
      ...(includeClause.length && { include: includeClause }),
      attributes: ['id', 'name', 'code', 'districtId'],
      order: [['name', 'ASC']]
    });
  }

  // Get range hierarchy (with district and state)
  static async getRangeHierarchy(rangeId) {
    return await Range.findByPk(rangeId, {
      include: [
        {
          model: District,
          as: 'district',
          attributes: ['id', 'name', 'code'],
          include: [{
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'code']
          }]
        },
        {
          model: CIDPoliceStation,
          as: 'policeStations',
          attributes: ['id', 'name', 'code'],
          where: { isActive: true },
          required: false,
          order: [['name', 'ASC']]
        }
      ]
    });
  }

  // Get ranges by state
  static async getRangesByState(stateId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await Range.findAndCountAll({
      include: [{
        model: District,
        as: 'district',
        where: { stateId },
        attributes: ['id', 'name']
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

  // Get range distribution by district
  static async getRangeDistributionByDistrict(stateId = null) {
    const includeClause = [{
      model: District,
      as: 'district',
      attributes: ['id', 'name'],
      ...(stateId && { where: { stateId } })
    }];

    return await Range.findAll({
      attributes: [
        'districtId',
        [Range.sequelize.fn('COUNT', Range.sequelize.col('Range.id')), 'rangeCount']
      ],
      include: includeClause,
      group: ['districtId', 'district.id'],
      order: [[Range.sequelize.literal('rangeCount'), 'DESC']]
    });
  }

}

module.exports = RangeService;