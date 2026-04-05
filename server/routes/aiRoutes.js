const express = require('express');
const router = express.Router();
// 👇 FIX: Import both functions from the controller!
const { askAssistant, scanPill } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Protect this route so it only reads data for the logged-in user
router.route('/ask').post(protect, askAssistant);

// 👇 FIX: Use the directly imported function
router.post('/scan', protect, scanPill);

module.exports = router;