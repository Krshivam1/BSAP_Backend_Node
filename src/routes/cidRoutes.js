const express = require('express');

// Import all CID controllers
const cidDistrictController = require('../controllers/cidDistrictController');
const cidPoliceStationController = require('../controllers/cidPoliceStationController');
const cidSubDivisionController = require('../controllers/cidSubDivisionController');
const cidCrimeDataController = require('../controllers/cidCrimeDataController');
const cidCrimeCategoryController = require('../controllers/cidCrimeCategoryController');
const cidCrimeCategoryTypeController = require('../controllers/cidCrimeCategoryTypeController');
const cidCrimeModusController = require('../controllers/cidCrimeModusController');

const router = express.Router();

// Mount all CID controllers with their respective routes
router.use('/districts', cidDistrictController);
router.use('/police-stations', cidPoliceStationController);
router.use('/sub-divisions', cidSubDivisionController);
router.use('/crime-data', cidCrimeDataController);
router.use('/crime-categories', cidCrimeCategoryController);
router.use('/crime-category-types', cidCrimeCategoryTypeController);
router.use('/crime-modus', cidCrimeModusController);

module.exports = router;