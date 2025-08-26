const express = require('express');
const router = express.Router();
const ref = require('../controllers/reference.controller');

router.get('/genders', ref.getGenders);
router.get('/departments', ref.getDepartments);
router.get('/designations', ref.getDesignations);
router.get('/roles', ref.getRoles);

module.exports = router;
