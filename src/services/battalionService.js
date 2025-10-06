const { Battalion, Range, District } = require('../models');
const { Op } = require('sequelize');

class BattalionService {
  
  static async getAllBattalions(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'battalionName',
        sortOrder = 'ASC',
        search,
        status,
        rangeId,
        districtId
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { battalionName: { [Op.like]: `%${search}%` } },
          { battalionHead: { [Op.like]: `%${search}%` } },
          { battalionEmail: { [Op.like]: `%${search}%` } },
          { battalionContactNo: { [Op.like]: `%${search}%` } },
          { battalionMobileNo: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        whereClause.active = status === 'active';
      }

      if (rangeId) {
        whereClause.rangeId = rangeId;
      }

      if (districtId) {
        whereClause.districtId = districtId;
      }

      const include = [
        {
          model: Range,
          as: 'range',
          attributes: ['id', 'rangeName'],
          required: false
        },
        {
          model: District,
          as: 'district',
          attributes: ['id', 'districtName'],
          required: false
        }
      ];

      const battalions = await Battalion.findAndCountAll({
        where: whereClause,
        include,
        offset,
        limit: parseInt(limit),
        order: [[sortBy, sortOrder]],
        distinct: true
      });

      return {
        data: battalions.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(battalions.count / limit),
          totalItems: battalions.count,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching battalions: ${error.message}`);
    }
  }

  static async getBattalionById(id) {
    try {
      const battalion = await Battalion.findOne({
        where: { id },
        include: [
          {
            model: Range,
            as: 'range',
            attributes: ['id', 'rangeName', 'rangeHead']
          },
          {
            model: District,
            as: 'district',
            attributes: ['id', 'districtName']
          }
        ]
      });

      if (!battalion) {
        throw new Error('Battalion not found');
      }

      return battalion;
    } catch (error) {
      throw new Error(`Error fetching battalion: ${error.message}`);
    }
  }

  static async createBattalion(battalionData, createdBy) {
    try {
      const existingBattalion = await Battalion.findOne({
        where: {
          battalionName: battalionData.battalionName,
          active: true
        }
      });

      if (existingBattalion) {
        throw new Error('Battalion with this name already exists');
      }

      const battalion = await Battalion.create({
        ...battalionData,
        createdBy,
        updatedBy: createdBy
      });

      return await this.getBattalionById(battalion.id);
    } catch (error) {
      throw new Error(`Error creating battalion: ${error.message}`);
    }
  }

  static async updateBattalion(id, battalionData, updatedBy) {
    try {
      const battalion = await Battalion.findByPk(id);
      
      if (!battalion) {
        throw new Error('Battalion not found');
      }

      // Check for duplicate name if name is being updated
      if (battalionData.battalionName && battalionData.battalionName !== battalion.battalionName) {
        const existingBattalion = await Battalion.findOne({
          where: {
            battalionName: battalionData.battalionName,
            active: true,
            id: { [Op.ne]: id }
          }
        });

        if (existingBattalion) {
          throw new Error('Battalion with this name already exists');
        }
      }

      await battalion.update({
        ...battalionData,
        updatedBy
      });

      return await this.getBattalionById(id);
    } catch (error) {
      throw new Error(`Error updating battalion: ${error.message}`);
    }
  }

  static async deleteBattalion(id, deletedBy) {
    try {
      const battalion = await Battalion.findByPk(id);
      
      if (!battalion) {
        throw new Error('Battalion not found');
      }

      // Soft delete by setting active to false
      await battalion.update({
        active: false,
        updatedBy: deletedBy
      });

      return { message: 'Battalion deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting battalion: ${error.message}`);
    }
  }

  static async toggleBattalionStatus(id, updatedBy) {
    try {
      const battalion = await Battalion.findByPk(id);
      
      if (!battalion) {
        throw new Error('Battalion not found');
      }

      await battalion.update({
        active: !battalion.active,
        updatedBy
      });

      return await this.getBattalionById(id);
    } catch (error) {
      throw new Error(`Error toggling battalion status: ${error.message}`);
    }
  }

  static async getBattalionsByRange(rangeId) {
    try {
      const battalions = await Battalion.findAll({
        where: {
          rangeId,
          active: true
        },
        include: [
          {
            model: Range,
            as: 'range',
            attributes: ['id', 'rangeName']
          },
          {
            model: District,
            as: 'district',
            attributes: ['id', 'districtName']
          }
        ],
        order: [['battalionName', 'ASC']]
      });

      return battalions;
    } catch (error) {
      throw new Error(`Error fetching battalions by range: ${error.message}`);
    }
  }

  static async getBattalionsByDistrict(districtId) {
    try {
      const battalions = await Battalion.findAll({
        where: {
          districtId,
          active: true
        },
        include: [
          {
            model: Range,
            as: 'range',
            attributes: ['id', 'rangeName']
          },
          {
            model: District,
            as: 'district',
            attributes: ['id', 'districtName']
          }
        ],
        order: [['battalionName', 'ASC']]
      });

      return battalions;
    } catch (error) {
      throw new Error(`Error fetching battalions by district: ${error.message}`);
    }
  }
}

module.exports = BattalionService;