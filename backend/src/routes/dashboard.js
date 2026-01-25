/**
 * Routes pour le dashboard admin
 */

const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validator');

const zoneIdValidation = [
  param('zoneId').isUUID()
];

const periodValidation = [
  query('period').optional().isIn(['7d', '30d', '90d', '1y'])
];

router.use(authenticateToken);

router.get('/stats', dashboardController.getGlobalStats);
router.get('/zone/:zoneId', zoneIdValidation, validate, dashboardController.getZoneStats);
router.get('/zone/:zoneId/period', zoneIdValidation, periodValidation, validate, dashboardController.getStatsByPeriod);

module.exports = router;

