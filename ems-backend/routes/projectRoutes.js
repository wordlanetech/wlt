// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/projects - get all projects
router.get('/', authMiddleware, projectController.getProjects);

// POST /api/projects - create a project
router.post('/', authMiddleware, projectController.createProject);

module.exports = router;
