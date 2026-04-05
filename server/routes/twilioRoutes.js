const express = require('express');
const router = express.Router();
const twilioController = require('../controllers/twilioController');
const { protect } = require('../middleware/authMiddleware');

// Route to trigger the phone call
router.post('/alert', protect, twilioController.triggerEmergencyCall);

module.exports = router;