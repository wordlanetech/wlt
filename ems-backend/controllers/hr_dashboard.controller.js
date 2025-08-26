const db = require('../config/db');

// Get summary data
exports.getSummary = async (req, res) => {
    try {
        const [[{ totalEmployees }]] = await db.query(`SELECT COUNT(*) AS totalEmployees FROM emp_employees`);
        const [[{ newHires }]] = await db.query(`SELECT COUNT(*) AS newHires FROM emp_employees WHERE joining_date >= CURDATE() - INTERVAL 30 DAY`);
        const [[{ pendingLeaves }]] = await db.query(`SELECT COUNT(*) AS pendingLeaves FROM emp_leaves WHERE status = 'Pending'`);
        const [[{ activeProjects }]] = await db.query(`SELECT COUNT(*) AS activeProjects FROM emp_projects WHERE status = 'In Progress'`);

        res.json({
            totalEmployees,
            newHires,
            pendingLeaves,
            activeProjects
        });
    } catch (err) {
        console.error('Dashboard summary error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get recent activity data
exports.getRecentActivities = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT type, description, created_at 
            FROM hr_activities 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        res.json(results);
    } catch (err) {
        console.error('Recent activity error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
