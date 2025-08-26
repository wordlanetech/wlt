const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');

router.get('/projects/list', managerController.getManagerProjectsList);

module.exports = router;
