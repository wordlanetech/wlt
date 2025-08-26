const db = require('../config/db');

// 1. Manager Profile
exports.getManagerProfile = async (req, res) => {
  const { user_id } = req.query;
  try {
    const [rows] = await db.query(`
      SELECT 
        e.user_id, e.email, e.first_name, e.last_name,
        d.name AS department,
        r.name AS role
      FROM emp_employees e
      LEFT JOIN emp_departments d ON e.department_id = d.id
      LEFT JOIN emp_roles r ON e.role_id = r.id
      WHERE e.user_id = ?
    `, [user_id]);

    res.json(rows[0]);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 2. Projects Summary
exports.getManagerProjects = async (req, res) => {
  const { user_id } = req.query;
  try {
    const [projects] = await db.query(`
      SELECT id, name, status, next_milestone_date
      FROM emp_projects
      WHERE project_manager = ?
    `, [user_id]);

    const total = projects.length;
    const active = projects.filter(p => p.status === 'In Progress').length;
    const nextMilestone = projects
      .filter(p => p.next_milestone_date)
      .sort((a, b) => new Date(a.next_milestone_date) - new Date(b.next_milestone_date))[0]?.next_milestone_date ?? 'N/A';

    res.json({ total, active, nextMilestone });
  } catch (err) {
    console.error('Projects error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 3. Active Tasks
exports.getManagerTasks = async (req, res) => {
  const { user_id } = req.query;

  try {
    // Get manager's internal employee ID
    const [[employee]] = await db.query(
      `SELECT id FROM emp_employees WHERE user_id = ?`,
      [user_id]
    );

    if (!employee) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    const managerId = employee.id;

    // Fetch active tasks assigned by this manager
    const [rows] = await db.query(`
      SELECT t.name, t.end_date AS due_date, p.name AS project_title
      FROM emp_tasks t
      LEFT JOIN emp_projects p ON t.project_id = p.id
      WHERE t.assigned_by = ? AND t.status = 'In Progress'
      ORDER BY t.end_date ASC
    `, [managerId]);

    const totalActiveTasks = rows.length;
    const upcoming = rows[0] || null;

    res.json({
      totalActiveTasks,
      upcomingTask: upcoming?.name || 'None',
      taskProject: upcoming?.project_title || 'No project'
    });
  } catch (err) {
    console.error('Tasks error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 4. Leaves Summary
exports.getManagerLeaves = async (req, res) => {
  const { user_id } = req.query;

  try {
    // Get employee's numeric ID from user_id
    const [[employee]] = await db.query(
      `SELECT id FROM emp_employees WHERE user_id = ?`,
      [user_id]
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const empId = employee.id;

    // Get all leaves for this employee (excluding deleted)
    const [leaves] = await db.query(`
      SELECT status, created_at
      FROM emp_leaves
      WHERE employee_id = ? AND deleted_at IS NULL
    `, [empId]);

    const pending = leaves.filter(leave => leave.status === 0).length;
    const approved = leaves.filter(leave => leave.status === 1).length;

    const lastRequest = leaves
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at || 'N/A';

    res.json({ pending, approved, lastRequest });

  } catch (err) {
    console.error('Leaves error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 5. Latest Document
// exports.getManagerLatestDocument = async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT name, type, uploaded_at, description
//       FROM emp_documents
//       ORDER BY uploaded_at DESC
//       LIMIT 1
//     `);

//     res.json(rows[0] || {});
//   } catch (err) {
//     console.error('Documents error:', err);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };
