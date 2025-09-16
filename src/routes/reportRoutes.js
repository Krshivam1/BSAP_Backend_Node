const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

// Use the actual report controller router
router.use('/', reportController);

module.exports = router;