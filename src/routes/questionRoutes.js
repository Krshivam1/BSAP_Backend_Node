const express = require('express');
const questionController = require('../controllers/questionController');

const router = express.Router();

// Use the actual question controller router
router.use('/', questionController);

module.exports = router;