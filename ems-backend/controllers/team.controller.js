// controllers/team.controller.js
const pool = require('../config/db');

// Get all teams with members count and leader name
exports.getAllTeams = async (req, res) => {
    try {
        const [teams] = await pool.query(`
            SELECT 
                t.id, 
                t.team_name AS name, 
                CONCAT(e.first_name, ' ', e.last_name) AS leader,   -- leader's name
                t.team_description AS description, 
                t.team_created_by AS createdBy, 
                t.team_created_at AS createdAt,
                COUNT(tm.employee_id) AS memberCount,
                COALESCE(
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', m.id,
                            'name', CONCAT(m.first_name, ' ', m.last_name),
                            'email', m.email,
                            'designation', d.name
                        )
                    ), JSON_ARRAY()
                ) AS members
            FROM emp_teams t
            LEFT JOIN emp_teams_employee tm ON t.id = tm.team_id
            LEFT JOIN emp_employees e ON t.team_leader = e.id           -- team leader
            LEFT JOIN emp_employees m ON tm.employee_id = m.id          -- team members
            LEFT JOIN emp_designations d ON m.designation_id = d.id     -- member designation
            GROUP BY t.id
        `);

        res.json(teams);
    } catch (error) {
        console.error('Error fetching emp_teams:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get a single team and its members
exports.getTeamWithMembers = async (req, res) => {
    const { id } = req.params;
    try {
        const [team] = await pool.query(`
            SELECT 
                t.id, 
                t.team_name AS name, 
                CONCAT(e.first_name, ' ', e.last_name) AS leader, 
                t.team_description AS description, 
                t.team_created_by AS createdBy, 
                t.team_created_at AS createdAt
            FROM emp_teams t
            LEFT JOIN emp_employees e ON t.team_leader = e.id
            WHERE t.id = ?
        `, [id]);

        if (team.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const [members] = await pool.query(`
            SELECT e.id, e.first_name, e.last_name, e.email, e.department_id, e.role_id
            FROM emp_teams_employee tm
            JOIN emp_employees e ON tm.employee_id = e.id
            WHERE tm.team_id = ?
        `, [id]);

        res.json({ ...team[0], members });
    } catch (error) {
        console.error('Error fetching team and members:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new team
exports.createTeam = async (req, res) => {
    const { name, description, created_by, team_leader } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO emp_teams (team_name, team_description, team_leader, team_created_by, team_created_at) VALUES (?, ?, ?, ?, NOW())',
            [name, description, team_leader, created_by]
        );
        res.status(201).json({ message: 'Team created successfully', teamId: result.insertId });
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update a team
exports.updateTeam = async (req, res) => {
    const { id } = req.params;
    const { name, description, team_leader } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE emp_teams SET team_name = ?, team_description = ?, team_leader = ? WHERE id = ?',
            [name, description, team_leader, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json({ message: 'Team updated successfully' });
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
