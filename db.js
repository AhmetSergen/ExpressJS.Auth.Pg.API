// TODO: sil

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL with connection string:', process.env.DATABASE_URL);
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error', err);
});

// Test the connection with a simple query
(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('[test] Database time:', result.rows[0]);
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    pool.end(); // Close the connection
  }
})();

module.exports = pool;
