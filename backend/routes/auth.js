const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// TODO: Add routes for auth
router.get('/', authController.index);

module.exports = router;