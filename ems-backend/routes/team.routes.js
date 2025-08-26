// routes/team.routes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');

// Get all teams
router.get('/', teamController.getAllTeams);

// Get a single team with members
router.get('/:id', teamController.getTeamWithMembers);

// Create a new team
router.post('/', teamController.createTeam);

// Update a team
router.put('/:id', teamController.updateTeam);

module.exports = router;
