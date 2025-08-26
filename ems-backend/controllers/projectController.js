const db = require('../config/db');

// Get all projects (Admin can see all, others only their projects)
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query;
    let params = [];

    if (role === 'admin') {
      // Admin sees all projects
      query = `SELECT 
      p.project_id,
      p.name,
      p.description,
      p.status,
      p.start_date,
      p.end_date,
      p.created_by,
      p.created_at,
      p.updated_at,
      p.project_manager,
      p.next_milestone_date,
      t.team_name AS team_assigned,
      p.project_code
      FROM emp_projects p
      LEFT JOIN emp_teams t ON p.team_assigned = t.id
      ORDER BY p.created_at DESC;

      `;
    } else {
      // Employee sees only assigned projects (filter by user if needed)
      query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.status,
          DATE_FORMAT(p.start_date, '%d/%m/%Y') AS start_date,
          DATE_FORMAT(p.end_date, '%d/%m/%Y') AS end_date,
          p.created_by,
          p.created_at,
          p.updated_at,
          p.project_manager,
          p.next_milestone_date,
          t.team_name AS team_assigned,
          p.project_code
        FROM emp_projects p
        LEFT JOIN emp_teams t ON p.team_assigned = t.id
        ORDER BY p.created_at DESC
      `;
      params = [userId];
    }

    const [rows] = await db.query(query, params);
    res.json(rows);

  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      start_date,
      end_date,
      project_manager,
      next_milestone_date,
      team_assigned,
      project_code
    } = req.body;

    const created_by = req.user.id;

    const query = `
      INSERT INTO emp_projects 
      (name, description, status, start_date, end_date, created_by, project_manager, next_milestone_date, team_assigned, project_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      name,
      description,
      status,
      start_date,
      end_date,
      created_by,
      project_manager,
      next_milestone_date,
      team_assigned,
      project_code
    ]);

    res.status(201).json({ message: 'Project created successfully', project_id: result.insertId });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ message: 'Error creating project' });
  }
};
