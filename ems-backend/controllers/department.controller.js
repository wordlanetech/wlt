const db = require('../config/db');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const [departments] = await db.query(`
      SELECT 
        d.id, 
        d.name, 
        d.description, 
        d.head,
        CONCAT(e.first_name, ' ', e.last_name) AS head_name,
        COUNT(emp.id) AS employee_count,
        d.created_at, 
        d.updated_at
      FROM emp_departments d
      LEFT JOIN emp_employees e ON d.head = e.id
      LEFT JOIN emp_employees emp ON emp.department_id = d.id
      WHERE d.deleted_at IS NULL
      GROUP BY d.id
    `);

    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Add a new department
exports.addDepartment = async (req, res) => {
  try {
    const { name, description, head } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    await db.query(`
      INSERT INTO emp_departments (name, description, head)
      VALUES (?, ?, ?)
    `, [name, description || null, head || null]);

    res.status(201).json({ message: 'Department added successfully' });
  } catch (err) {
    console.error('Error adding department:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
