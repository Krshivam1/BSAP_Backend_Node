const express = require('express');
const rangeController = require('../controllers/rangeController');

const router = express.Router();

// Mount range controller routes
router.use('/', rangeController);

module.exports = router;