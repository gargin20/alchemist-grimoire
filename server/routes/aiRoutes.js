const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer'); 

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

router.post('/ask', protect, aiController.askAssistant);
router.post('/scan', protect, aiController.scanPill);

// NEW VISION ROUTE
router.post('/scan-prescription', protect, upload.single('image'), aiController.scanPrescription);

module.exports = router;