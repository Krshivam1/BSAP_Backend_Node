const express = require('express');
const menuController = require('../controllers/menuController');

const router = express.Router();

// Use the actual menu controller router
router.use('/', menuController);

module.exports = router;