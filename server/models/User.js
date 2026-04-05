const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    // NEW: Medical Onboarding Data
    age: { 
        type: Number 
    },
    sex: { 
        type: String 
    },
    bloodGroup: { 
        type: String 
    },
    // NEW: Emergency Twilio Data
    emergencyContactName: { 
        type: String 
    },
    emergencyContactPhone: { 
        type: String 
    }
}, { timestamps: true });

// Hash the password before saving it to the database
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);