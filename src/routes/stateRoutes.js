const express = require('express');
const stateController = require('../controllers/stateController');

const router = express.Router();

// Mount state controller routes
router.use('/', stateController);

module.exports = router;

// Get all states
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereCondition = { active: true };
    
    if (search) {
      const { Op } = require('sequelize');
      whereCondition.stateName = { [Op.like]: `%${search}%` };
    }

    const states = await State.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['stateName', 'ASC']]
    });

    const response = getPagingData(states, page, limit);
    res.json(formatResponse(true, 'States retrieved successfully', response));
  } catch (error) {
    next(error);
  }
});

// Get state by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const state = await State.findByPk(id);
    if (!state || !state.active) {
      return res.status(404).json(formatResponse(false, 'State not found'));
    }

    res.json(formatResponse(true, 'State retrieved successfully', state));
  } catch (error) {
    next(error);
  }
});

module.exports = router;