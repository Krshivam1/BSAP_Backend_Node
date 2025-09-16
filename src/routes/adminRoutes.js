const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Mount admin controller routes
router.use('/', adminController);

module.exports = router;