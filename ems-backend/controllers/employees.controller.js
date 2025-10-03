const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllEmployees = async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT 
        e.id,
        e.user_id,
        e.first_name AS first_name,
        e.last_name AS last_name,
        e.email AS email,
        e.phone AS phone,
        g.name AS gender_name,
        e.date_of_birth,
        e.joining_date,
        e.address,
        d.name AS department_name,
        ds.name AS designation_name,
        r.name AS role_name
      FROM emp_employees e
      LEFT JOIN emp_departments d ON e.department_id = d.id
      LEFT JOIN emp_designations ds ON e.designation_id = ds.id
      LEFT JOIN emp_roles r ON e.role_id = r.id
      LEFT JOIN emp_genders g ON e.gender_id = g.id
      ORDER BY e.user_id ASC;
    `);
    
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const saltRounds = 12;

exports.addEmployee = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      gender_id,
      date_of_birth,
      joining_date,
      address,
      password,
      department_id,
      designation_id,
      role_id
    } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.query(`
      INSERT INTO emp_employees 
        (first_name, last_name, email, phone, gender_id, date_of_birth, joining_date, address, password_hash, department_id, designation_id, role_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      first_name, last_name, email, phone, gender_id,
      date_of_birth, joining_date, address, hashedPassword,
      department_id, designation_id, role_id
    ]);

    res.status(201).json({ message: 'Employee added successfully' });

  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
