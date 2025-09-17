const express = require('express');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/performanceStatisticController');

const router = express.Router();

// Define endpoints and delegate to controller handlers
router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.detail);
router.post('/', authenticate, controller.create);
router.post('/save-statistics', authenticate, controller.bulkSave);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.remove);
router.post('/:id/make-active', authenticate, controller.makeActive);

router.get('/user/:userId', authenticate, controller.byUser);
router.get('/user/:userId/month/:monthYear', authenticate, controller.byUserMonth);

router.get('/summary', authenticate, controller.summary);
router.get('/labels', authenticate, controller.labels);
router.post('/labels/filter', authenticate, controller.labelsFilter);
router.post('/report-values', authenticate, controller.reportValues);
router.get('/count/user/:userId/date/:date', authenticate, controller.countByUserDate);
router.get('/success-count/user/:userId/date/:date', authenticate, controller.successCountByUserDate);

module.exports = router;