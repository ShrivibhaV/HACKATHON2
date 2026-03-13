const { Pool } = require('pg');
// require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('--- DB Connection Diagnostic ---');
  console.log('Host:', process.env.PG_HOST || 'localhost');
  console.log('Port:', process.env.PG_PORT || '5432');
  console.log('Database:', process.env.PG_DATABASE || 'HACKATHON2');
  console.log('User:', process.env.PG_USER || 'postgres');
  
  const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    database: process.env.PG_DATABASE || 'HACKATHON2',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '98765',
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    
    // Check if table exists
    const tableCheck = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_profiles')");
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Table "student_profiles" exists.');
      const rowCount = await client.query('SELECT COUNT(*) FROM student_profiles');
      console.log(`📊 Number of rows in "student_profiles": ${rowCount.rows[0].count}`);
      
      if (parseInt(rowCount.rows[0].count) > 0) {
        const sample = await client.query('SELECT name, created_at FROM student_profiles LIMIT 5');
        console.log('📝 Recent entries:');
        sample.rows.forEach(r => console.log(`   - ${r.name} (${r.created_at})`));
      } else {
        console.log('⚠️ The table is EMPTY. No data has been saved yet.');
      }
    } else {
      console.log('❌ Table "student_profiles" DOES NOT EXIST in this database.');
      console.log('👉 Please run the SQL script in "scripts/student-profiles-simple.sql" inside pgAdmin for this specific database.');
    }
    
    client.release();
  } catch (err) {
    console.error('❌ Connection Error:', err.message);
    if (err.code === '3D000') {
      console.log('👉 Error 3D000: The database does not exist. Please create a database named "HACKATHON2" in pgAdmin.');
    } else if (err.code === '28P01') {
      console.log('👉 Error 28P01: Invalid password. Please check your password in .env.local.');
    } else if (err.code === 'ECONNREFUSED') {
      console.log('👉 Error ECONNREFUSED: PostgreSQL is not running or the port is wrong.');
    } else {
      console.log('Error Code:', err.code);
    }
  } finally {
    await pool.end();
  }
}

testConnection();
