const express = require('express');
const districtController = require('../controllers/districtController');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Mount district controller routes
router.use('/', districtController);

module.exports = router;

// Get all districts
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page, size, rangeId, search } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereCondition = { active: true };
    
    if (rangeId) whereCondition.rangeId = rangeId;
    
    if (search) {
      const { Op } = require('sequelize');
      whereCondition.districtName = { [Op.like]: `%${search}%` };
    }

    const districts = await District.findAndCountAll({
      where: whereCondition,
      include: [{ model: Range, as: 'range' }],
      limit,
      offset,
      order: [['districtName', 'ASC']]
    });

    const response = getPagingData(districts, page, limit);
    res.json(formatResponse(true, 'Districts retrieved successfully', response));
  } catch (error) {
    next(error);
  }
});

// Get district by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const district = await District.findByPk(id, {
      include: [{ model: Range, as: 'range' }]
    });
    
    if (!district || !district.active) {
      return res.status(404).json(formatResponse(false, 'District not found'));
    }

    res.json(formatResponse(true, 'District retrieved successfully', district));
  } catch (error) {
    next(error);
  }
});

module.exports = router;