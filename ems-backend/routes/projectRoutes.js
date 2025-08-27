const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// GET profile by employee ID
router.get('/:userId', profileController.getProfileByUserId);

module.exports = router;
