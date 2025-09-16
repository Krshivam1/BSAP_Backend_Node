const express = require('express');
const topicController = require('../controllers/topicController');

const router = express.Router();

// Use the actual topic controller router
router.use('/', topicController);

module.exports = router;