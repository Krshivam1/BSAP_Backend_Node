const express = require('express');
const fileController = require('../controllers/fileController');

const router = express.Router();

// Mount file controller routes
router.use('/', fileController);

module.exports = router;