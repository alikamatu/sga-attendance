const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/db.js");
const  sendPasswordResetEmail = require("../nodemailer.js");


exports.addAttendance = async (req, res) => {
  const { student_id, name, status } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO attendance (student_id, name, status) VALUES ($1, $2, $3) RETURNING *",
      [student_id, name, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
