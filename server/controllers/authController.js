const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        // 1. Grab ALL fields from the React form
        const { 
            name, email, password,
            age, sex, bloodGroup,
            emergencyContactName, emergencyContactPhone 
        } = req.body;

        // 2. Validate essential fields
        if (!name || !email || !password || !emergencyContactPhone) {
            return res.status(400).json({ message: 'Please fill in all required fields, including the emergency contact.' });
        }

        // 3. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 4. Create user with the full medical profile
        const user = await User.create({ 
            name, 
            email, 
            password,
            age,
            sex,
            bloodGroup,
            emergencyContactName,
            emergencyContactPhone
        });

        // 5. Send back the success response
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        // Check password match
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};