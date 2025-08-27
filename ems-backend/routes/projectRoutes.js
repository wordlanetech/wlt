const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Correct way:
router.get('/', projectController.getProjects);       // no () at the end
router.post('/', projectController.createProject);   // no () at the end

module.exports = router;
