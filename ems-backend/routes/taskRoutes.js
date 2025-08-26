const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController'); // adjust path if needed

// GET all tasks
router.get('/', taskController.getAllTasks);

// GET task by ID
router.get('/:id', taskController.getTaskById);

// POST create a new task
router.post('/', taskController.createTask);

// PATCH mark a task as complete
router.patch('/:id/complete', taskController.markTaskComplete);

module.exports = router;
