const db = require('../config/db');

// Get single employee card by userId
exports.getCardByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        e.user_id,
        CONCAT(e.first_name, ' ', e.last_name) AS full_name,
        e.email,
        e.phone,
        e.address,
        d.name AS department,
        CONCAT(COALESCE(m.first_name, ''), ' ', COALESCE(m.last_name, '')) AS manager,
        e.joining_date,
        COALESCE(s.name, 'N/A') AS status
      FROM emp_employees e
      LEFT JOIN emp_departments d ON d.id = e.department_id
      LEFT JOIN emp_employees m ON m.id = d.head
      LEFT JOIN (
        SELECT t.employee_id, t.status_id
        FROM emp_attendances t
        JOIN (
          SELECT employee_id, MAX(date) AS max_date
          FROM emp_attendances
          GROUP BY employee_id
        ) x ON x.employee_id = t.employee_id AND x.max_date = t.date
      ) la ON la.employee_id = e.user_id
      LEFT JOIN emp_attendance_statuses s ON s.id = la.status_id
      WHERE e.user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('getCardByUserId error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Get all employee cards
exports.getAllCards = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        e.user_id,
        CONCAT(e.first_name, ' ', e.last_name) AS full_name,
        e.email,
        e.phone,
        e.address,
        d.name AS department,
        CONCAT(COALESCE(m.first_name, ''), ' ', COALESCE(m.last_name, '')) AS manager,
        e.joining_date,
        COALESCE(s.name, 'N/A') AS status
      FROM emp_employees e
      LEFT JOIN emp_departments d ON d.id = e.department_id
      LEFT JOIN emp_employees m ON m.id = d.head
      LEFT JOIN (
        SELECT t.employee_id, t.status_id
        FROM emp_attendances t
        JOIN (
          SELECT employee_id, MAX(date) AS max_date
          FROM emp_attendances
          GROUP BY employee_id
        ) x ON x.employee_id = t.employee_id AND x.max_date = t.date
      ) la ON la.employee_id = e.user_id
      LEFT JOIN emp_attendance_statuses s ON s.id = la.status_id
      ORDER BY e.joining_date DESC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error('getAllCards error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};