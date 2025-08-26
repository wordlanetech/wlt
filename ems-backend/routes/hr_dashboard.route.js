const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/hr_dashboard.controller');

router.get('/summary', dashboardController.getSummary);
router.get('/activities', dashboardController.getRecentActivities);

module.exports = router;
