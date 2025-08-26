const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerDashboard.controller');

router.get('/manager/profile', managerController.getManagerProfile);
router.get('/manager/projects', managerController.getManagerProjects);
router.get('/manager/tasks', managerController.getManagerTasks);
router.get('/manager/leaves', managerController.getManagerLeaves);
// router.get('/manager/documents/latest', managerController.getManagerLatestDocument);

module.exports = router;
