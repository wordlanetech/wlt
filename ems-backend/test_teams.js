const db = require('./config/db');

async function testTeamsQuery() {
  try {
    // Test querying the teams table
    const [rows] = await db.execute('SELECT * FROM emp_teams LIMIT 5');
    console.log('Teams query successful:', rows);
  } catch (error) {
    console.error('Teams query failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testTeamsQuery();