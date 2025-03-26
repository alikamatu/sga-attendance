const express = require("express");
const { addAttendance, getAttendance, deleteAttendance } = require("../controllers/attendanceController");

const router = express.Router();

router.post("/", addAttendance);
router.get("/", getAttendance);
router.delete("/:id", deleteAttendance);

module.exports = router;
