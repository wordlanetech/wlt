const db = require('../config/db');

exports.getManagerProjectsList = async (req, res) => {
    try {
        const user_id = req.query.user_id;

        if (!user_id) {
            return res.status(400).json({ message: "Missing user_id in query" });
        }

        // Directly use emp_user_id instead of employee.id
        const [projects] = await db.query(
            `SELECT 
                id,
                name AS project_name,
                description,
                status,
                DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
                DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
                next_milestone_date
            FROM emp_projects
            WHERE project_manager = ?`,
            [user_id]
        );

        res.json(projects);
    } catch (err) {
        console.error('Error fetching manager projects:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
