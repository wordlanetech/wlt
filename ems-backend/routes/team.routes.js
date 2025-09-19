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

// Add a member to a team
router.post('/:teamId/members/:userId', teamController.addTeamMember);

// Remove a member from a team
router.delete('/:teamId/members/:userId', teamController.removeTeamMember);

// Get available employees for a team
router.get('/:teamId/available-employees', teamController.getAvailableEmployees);

module.exports = router;