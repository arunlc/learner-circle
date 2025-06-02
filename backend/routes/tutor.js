const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');

// TODO: Add routes for tutor
router.get('/', tutorController.index);

module.exports = router;