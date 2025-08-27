const express = require('express');
const router = express.Router();
const profileController = require('../controllers/projectController');

// GET project by project ID
router.get('/:projectId', projectController.getProjectById);

module.exports = router;
