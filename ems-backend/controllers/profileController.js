const db = require('../config/db'); // Use your existing DB connection

// Get profile by user_id
exports.getProfileByUserId = async (req, res) => {
    const userId = req.params.userId;

    try {
        const [rows] = await db.execute(
            `SELECT 
                e.user_id AS employee_id,
                CONCAT(e.first_name, ' ', e.last_name) AS full_name,
                r.name AS role,
                e.email,
                e.phone AS phone_number,
                e.address,
                d.name AS department,
                CONCAT(m.first_name, ' ', m.last_name) AS manager,
                DATE_FORMAT(e.joining_date, '%Y-%m-%d') AS joining_date,
                e.status
             FROM emp_employees e
             LEFT JOIN emp_roles r ON e.role_id = r.id
             LEFT JOIN emp_employees m ON e.manager = m.id
             LEFT JOIN emp_departments d ON e.department_id = d.id
             WHERE e.user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
 