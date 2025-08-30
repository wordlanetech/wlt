// routes/auth.route.js
const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    console.log('Request body:', req.body);
    res.json({ message: 'Login route works!', body: req.body });
});

module.exports = router;
