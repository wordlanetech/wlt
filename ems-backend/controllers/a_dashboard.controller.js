const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const conn = await db.getConnection();

    const [[{ totalEmployees }]] = await conn.query(`SELECT COUNT(*) AS totalEmployees FROM emp_employees`);
    const [[{ newHires }]] = await conn.query(`SELECT COUNT(*) AS newHires FROM emp_employees WHERE created_at >= NOW() - INTERVAL 5 DAY`);
    const [[{ pendingLeaves }]] = await conn.query(`SELECT COUNT(*) AS pendingLeaves FROM emp_leaves WHERE status = 'pending'`);
    const [[{ activeProjects }]] = await conn.query(`SELECT COUNT(*) AS activeProjects FROM emp_projects WHERE status = 'In Progress'`);

    const [recentActivities] = await conn.query(
      `SELECT description, created_at FROM hr_activities ORDER BY activity_id DESC LIMIT 5`
    );

    conn.release();

    res.json({
      totalEmployees,
      newHires,
      pendingLeaves,
      activeProjects,
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
