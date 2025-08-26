const express = require('express');
const router = express.Router();
const controller = require('../controllers/employees.controller');

router.get('/list', controller.getAllEmployees);
router.post('/add', controller.addEmployee);

module.exports = router;