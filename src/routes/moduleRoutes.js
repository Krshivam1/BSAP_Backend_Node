const express = require('express');
const moduleController = require('../controllers/moduleController');

const router = express.Router();

// Use the actual module controller router
router.use('/', moduleController);

module.exports = router;