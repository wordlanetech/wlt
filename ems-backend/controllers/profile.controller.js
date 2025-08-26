const db = require('../config/db'); // Your database connection

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id; // populated by JWT middleware

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID missing' });
    }

    console.log('Fetching profile for userId:', userId);

    const [rows] = await db.query(
      `SELECT
          e.id AS employeeId,
          CONCAT(e.first_name, ' ', e.last_name) AS fullName,
          e.email,
          e.phone AS phoneNumber,
          e.address,
          e.role_id AS role,
          e.department_id AS department,
          e.joining_date AS joiningDate
        FROM emp_employees e
        LEFT JOIN emp_roles r ON e.role_id = r.id
        LEFT JOIN emp_departments d ON e.department_id = d.id
        WHERE e.id = ?
        LIMIT 1`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ profile: rows[0] });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// Update profile picture (currently not supported)
exports.updateProfilePicture = async (req, res) => {
  res.status(400).json({ message: 'Profile picture update is not supported yet.' });
};
