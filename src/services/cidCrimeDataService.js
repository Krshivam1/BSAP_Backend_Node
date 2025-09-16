const { 
  CIDCrimeData, 
  CIDCrimeCategory, 
  CIDCrimeCategoryType, 
  CIDCrimeModus, 
  CIDDistrict, 
  CIDPoliceStation, 
  CIDSubDivision,
  CIDCrimeVictimPerson,
  CIDCrimeAccusedPerson,
  CIDCrimeDeceasedPerson,
  User 
} = require('../models');
const logger = require('../utils/logger');
const { Op, Sequelize } = require('sequelize');

class CIDCrimeDataService {
  /**
   * Get all CID crime data with pagination and filtering
   * @param {Object} filters - Filtering options
   * @returns {Object} Paginated crime data
   */
  async getAllCrimeData(filters = {}) {
    const { 
      page = 1, 
      limit = 20, 
      active = true, 
      categoryId, 
      categoryTypeId, 
      districtId, 
      policeStationId, 
      subDivisionId,
      dateFrom,
      dateTo,
      search
    } = filters;

    const offset = (page - 1) * limit;
    const whereCondition = { active };

    // Apply filters
    if (categoryId) whereCondition.categoryId = categoryId;
    if (categoryTypeId) whereCondition.categoryTypeId = categoryTypeId;
    if (districtId) whereCondition.districtId = districtId;
    if (policeStationId) whereCondition.policeStationId = policeStationId;
    if (subDivisionId) whereCondition.subDivisionId = subDivisionId;

    // Date range filter
    if (dateFrom && dateTo) {
      whereCondition.dateOfOccurrence = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    } else if (dateFrom) {
      whereCondition.dateOfOccurrence = {
        [Op.gte]: new Date(dateFrom)
      };
    } else if (dateTo) {
      whereCondition.dateOfOccurrence = {
        [Op.lte]: new Date(dateTo)
      };
    }

    // Search functionality
    if (search) {
      whereCondition[Op.or] = [
        { firNumber: { [Op.like]: `%${search}%` } },
        { crimeNumber: { [Op.like]: `%${search}%` } },
        { placeOfOccurrence: { [Op.like]: `%${search}%` } },
        { briefFacts: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await CIDCrimeData.findAndCountAll({
      where: whereCondition,
      include: [
        { model: CIDCrimeCategory, as: 'category' },
        { model: CIDCrimeCategoryType, as: 'categoryType' },
        { model: CIDCrimeModus, as: 'modus' },
        { model: CIDDistrict, as: 'district' },
        { model: CIDPoliceStation, as: 'policeStation' },
        { model: CIDSubDivision, as: 'subDivision' },
        { 
          model: CIDCrimeVictimPerson, 
          as: 'victims',
          where: { active: true },
          required: false
        },
        { 
          model: CIDCrimeAccusedPerson, 
          as: 'accused',
          where: { active: true },
          required: false
        },
        { 
          model: CIDCrimeDeceasedPerson, 
          as: 'deceased',
          where: { active: true },
          required: false
        }
      ],
      limit,
      offset,
      order: [['dateOfOccurrence', 'DESC']]
    });

    return {
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      hasNext: page < Math.ceil(count / limit),
      hasPrev: page > 1
    };
  }

  /**
   * Get crime data by ID
   * @param {number} id - Crime data ID
   * @returns {Object} Crime data
   */
  async getCrimeDataById(id) {
    const crimeData = await CIDCrimeData.findByPk(id, {
      include: [
        { model: CIDCrimeCategory, as: 'category' },
        { model: CIDCrimeCategoryType, as: 'categoryType' },
        { model: CIDCrimeModus, as: 'modus' },
        { model: CIDDistrict, as: 'district' },
        { model: CIDPoliceStation, as: 'policeStation' },
        { model: CIDSubDivision, as: 'subDivision' },
        { 
          model: CIDCrimeVictimPerson, 
          as: 'victims',
          where: { active: true },
          required: false
        },
        { 
          model: CIDCrimeAccusedPerson, 
          as: 'accused',
          where: { active: true },
          required: false
        },
        { 
          model: CIDCrimeDeceasedPerson, 
          as: 'deceased',
          where: { active: true },
          required: false
        }
      ]
    });

    if (!crimeData || !crimeData.active) {
      throw new Error('Crime data not found');
    }

    return crimeData;
  }

  /**
   * Create new crime data
   * @param {Object} data - Crime data
   * @param {number} createdBy - User ID who created the record
   * @returns {Object} Created crime data
   */
  async createCrimeData(data, createdBy) {
    const {
      firNumber,
      crimeNumber,
      categoryId,
      categoryTypeId,
      modusId,
      districtId,
      policeStationId,
      subDivisionId,
      dateOfOccurrence,
      timeOfOccurrence,
      placeOfOccurrence,
      briefFacts,
      victims = [],
      accused = [],
      deceased = []
    } = data;

    // Validation
    if (!firNumber || !categoryId || !districtId || !dateOfOccurrence) {
      throw new Error('FIR number, category, district, and date of occurrence are required');
    }

    // Check if FIR number already exists
    const existingCrime = await CIDCrimeData.findOne({
      where: { firNumber, active: true }
    });

    if (existingCrime) {
      throw new Error('Crime data with this FIR number already exists');
    }

    // Create crime data
    const crimeData = await CIDCrimeData.create({
      firNumber,
      crimeNumber,
      categoryId,
      categoryTypeId,
      modusId,
      districtId,
      policeStationId,
      subDivisionId,
      dateOfOccurrence: new Date(dateOfOccurrence),
      timeOfOccurrence,
      placeOfOccurrence,
      briefFacts,
      active: true,
      createdBy
    });

    // Add victims
    if (victims.length > 0) {
      const victimRecords = victims.map(victim => ({
        crimeDataId: crimeData.id,
        ...victim,
        active: true,
        createdBy
      }));
      await CIDCrimeVictimPerson.bulkCreate(victimRecords);
    }

    // Add accused
    if (accused.length > 0) {
      const accusedRecords = accused.map(person => ({
        crimeDataId: crimeData.id,
        ...person,
        active: true,
        createdBy
      }));
      await CIDCrimeAccusedPerson.bulkCreate(accusedRecords);
    }

    // Add deceased
    if (deceased.length > 0) {
      const deceasedRecords = deceased.map(person => ({
        crimeDataId: crimeData.id,
        ...person,
        active: true,
        createdBy
      }));
      await CIDCrimeDeceasedPerson.bulkCreate(deceasedRecords);
    }

    logger.info(`Crime data created with FIR ${firNumber} by user ${createdBy}`);

    // Return crime data with associations
    return await this.getCrimeDataById(crimeData.id);
  }

  /**
   * Update crime data
   * @param {number} id - Crime data ID
   * @param {Object} updateData - Update data
   * @param {number} updatedBy - User ID who updated the record
   * @returns {Object} Updated crime data
   */
  async updateCrimeData(id, updateData, updatedBy) {
    const crimeData = await CIDCrimeData.findByPk(id);
    if (!crimeData || !crimeData.active) {
      throw new Error('Crime data not found');
    }

    // Check FIR number uniqueness if being updated
    if (updateData.firNumber && updateData.firNumber !== crimeData.firNumber) {
      const existingCrime = await CIDCrimeData.findOne({
        where: { 
          firNumber: updateData.firNumber, 
          active: true,
          id: { [Op.ne]: id }
        }
      });

      if (existingCrime) {
        throw new Error('Crime data with this FIR number already exists');
      }
    }

    // Update date if provided
    if (updateData.dateOfOccurrence) {
      updateData.dateOfOccurrence = new Date(updateData.dateOfOccurrence);
    }

    updateData.updatedBy = updatedBy;

    await crimeData.update(updateData);

    logger.info(`Crime data ${id} updated by user ${updatedBy}`);

    return await this.getCrimeDataById(id);
  }

  /**
   * Delete crime data (soft delete)
   * @param {number} id - Crime data ID
   * @param {number} deletedBy - User ID who deleted the record
   * @returns {Object} Response
   */
  async deleteCrimeData(id, deletedBy) {
    const crimeData = await CIDCrimeData.findByPk(id);
    if (!crimeData || !crimeData.active) {
      throw new Error('Crime data not found');
    }

    await crimeData.update({
      active: false,
      updatedBy: deletedBy
    });

    // Soft delete related persons
    await CIDCrimeVictimPerson.update(
      { active: false, updatedBy: deletedBy },
      { where: { crimeDataId: id } }
    );

    await CIDCrimeAccusedPerson.update(
      { active: false, updatedBy: deletedBy },
      { where: { crimeDataId: id } }
    );

    await CIDCrimeDeceasedPerson.update(
      { active: false, updatedBy: deletedBy },
      { where: { crimeDataId: id } }
    );

    logger.info(`Crime data ${id} deleted by user ${deletedBy}`);

    return {
      success: true,
      message: 'Crime data deleted successfully'
    };
  }

  /**
   * Get crime statistics
   * @param {Object} filters - Filter options
   * @returns {Object} Crime statistics
   */
  async getCrimeStatistics(filters = {}) {
    const { 
      districtId, 
      categoryId, 
      dateFrom, 
      dateTo, 
      year 
    } = filters;

    const whereCondition = { active: true };

    if (districtId) whereCondition.districtId = districtId;
    if (categoryId) whereCondition.categoryId = categoryId;

    // Date filters
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      whereCondition.dateOfOccurrence = {
        [Op.between]: [startDate, endDate]
      };
    } else if (dateFrom && dateTo) {
      whereCondition.dateOfOccurrence = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    }

    // Total crimes
    const totalCrimes = await CIDCrimeData.count({ where: whereCondition });

    // Crimes by category
    const crimesByCategory = await CIDCrimeData.findAll({
      attributes: [
        'categoryId',
        [Sequelize.fn('COUNT', Sequelize.col('CIDCrimeData.id')), 'count']
      ],
      include: [
        { model: CIDCrimeCategory, as: 'category', attributes: ['categoryName'] }
      ],
      where: whereCondition,
      group: ['categoryId', 'category.id'],
      raw: false
    });

    // Crimes by district
    const crimesByDistrict = await CIDCrimeData.findAll({
      attributes: [
        'districtId',
        [Sequelize.fn('COUNT', Sequelize.col('CIDCrimeData.id')), 'count']
      ],
      include: [
        { model: CIDDistrict, as: 'district', attributes: ['districtName'] }
      ],
      where: whereCondition,
      group: ['districtId', 'district.id'],
      raw: false
    });

    // Monthly trend (for current year or specified date range)
    const monthlyTrend = await CIDCrimeData.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('dateOfOccurrence')), 'month'],
        [Sequelize.fn('YEAR', Sequelize.col('dateOfOccurrence')), 'year'],
        [Sequelize.fn('COUNT', Sequelize.col('CIDCrimeData.id')), 'count']
      ],
      where: whereCondition,
      group: [
        Sequelize.fn('YEAR', Sequelize.col('dateOfOccurrence')),
        Sequelize.fn('MONTH', Sequelize.col('dateOfOccurrence'))
      ],
      order: [
        [Sequelize.fn('YEAR', Sequelize.col('dateOfOccurrence')), 'ASC'],
        [Sequelize.fn('MONTH', Sequelize.col('dateOfOccurrence')), 'ASC']
      ],
      raw: true
    });

    return {
      totalCrimes,
      crimesByCategory: crimesByCategory.map(item => ({
        categoryName: item.category.categoryName,
        count: parseInt(item.get('count'))
      })),
      crimesByDistrict: crimesByDistrict.map(item => ({
        districtName: item.district.districtName,
        count: parseInt(item.get('count'))
      })),
      monthlyTrend
    };
  }

  /**
   * Search crime data
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Array} Matching crime data
   */
  async searchCrimeData(searchTerm, filters = {}) {
    const { categoryId, districtId, limit = 50 } = filters;

    const whereCondition = {
      active: true,
      [Op.or]: [
        { firNumber: { [Op.like]: `%${searchTerm}%` } },
        { crimeNumber: { [Op.like]: `%${searchTerm}%` } },
        { placeOfOccurrence: { [Op.like]: `%${searchTerm}%` } },
        { briefFacts: { [Op.like]: `%${searchTerm}%` } }
      ]
    };

    if (categoryId) whereCondition.categoryId = categoryId;
    if (districtId) whereCondition.districtId = districtId;

    const crimeData = await CIDCrimeData.findAll({
      where: whereCondition,
      include: [
        { model: CIDCrimeCategory, as: 'category' },
        { model: CIDDistrict, as: 'district' },
        { model: CIDPoliceStation, as: 'policeStation' }
      ],
      limit,
      order: [['dateOfOccurrence', 'DESC']]
    });

    return crimeData;
  }

  /**
   * Get crimes by active status
   * @param {boolean} active - Active status
   * @returns {Array} Crime data
   */
  async getCrimesByActiveStatus(active) {
    const crimeData = await CIDCrimeData.findAll({
      where: { active },
      include: [
        { model: CIDCrimeCategory, as: 'category' },
        { model: CIDDistrict, as: 'district' },
        { model: CIDPoliceStation, as: 'policeStation' }
      ],
      order: [['dateOfOccurrence', 'DESC']]
    });

    return crimeData;
  }

  /**
   * Add victim to crime data
   * @param {number} crimeDataId - Crime data ID
   * @param {Object} victimData - Victim data
   * @param {number} createdBy - User ID who added the victim
   * @returns {Object} Created victim record
   */
  async addVictim(crimeDataId, victimData, createdBy) {
    // Verify crime data exists
    const crimeData = await CIDCrimeData.findByPk(crimeDataId);
    if (!crimeData || !crimeData.active) {
      throw new Error('Crime data not found');
    }

    const victim = await CIDCrimeVictimPerson.create({
      crimeDataId,
      ...victimData,
      active: true,
      createdBy
    });

    logger.info(`Victim added to crime data ${crimeDataId} by user ${createdBy}`);
    return victim;
  }

  /**
   * Add accused to crime data
   * @param {number} crimeDataId - Crime data ID
   * @param {Object} accusedData - Accused data
   * @param {number} createdBy - User ID who added the accused
   * @returns {Object} Created accused record
   */
  async addAccused(crimeDataId, accusedData, createdBy) {
    // Verify crime data exists
    const crimeData = await CIDCrimeData.findByPk(crimeDataId);
    if (!crimeData || !crimeData.active) {
      throw new Error('Crime data not found');
    }

    const accused = await CIDCrimeAccusedPerson.create({
      crimeDataId,
      ...accusedData,
      active: true,
      createdBy
    });

    logger.info(`Accused added to crime data ${crimeDataId} by user ${createdBy}`);
    return accused;
  }

  /**
   * Add deceased to crime data
   * @param {number} crimeDataId - Crime data ID
   * @param {Object} deceasedData - Deceased data
   * @param {number} createdBy - User ID who added the deceased
   * @returns {Object} Created deceased record
   */
  async addDeceased(crimeDataId, deceasedData, createdBy) {
    // Verify crime data exists
    const crimeData = await CIDCrimeData.findByPk(crimeDataId);
    if (!crimeData || !crimeData.active) {
      throw new Error('Crime data not found');
    }

    const deceased = await CIDCrimeDeceasedPerson.create({
      crimeDataId,
      ...deceasedData,
      active: true,
      createdBy
    });

    logger.info(`Deceased added to crime data ${crimeDataId} by user ${createdBy}`);
    return deceased;
  }
}

module.exports = new CIDCrimeDataService();