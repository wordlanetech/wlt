// controllers/attendance.controller.js
const pool = require('../config/db');

// Get all attendance records
exports.getAllAttendance = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                a.id, 
                a.employee_id, 
                CONCAT(e.first_name, ' ', e.last_name) AS employee_name, 
                a.date AS date, 
                a.punch_in_time AS checked_in_at, 
                a.punch_out_time AS checked_out_at
            FROM emp_attendances a
            INNER JOIN emp_employees e ON a.employee_id = e.user_id
            ORDER BY a.date ASC
        `);

        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('Error fetching attendance:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch attendance records', error: err.message });
    }
};
