const express = require('express');
const rangeController = require('../controllers/rangeController');

const router = express.Router();

// Mount range controller routes
router.use('/', rangeController);

module.exports = router;

// Get all ranges
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page, size, stateId, search } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereCondition = { active: true };
    
    if (stateId) whereCondition.stateId = stateId;
    
    if (search) {
      const { Op } = require('sequelize');
      whereCondition.rangeName = { [Op.like]: `%${search}%` };
    }

    const ranges = await Range.findAndCountAll({
      where: whereCondition,
      include: [{ model: State, as: 'state' }],
      limit,
      offset,
      order: [['rangeName', 'ASC']]
    });

    const response = getPagingData(ranges, page, limit);
    res.json(formatResponse(true, 'Ranges retrieved successfully', response));
  } catch (error) {
    next(error);
  }
});

// Get range by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const range = await Range.findByPk(id, {
      include: [{ model: State, as: 'state' }]
    });
    
    if (!range || !range.active) {
      return res.status(404).json(formatResponse(false, 'Range not found'));
    }

    res.json(formatResponse(true, 'Range retrieved successfully', range));
  } catch (error) {
    next(error);
  }
});

module.exports = router;