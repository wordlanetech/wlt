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
            JOIN projects p ON t.project_id = p.id
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
