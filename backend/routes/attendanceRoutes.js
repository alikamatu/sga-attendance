const express = require("express");
const { addAttendance, getAttendance, deleteAttendance } = require("../controllers/attendanceController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Attendance Routes (Protected)
router.post("/", authMiddleware, addAttendance);
router.get("/", authMiddleware, getAttendance);
router.delete("/:id", authMiddleware, deleteAttendance);

module.exports = router;
