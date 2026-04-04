const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware to parse JSON and handle CORS
app.use(express.json());
app.use(cors());
// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/meds', require('./routes/medRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
// A simple test route
app.get('/', (req, res) => {
    res.send('The Alchemist Server is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
