const pool = require("../config/db");

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
