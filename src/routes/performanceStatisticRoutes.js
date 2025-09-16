const express = require('express');
const performanceStatisticController = require('../controllers/performanceStatisticController');

const router = express.Router();

// Use the actual controller router instead of placeholder routes
router.use('/', performanceStatisticController);

module.exports = router;