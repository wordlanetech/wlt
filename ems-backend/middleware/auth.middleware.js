// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * JWT Authentication Middleware
 * Protects routes and attaches user payload to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid authorization format' });
    }

    const token = parts[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Construct display name from DB fields
    let displayName = decoded.first_name || '';
    if (decoded.last_name) {
      displayName = `${decoded.first_name} ${decoded.last_name}`;
    }

    // Attach decoded user data to request
    req.user = {
      id: decoded.id,
      first_name: decoded.first_name || null,
      last_name: decoded.last_name || null,
      displayName: displayName.trim(),
      email: decoded.email || null,
      role: decoded.role || null,
    };

    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
