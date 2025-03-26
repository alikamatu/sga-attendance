require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 2000
});

pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL');
    return client.query('SELECT NOW()')
      .then(res => {
        console.log('⏱️ Current time:', res.rows[0].now);
        client.release();
      });
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
  });

app.get('/', async (req, res) => {
  console.log('🌐 GET / request received');
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'success',
      message: 'Connected to PostgreSQL', 
      time: result.rows[0].now 
    });
  } catch (err) {
    console.error('🚨 Route error:', err);
    res.status(500).json({ 
      status: 'error',
      message: err.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});