const db = require('./config/db');

async function testExactQuery() {
  try {
    console.log('Testing exact getAllTeams query...');
    
    const query = `
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
    `;

    const [teams] = await db.query(query);
    console.log('Query successful!');
    console.log('Number of teams found:', teams.length);
    
    if (teams.length > 0) {
      console.log('First team:', JSON.stringify(teams[0], null, 2));
    }
  } catch (error) {
    console.error('Query failed:', error.message);
    console.error('Error code:', error.code);
    if (error.sql) {
      console.error('SQL query:', error.sql);
    }
  }
}

testExactQuery();