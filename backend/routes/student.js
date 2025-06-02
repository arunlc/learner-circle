const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// TODO: Add routes for student
router.get('/', studentController.index);

module.exports = router;