const express = require('express');
const router = express.Router();
const { addLog, getLogs } = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

// Protect these routes so only logged-in users can log their meds
router.route('/').post(protect, addLog).get(protect, getLogs);

module.exports = router;