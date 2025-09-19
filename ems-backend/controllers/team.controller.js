// Function to check if an employee exists (any employee can be a team leader now)
async function isValidTeamLeader(pool, userId) {
    try {
        const [employees] = await pool.query(
            'SELECT id FROM emp_employees WHERE user_id = ?',
            [userId]
        );
        
        return employees.length > 0;
    } catch (error) {
        console.error('Error checking employee existence:', error);
        throw error;
    }
}

// Get all teams with members count and leader name
exports.getAllTeams = async (req, res) => {
    try {
        const [teams] = await pool.query(`
            SELECT 
                t.id, 
                t.team_name AS name, 
                t.team_leader,  -- Include team_leader ID
                e.user_id AS leader_user_id,  -- Include leader's user_id
                COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'No Leader Assigned') AS leader,   -- leader's name
                t.team_description AS description, 
                t.team_created_by AS createdBy, 
                t.team_created_at AS createdAt,
                COUNT(tm.employee_id) AS memberCount,
                COALESCE(
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', m.id,
                            'user_id', m.user_id,
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
            GROUP BY t.id, e.user_id, e.first_name, e.last_name
        `);

        res.json(teams);
    } catch (error) {
        console.error('Error fetching emp_teams:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get a single team with members
exports.getTeamWithMembers = async (req, res) => {
    const { id } = req.params;
    try {
        const [teams] = await pool.query(`
            SELECT 
                t.id, 
                t.team_name AS name, 
                t.team_leader,
                e.user_id AS leader_user_id,  -- Include leader's user_id
                COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'No Leader Assigned') AS leader,
                t.team_description AS description,
                t.team_created_by AS createdBy,
                t.team_created_at AS createdAt,
                COALESCE(
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', m.id,
                            'user_id', m.user_id,
                            'name', CONCAT(m.first_name, ' ', m.last_name),
                            'email', m.email,
                            'designation', d.name
                        )
                    ), JSON_ARRAY()
                ) AS members
            FROM emp_teams t
            LEFT JOIN emp_teams_employee tm ON t.id = tm.team_id
            LEFT JOIN emp_employees e ON t.team_leader = e.id
            LEFT JOIN emp_employees m ON tm.employee_id = m.id
            LEFT JOIN emp_designations d ON m.designation_id = d.id
            WHERE t.id = ?
            GROUP BY t.id, e.user_id, e.first_name, e.last_name
        `, [id]);

        if (teams.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json(teams[0]);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new team
exports.createTeam = async (req, res) => {
    const { name, description, created_by, team_leader } = req.body;
    try {
        // Validate that the team leader exists (any employee can be a team leader)
        if (team_leader) {
            const isValidLeader = await isValidTeamLeader(pool, team_leader);
            if (!isValidLeader) {
                return res.status(400).json({ error: 'Selected employee not found' });
            }
            
            // Get the employee ID from user_id
            const [employees] = await pool.query(
                'SELECT id FROM emp_employees WHERE user_id = ?',
                [team_leader]
            );
            
            if (employees.length === 0) {
                return res.status(400).json({ error: 'Team leader not found' });
            }
            
            const teamLeaderId = employees[0].id;
            
            const [result] = await pool.query(
                'INSERT INTO emp_teams (team_name, team_description, team_leader, team_created_by, team_created_at) VALUES (?, ?, ?, ?, NOW())',
                [name, description, teamLeaderId, created_by]
            );
            res.status(201).json({ message: 'Team created successfully', teamId: result.insertId });
        } else {
            return res.status(400).json({ error: 'Team leader is required' });
        }
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
        // Validate that the team leader exists (any employee can be a team leader)
        if (team_leader) {
            const isValidLeader = await isValidTeamLeader(pool, team_leader);
            if (!isValidLeader) {
                return res.status(400).json({ error: 'Selected employee not found' });
            }
            
            // Get the employee ID from user_id
            const [employees] = await pool.query(
                'SELECT id FROM emp_employees WHERE user_id = ?',
                [team_leader]
            );
            
            if (employees.length === 0) {
                return res.status(400).json({ error: 'Team leader not found' });
            }
            
            const teamLeaderId = employees[0].id;
            
            const [result] = await pool.query(
                'UPDATE emp_teams SET team_name = ?, team_description = ?, team_leader = ? WHERE id = ?',
                [name, description, teamLeaderId, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Team not found' });
            }
            res.json({ message: 'Team updated successfully' });
        } else {
            return res.status(400).json({ error: 'Team leader is required' });
        }
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Add a member to a team
exports.addTeamMember = async (req, res) => {
    const { teamId } = req.params;
    const { userId } = req.body;  // Changed from employeeId to userId
    
    try {
        // Get the employee ID from user_id
        const [employees] = await pool.query(
            'SELECT id FROM emp_employees WHERE user_id = ?',
            [userId]
        );
        
        if (employees.length === 0) {
            return res.status(400).json({ error: 'Employee not found' });
        }
        
        const employeeId = employees[0].id;
        
        // Check if the employee is already in the team
        const [existing] = await pool.query(
            'SELECT * FROM emp_teams_employee WHERE team_id = ? AND employee_id = ?',
            [teamId, employeeId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Employee is already a member of this team' });
        }
        
        // Add the employee to the team
        const [result] = await pool.query(
            'INSERT INTO emp_teams_employee (team_id, employee_id) VALUES (?, ?)',
            [teamId, employeeId]
        );
        
        res.status(201).json({ message: 'Employee added to team successfully' });
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Remove a member from a team
exports.removeTeamMember = async (req, res) => {
    const { teamId, userId } = req.params;  // Changed from employeeId to userId
    
    try {
        // Get the employee ID from user_id
        const [employees] = await pool.query(
            'SELECT id FROM emp_employees WHERE user_id = ?',
            [userId]
        );
        
        if (employees.length === 0) {
            return res.status(400).json({ error: 'Employee not found' });
        }
        
        const employeeId = employees[0].id;
        
        // Check if the employee is the team leader (can't remove team leader)
        const [team] = await pool.query(
            'SELECT team_leader FROM emp_teams WHERE id = ?',
            [teamId]
        );
        
        if (team.length > 0 && team[0].team_leader == employeeId) {
            return res.status(400).json({ error: 'Cannot remove team leader from team. Assign a new leader first.' });
        }
        
        // Remove the employee from the team
        const [result] = await pool.query(
            'DELETE FROM emp_teams_employee WHERE team_id = ? AND employee_id = ?',
            [teamId, employeeId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found in team' });
        }
        
        res.json({ message: 'Employee removed from team successfully' });
    } catch (error) {
        console.error('Error removing team member:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all employees who are not in a specific team
exports.getAvailableEmployees = async (req, res) => {
    const { teamId } = req.params;
    
    try {
        console.log('Fetching available employees for team:', teamId);
        
        const [employees] = await pool.query(`
            SELECT e.id, e.user_id, e.first_name, e.last_name, e.email, d.name as department, r.name as role
            FROM emp_employees e
            LEFT JOIN emp_departments d ON e.department_id = d.id
            LEFT JOIN emp_roles r ON e.role_id = r.id
            WHERE e.id NOT IN (
                SELECT employee_id FROM emp_teams_employee WHERE team_id = ?
            ) AND e.id NOT IN (
                SELECT team_leader FROM emp_teams WHERE id = ? AND team_leader IS NOT NULL
            )
            ORDER BY e.user_id ASC
        `, [teamId, teamId]);
        
        console.log('Found available employees:', employees.length);
        res.json(employees);
    } catch (error) {
        console.error('Error fetching available employees:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};