const pool = require('../config/db');

// Get all tasks (with project name + date formatting)
exports.getAllTasks = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                t.id, 
                t.task_id,
                t.name, 
                t.description, 
                t.status, 
                DATE_FORMAT(t.start_date, '%Y-%m-%d') AS start_date,
                DATE_FORMAT(t.end_date, '%Y-%m-%d') AS end_date,
                t.assigned_by,
                t.project_id,
                p.name AS project_name
            FROM emp_tasks t
            JOIN emp_projects p ON t.project_id = p.id`
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get task by ID (with project name + date formatting)
exports.getTaskById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT 
                t.id, 
                t.name, 
                t.description, 
                t.status, 
                DATE_FORMAT(t.start_date, '%Y-%m-%d') AS start_date,
                DATE_FORMAT(t.end_date, '%Y-%m-%d') AS end_date,
                t.assigned_by,
                t.project_id,
                p.name AS project_name
            FROM emp_tasks t
            JOIN emp_projects p ON t.project_id = p.id
            WHERE t.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    const {
        emp_id,
        project_id,
        name,
        description,
        status,
        start_date,
        end_date,
        assigned_by
    } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO emp_tasks (
                emp_id, project_id, name, description, status, start_date, end_date, assigned_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [emp_id, project_id, name, description, status, start_date, end_date, assigned_by]
        );

        res.status(201).json({ message: 'Task created', taskId: result.insertId });
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Mark a task as complete
exports.markTaskComplete = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            'UPDATE emp_tasks SET status = ?, updated_at = NOW() WHERE id = ?',
            ['Completed', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task marked as complete' });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    console.log('Delete task endpoint hit with ID:', id);
    console.log('User from auth middleware:', req.user);
    
    try {
        // First, check if the task exists
        const [existingTask] = await pool.query('SELECT id FROM emp_tasks WHERE id = ?', [id]);
        console.log('Existing task check result:', existingTask);
        
        if (existingTask.length === 0) {
            console.log('Task not found for deletion');
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Attempt to delete the task
        const [result] = await pool.query('DELETE FROM emp_tasks WHERE id = ?', [id]);
        console.log('Delete operation result:', result);

        if (result.affectedRows === 0) {
            console.log('Task found but not deleted');
            return res.status(404).json({ error: 'Task not found or could not be deleted' });
        }

        console.log('Task deleted successfully');
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err);
        // Provide more detailed error information
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(400).json({ 
                error: 'Cannot delete task because it is referenced by other records',
                details: 'This task might be associated with other data in the system. Please remove any related data first.'
            });
        }
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: err.message 
        });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const {
        emp_id,
        project_id,
        name,
        description,
        status,
        start_date,
        end_date,
        assigned_by
    } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE emp_tasks SET 
                emp_id = ?, project_id = ?, name = ?, description = ?, status = ?, 
                start_date = ?, end_date = ?, assigned_by = ?, updated_at = NOW()
             WHERE id = ?`,
            [emp_id, project_id, name, description, status, start_date, end_date, assigned_by, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task updated successfully' });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Assign a task to an employee
exports.assignTask = async (req, res) => {
    const { id } = req.params;
    const { emp_id } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE emp_tasks SET emp_id = ? WHERE id = ?',
            [emp_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task assigned successfully' });
    } catch (err) {
        console.error('Error assigning task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
