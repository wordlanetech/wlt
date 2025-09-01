const express = require("express");
const router = express.Router();
const employeeCardController = require("../controllers/employeesCard.controller");

// Get all employee cards
router.get("/", employeeCardController.getAllCards);

// Get a single employee card by userId
router.get("/:userId", employeeCardController.getCardByUserId);

module.exports = router;
