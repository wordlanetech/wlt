const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.login = async (req, res) => {
    try {
        const { user_id, password } = req.body;

        if (!user_id || !password) {
            return res.status(400).json({ message: 'Missing credentials' });
        }

        // Query database
        const [rows] = await db.execute(
            'SELECT user_id, password_hash, role_id FROM emp_employees WHERE user_id = ?',
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid User ID or Password' });
        }

        const user = rows[0];

        // Compare password using bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid User ID or Password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, role_id: user.role_id },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Role-based redirect
        const rolePages = {
            1: '/ems-frontend/a/admin_dashboard.html',
            2: '/ems-frontend/h/hr_dashboard.html',
            3: '/ems-frontend/m/manager_dashboard.html',
            4: '/ems-frontend/e/dashboard.html',
        };
        const roleNames = {
            1: 'Administrator',
            2: 'HR',
            3: 'Manager',
            4: 'Employee',
        };

        res.json({
            message: 'Login successful!',
            user_id: user.user_id,
            role_id: user.role_id,
            role_name: roleNames[user.role_id],
            redirect_page: rolePages[user.role_id],
            token
        });

    } catch (err) {
        console.error('Login error:', err); // <-- log full error
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
