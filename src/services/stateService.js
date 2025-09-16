const { State, District, User } = require('../models');
const { Op } = require('sequelize');

class StateService {
  
  // Get all states with pagination and filtering
  static async getAllStates(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC',
      search
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

    const { count, rows } = await State.findAndCountAll({
      where: whereClause,
      include: [{
        model: District,
        as: 'districts',
        attributes: ['id', 'name'],
        required: false
      }],
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });

    return {
      states: rows,
      total: count
    };
  }

  // Get state by ID
  static async getStateById(id) {
    return await State.findByPk(id, {
      include: [{
        model: District,
        as: 'districts',
        attributes: ['id', 'name', 'code', 'isActive'],
        order: [['name', 'ASC']]
      }]
    });
  }

  // Create new state
  static async createState(stateData) {
    return await State.create(stateData);
  }

  // Update state
  static async updateState(id, stateData) {
    const state = await State.findByPk(id);
    if (!state) return null;

    await state.update(stateData);
    return await this.getStateById(id);
  }

  // Delete state
  static async deleteState(id) {
    const state = await State.findByPk(id);
    if (!state) return false;

    // Check if state has districts
    const districtCount = await District.count({ where: { stateId: id } });
    if (districtCount > 0) {
      throw new Error('Cannot delete state with existing districts');
    }

    await state.destroy();
    return true;
  }

  // Search states
  static async searchStates(options = {}) {
    const {
      page = 1,
      limit = 10,
      search
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    };

    const { count, rows } = await State.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      states: rows,
      total: count
    };
  }

  // Get districts by state
  static async getDistrictsByState(stateId, options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await District.findAndCountAll({
      where: { stateId },
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      districts: rows,
      total: count
    };
  }

  // Get active states
  static async getActiveStates() {
    return await State.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'code']
    });
  }

  // Activate state
  static async activateState(id, updatedBy) {
    const state = await State.findByPk(id);
    if (!state) return null;

    await state.update({
      isActive: true,
      updatedBy
    });

    return state;
  }

  // Deactivate state
  static async deactivateState(id, updatedBy) {
    const state = await State.findByPk(id);
    if (!state) return null;

    await state.update({
      isActive: false,
      updatedBy
    });

    return state;
  }

  // Get state statistics
  static async getStateStatistics() {
    const [
      totalStates,
      activeStates,
      statesWithDistricts
    ] = await Promise.all([
      State.count(),
      State.count({ where: { isActive: true } }),
      State.count({
        include: [{
          model: District,
          as: 'districts',
          required: true
        }]
      })
    ]);

    const districtCounts = await State.findAll({
      attributes: [
        'id',
        'name',
        [State.sequelize.fn('COUNT', State.sequelize.col('districts.id')), 'districtCount']
      ],
      include: [{
        model: District,
        as: 'districts',
        attributes: [],
        required: false
      }],
      group: ['State.id'],
      order: [[State.sequelize.literal('districtCount'), 'DESC']]
    });

    return {
      totalStates,
      activeStates,
      inactiveStates: totalStates - activeStates,
      statesWithDistricts,
      statesWithoutDistricts: totalStates - statesWithDistricts,
      districtCounts: districtCounts.map(state => ({
        id: state.id,
        name: state.name,
        districtCount: parseInt(state.dataValues.districtCount) || 0
      }))
    };
  }

  // Get state by code
  static async getStateByCode(code) {
    return await State.findOne({
      where: { code },
      include: [{
        model: District,
        as: 'districts',
        attributes: ['id', 'name', 'code']
      }]
    });
  }

  // Check if state code exists
  static async isCodeExists(code, excludeId = null) {
    const whereClause = { code };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await State.count({ where: whereClause });
    return count > 0;
  }

  // Check if state name exists
  static async isNameExists(name, excludeId = null) {
    const whereClause = { name };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await State.count({ where: whereClause });
    return count > 0;
  }

  // Get states with user count
  static async getStatesWithUserCount() {
    return await State.findAll({
      attributes: [
        'id',
        'name',
        'code',
        [State.sequelize.fn('COUNT', State.sequelize.col('users.id')), 'userCount']
      ],
      include: [{
        model: User,
        as: 'users',
        attributes: [],
        required: false
      }],
      group: ['State.id'],
      order: [['name', 'ASC']]
    });
  }

  // Bulk update states
  static async bulkUpdateStates(updates, updatedBy) {
    const promises = updates.map(({ id, ...data }) => 
      State.update(
        { ...data, updatedBy },
        { where: { id } }
      )
    );

    await Promise.all(promises);
    
    const updatedIds = updates.map(u => u.id);
    return await State.findAll({
      where: { id: { [Op.in]: updatedIds } }
    });
  }

  // Get states for dropdown
  static async getStatesForDropdown() {
    return await State.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'code'],
      order: [['name', 'ASC']]
    });
  }

}

module.exports = StateService;