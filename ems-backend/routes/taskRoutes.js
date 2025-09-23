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

// PUT update a task
router.put('/:id', taskController.updateTask);

// PATCH assign a task to an employee
router.patch('/:id/assign', taskController.assignTask);

// DELETE a task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
