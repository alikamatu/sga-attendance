const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/db.js");
const  sendPasswordResetEmail = require("../nodemailer.js");


exports.addAttendance = async (req, res) => {
  const { action } = req.body;
  
  try {
    if (action === 'clockIn') {
      const existing = await pool.query(
        `SELECT id FROM attendance 
         WHERE user_id = $1 AND date = CURRENT_DATE AND clock_out IS NULL`,
        [req.user.id]
      );
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'You must clock out first' });
      }
      
      const { rows } = await pool.query(
        `INSERT INTO attendance (user_id, clock_in) 
         VALUES ($1, NOW()) 
         RETURNING id, date, clock_in, clock_out, status`,
        [req.user.id]
      );
      res.json(rows[0]);
      
    } else if (action === 'clockOut') {
      const { rows } = await pool.query(
        `UPDATE attendance 
         SET clock_out = NOW() 
         WHERE id = (
           SELECT id FROM attendance 
           WHERE user_id = $1 AND clock_out IS NULL 
           ORDER BY clock_in DESC 
           LIMIT 1
         )
         RETURNING id, date, clock_in, clock_out, status`,
        [req.user.id]
      );
      
      if (rows.length === 0) {
        return res.status(400).json({ error: 'No active clock-in found' });
      }
      
      res.json(rows[0]);
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM attendance ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM attendance WHERE id = $1", [id]);
    res.json({ message: "Attendance record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      client.release();
      return res.status(400).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); 

    await client.query(
      "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3",
      [resetToken, expiresAt, email]
    );
    
    client.release();

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: "Password reset link sent to email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()",
      [token]
    );
    const user = result.rows[0];

    if (!user) {
      client.release();
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    client.release();

    res.json({ message: "Password reset successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
