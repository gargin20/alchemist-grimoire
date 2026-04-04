const express = require('express');
const router = express.Router();
const { getMeds, addMed, deleteMed } = require('../controllers/medController');
const { protect } = require('../middleware/authMiddleware');

// We add 'protect' as the second argument to ensure only logged-in users can use these!
router.route('/').get(protect, getMeds).post(protect, addMed);
router.route('/:id').delete(protect, deleteMed);

module.exports = router;