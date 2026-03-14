const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('--- Database Setup Start ---');
  
  const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'NeuroLearn',
    user: 'postgres',
    password: '12345',
  });

  try {
    const sqlPath = path.join(__dirname, 'setup-progress-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Running SQL script to create tables and seed progress data...');
    await client.query(sql);
    
    console.log('✅ Success! Tables "learning_sessions" and "struggle_points" created and seeded.');
    client.release();
  } catch (err) {
    console.error('❌ Error during setup:', err.message);
  } finally {
    await pool.end();
    console.log('--- Database Setup Finished ---');
  }
}

setupDatabase();
