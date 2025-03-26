require("dotenv").config();
const express = require("express");
const cors = require("cors");
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");
const pool = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

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

  app.use("/api/auth", authRoutes);
  app.use("/api/attendance", attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
