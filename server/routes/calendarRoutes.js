const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

// 👇 If your middleware function is named 'protect', import it like this:
const { protect } = require('../middleware/authMiddleware'); 
// (If it's named something else like 'requireAuth', use that name instead!)

// Route to get the Google login URL (Protected)
router.get('/auth', protect, calendarController.getAuthUrl);

// Route Google sends the user back to (NOT protected)
router.get('/callback', calendarController.handleCallback);

module.exports = router;