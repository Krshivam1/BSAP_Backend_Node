const { State } = require('../models');
const { Op } = require('sequelize');

class StateService {
  
  static async getAllStates(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'stateName',
        sortOrder = 'ASC',
        search,
        status
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { stateName: { [Op.like]: `%${search}%` } },
          { stateDescription: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        whereClause.active = status === 'active';
      }

      const { count, rows } = await State.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]]
      });

      return {
        states: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('Error in getAllStates:', error);
      throw error;
    }
  }

  static async getStateById(id) {
    try {
      return await State.findByPk(id);
    } catch (error) {
      console.error('Error in getStateById:', error);
      throw error;
    }
  }

  static async getStateByName(stateName) {
    try {
      return await State.findOne({
        where: { stateName }
      });
    } catch (error) {
      console.error('Error in getStateByName:', error);
      throw error;
    }
  }

  static async createState(stateData) {
    try {
      if (!stateData.stateName || stateData.stateName.trim() === '') {
        throw new Error('State name is required');
      }
      stateData.stateName = stateData.stateName.trim();
      
      if (stateData.stateDescription) {
        stateData.stateDescription = stateData.stateDescription.trim();
      }

      return await State.create(stateData);
    } catch (error) {
      console.error('Error in createState:', error);
      throw error;
    }
  }

  static async updateState(id, stateData) {
    try {
      const state = await State.findByPk(id);
      if (!state) return null;

      if (stateData.stateName) {
        stateData.stateName = stateData.stateName.trim();
      }

      if (stateData.stateDescription) {
        stateData.stateDescription = stateData.stateDescription.trim();
      }

      await state.update(stateData);
      return state;
    } catch (error) {
      console.error('Error in updateState:', error);
      throw error;
    }
  }

  static async deleteState(id) {
    try {
      const state = await State.findByPk(id);
      if (!state) return false;

      await state.destroy();
      return true;
    } catch (error) {
      console.error('Error in deleteState:', error);
      throw error;
    }
  }

  static async getActiveStates() {
    try {
      return await State.findAll({
        where: { active: true },
        order: [['stateName', 'ASC']]
      });
    } catch (error) {
      console.error('Error in getActiveStates:', error);
      throw error;
    }
  }

  static async toggleStateStatus(id, active) {
    try {
      const state = await State.findByPk(id);
      if (!state) return null;

      await state.update({ active });
      return state;
    } catch (error) {
      console.error('Error in toggleStateStatus:', error);
      throw error;
    }
  }

  static async activateState(id, updatedBy) {
    try {
      const state = await State.findByPk(id);
      if (!state) return null;

      await state.update({
        active: true,
        updatedBy
      });

      return state;
    } catch (error) {
      console.error('Error in activateState:', error);
      throw error;
    }
  }

  static async deactivateState(id, updatedBy) {
    try {
      const state = await State.findByPk(id);
      if (!state) return null;

      await state.update({
        active: false,
        updatedBy
      });

      return state;
    } catch (error) {
      console.error('Error in deactivateState:', error);
      throw error;
    }
  }

  static async getStateStatistics() {
    try {
      const [
        totalStates,
        activeStates
      ] = await Promise.all([
        State.count(),
        State.count({ where: { active: true } })
      ]);

      return {
        totalStates,
        activeStates,
        inactiveStates: totalStates - activeStates
      };
    } catch (error) {
      console.error('Error in getStateStatistics:', error);
      throw error;
    }
  }
}

module.exports = StateService;