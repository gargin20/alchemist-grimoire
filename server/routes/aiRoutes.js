const express = require('express');
const router = express.Router();
const { askAssistant } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Protect this route so it only reads data for the logged-in user
router.route('/ask').post(protect, askAssistant);

module.exports = router;