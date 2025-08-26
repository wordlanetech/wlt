const db = require('../config/db');

// Generic fetcher
const fetchAll = async (res, table, idField, nameField) => {
  try {
    const [rows] = await db.query(`SELECT ${idField} AS id, ${nameField} AS name FROM ${table}`);
    res.json(rows);
  } catch (error) {
    console.error(`Error fetching ${table}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getGenders = (req, res) => fetchAll(res, 'emp_genders', 'id', 'name');
exports.getDepartments = (req, res) => fetchAll(res, 'emp_departments', 'id', 'name');
exports.getDesignations = (req, res) => fetchAll(res, 'emp_designations', 'id', 'name');
exports.getRoles = (req, res) => fetchAll(res, 'emp_roles', 'id', 'name');
