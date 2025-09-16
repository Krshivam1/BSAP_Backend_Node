const express = require('express');
const subTopicController = require('../controllers/subTopicController');

const router = express.Router();

// Use the actual subtopic controller router
router.use('/', subTopicController);

module.exports = router;