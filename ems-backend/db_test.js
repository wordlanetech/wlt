const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    
    console.log('Database connection successful!');
    
    // Test query to see if teams table exists
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM emp_teams');
    console.log('Number of teams in database:', rows[0].count);
    
    await connection.end();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection();