const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

router.get('/all', attendanceController.getAllAttendance);

module.exports = router;
