const db = require('./config/db');

async function testGetAllTeams() {
  try {
    console.log('Testing getAllTeams query...');
    
    const [teams] = await db.query(`
      SELECT 
        t.id, 
        t.team_name AS name, 
        t.team_leader,
        e.user_id AS leader_user_id,
        COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'No Leader Assigned') AS leader,
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
      LEFT JOIN emp_employees e ON t.team_leader = e.id
      LEFT JOIN emp_employees m ON tm.employee_id = m.id
      LEFT JOIN emp_designations d ON m.designation_id = d.id
      GROUP BY t.id, e.user_id, e.first_name, e.last_name
    `);

    console.log('Query successful!');
    console.log('Number of teams found:', teams.length);
    console.log('First team:', teams[0]);
  } catch (error) {
    console.error('Query failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
  }
}

testGetAllTeams();