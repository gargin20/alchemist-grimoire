const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    medication: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Medication'
    },
    status: {
        type: String,
        required: true,
        enum: ['Taken', 'Missed'] // It can ONLY be one of these two words
    },
    date: {
        type: Date,
        default: Date.now // Automatically logs the exact time they clicked the button
    }
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);