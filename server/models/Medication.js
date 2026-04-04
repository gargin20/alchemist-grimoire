const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Links to the User model
    },
    name: {
        type: String,
        required: [true, 'Please add a medication name']
    },
    dosage: {
        type: String,
        required: [true, 'Please add a dosage (e.g., 2 pills, 10mg)']
    },
    time: {
        type: String,
        required: [true, 'Please add a time (e.g., 08:00)']
    },
    frequency: {
        type: String,
        required: [true, 'Please select a frequency (e.g., Daily)']
    }
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);