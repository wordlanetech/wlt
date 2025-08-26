// routes/profile.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

router.get('/', auth, (req, res) => {
  res.json({
    id: req.user.id,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = router;
