const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/a_dashboard.controller');

// GET https://dashboard.wordlanetech.com/api/dashboard-stats
router.get('/dashboard-stats', dashboardController.getDashboardStats);

module.exports = router;
