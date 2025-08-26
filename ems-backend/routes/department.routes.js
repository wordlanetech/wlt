const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');

// GET all departments
router.get('/', departmentController.getAllDepartments); // root of /departments


// POST add a new department
router.post('/', departmentController.addDepartment);

module.exports = router;
