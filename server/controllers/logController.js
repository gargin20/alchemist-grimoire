const Log = require('../models/Log');

// @desc    Log a medication dose (Taken or Missed)
// @route   POST /api/logs
exports.addLog = async (req, res) => {
    const { medicationId, status } = req.body;

    if (!medicationId || !status) {
        return res.status(400).json({ message: 'Please provide medication ID and status' });
    }

    try {
        const log = await Log.create({
            user: req.user.id,
            medication: medicationId,
            status: status
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all logs for the logged-in user
// @route   GET /api/logs
exports.getLogs = async (req, res) => {
    try {
        // We use .populate() to automatically pull in the medication name and details!
        const logs = await Log.find({ user: req.user.id })
                              .populate('medication', 'name dosage time')
                              .sort({ date: -1 }); // Sort by newest first
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};