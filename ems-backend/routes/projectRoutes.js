const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth.middleware');

// Protected routes
router.get('/', authMiddleware, projectController.getProjects);
router.post('/', authMiddleware, projectController.createProject);

module.exports = router;
