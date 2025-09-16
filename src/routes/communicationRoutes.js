const express = require('express');
const communicationController = require('../controllers/communicationController');

const router = express.Router();

// Use the actual communication controller router
router.use('/', communicationController);

module.exports = router;