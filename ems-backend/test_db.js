const db = require('./config/db');

async function testConnection() {
  try {
    // Test the connection by executing a simple query
    const [rows] = await db.execute('SELECT 1 as test');
    console.log('Database connection successful:', rows);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection();