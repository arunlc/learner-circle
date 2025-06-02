const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// TODO: Add routes for session
router.get('/', sessionController.index);

module.exports = router;