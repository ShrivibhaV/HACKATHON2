const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('--- Database Setup Start ---');
  
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'HACKATHON2',
    user: 'postgres',
    password: '98765',
  });

  try {
    const sqlPath = path.join(__dirname, 'student-profiles-simple.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Running SQL script to create table and functions...');
    await client.query(sql);
    
    console.log('✅ Success! Table "student_profiles" created or already exists.');
    client.release();
  } catch (err) {
    console.error('❌ Error during setup:', err.message);
  } finally {
    await pool.end();
    console.log('--- Database Setup Finished ---');
  }
}

setupDatabase();
