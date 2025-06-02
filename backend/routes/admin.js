const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// TODO: Add routes for admin
router.get('/', adminController.index);

module.exports = router;