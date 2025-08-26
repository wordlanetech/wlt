// controllers/leave.controller.js
const pool = require("../config/db");

// ✅ Get all leaves with employee + approver + leave type names using user_id
exports.getAllLeaves = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        l.id,
        l.employee_id,
        e.user_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        l.start_date,
        l.end_date,
        l.reason,
        l.status,
        l.approved_by,
        CONCAT(a.first_name, ' ', a.last_name) AS approved_by_name,
        l.created_at,
        l.updated_at,
        l.leave_type,
        lt.name AS leave_type_name,
        l.deleted_at,
        l.comment
      FROM emp_leaves l
      JOIN emp_employees e ON l.employee_id = e.user_id
      LEFT JOIN emp_employees a ON l.approved_by = a.id
      LEFT JOIN emp_leave_types lt ON l.leave_type = lt.id
      WHERE l.deleted_at IS NULL
      ORDER BY l.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Add new leave
exports.addLeave = async (req, res) => {
  try {
    const { employee_id, start_date, end_date, reason, leave_type } = req.body;

    if (!employee_id || !start_date || !end_date || !leave_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await pool.execute(
      `INSERT INTO emp_leaves 
       (employee_id, start_date, end_date, reason, status, leave_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, NOW(), NOW())`,
      [employee_id, start_date, end_date, reason, leave_type]
    );

    res.status(201).json({ message: "Leave request created", leaveId: result.insertId });
  } catch (error) {
    console.error("Error adding leave:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// controllers/leave.controller.js
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status, approved_by, comment } = req.body;

    // Convert undefined to null
    approved_by = approved_by ?? null;
    comment     = comment ?? null;

    // Ensure status is numeric 0,1,2
    status = Number(status);
    if (![0, 1, 2].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await pool.execute(
      `UPDATE emp_leaves 
       SET status = ?, approved_by = ?, comment = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, approved_by, comment, id]
    );

    res.json({ message: "Leave updated successfully" });
  } catch (error) {
    console.error("Error updating leave:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// ✅ Soft delete leave
exports.deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      `UPDATE emp_leaves SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );
    res.json({ message: "Leave deleted successfully" });
  } catch (error) {
    console.error("Error deleting leave:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
