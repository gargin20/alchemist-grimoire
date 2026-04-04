const Medication = require('../models/Medication');

// @desc    Get user's medications
// @route   GET /api/meds
exports.getMeds = async (req, res) => {
    // Only find meds that belong to the logged-in user
    const meds = await Medication.find({ user: req.user.id });
    res.status(200).json(meds);
};

// @desc    Add a new medication
// @route   POST /api/meds
exports.addMed = async (req, res) => {
    const { name, dosage, time, frequency } = req.body;

    if (!name || !dosage || !time || !frequency) {
        return res.status(400).json({ message: 'Please add all text fields' });
    }

    const med = await Medication.create({
        name,
        dosage,
        time,
        frequency,
        user: req.user.id // This comes from our authMiddleware!
    });

    res.status(201).json(med);
};

// @desc    Delete a medication
// @route   DELETE /api/meds/:id
exports.deleteMed = async (req, res) => {
    const med = await Medication.findById(req.params.id);

    if (!med) {
        return res.status(404).json({ message: 'Medication not found' });
    }

    // Make sure the logged in user matches the medication user
    if (med.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized to delete this' });
    }

    await med.deleteOne();
    res.status(200).json({ id: req.params.id });
};