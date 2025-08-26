// routes/leave.route.js
const express = require("express");
const router = express.Router();
const LeaveController = require("../controllers/leave.controller");

// Get all leaves
router.get("/", LeaveController.getAllLeaves);

// Add new leave
router.post("/", LeaveController.addLeave);

// Update leave status
router.put("/:id/status", LeaveController.updateLeaveStatus);

// Soft delete leave
router.delete("/:id", LeaveController.deleteLeave);

module.exports = router;
