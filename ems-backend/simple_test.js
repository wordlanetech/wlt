const db = require('./config/db');

async function simpleTest() {
  try {
    console.log('Running simple test...');
    
    // Simple query to check if we can access the tables
    const [teams] = await db.query('SELECT COUNT(*) as count FROM emp_teams');
    console.log('Teams count:', teams[0].count);
    
    const [employees] = await db.query('SELECT COUNT(*) as count FROM emp_employees');
    console.log('Employees count:', employees[0].count);
    
    const [teamMembers] = await db.query('SELECT COUNT(*) as count FROM emp_teams_employee');
    console.log('Team members count:', teamMembers[0].count);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

simpleTest();