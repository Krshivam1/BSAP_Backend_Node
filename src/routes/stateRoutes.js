const express = require('express');
const stateController = require('../controllers/stateController');

const router = express.Router();

// Mount state controller routes
router.use('/', stateController);

module.exports = router;