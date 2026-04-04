const { GoogleGenerativeAI } = require('@google/generative-ai');
const Medication = require('../models/Medication');
const Log = require('../models/Log');

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Ask the AI Assistant a question about your schedule
// @route   POST /api/ai/ask
exports.askAssistant = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: "Please ask a question." });
        }

        // 1. Gather the user's "reality" from the database
        const meds = await Medication.find({ user: req.user.id }).select('name dosage time frequency');
        const logs = await Log.find({ user: req.user.id })
                              .populate('medication', 'name')
                              .sort({ date: -1 })
                              .limit(10); // Get the last 10 actions

       // 2. Build the System Prompt (The rules for the AI)
        const prompt = `
        You are a smart, professional, and helpful health assistant. 
        You have access to the user's medication schedule and log history.
        
        Active schedule:
        ${JSON.stringify(meds)}

        Recent log history (Taken/Missed):
        ${JSON.stringify(logs)}

        User's Question: "${question}"

        Instructions:
        1. Answer the question accurately based ONLY on the schedule and logs provided above.
        2. Keep your answer concise (under 3 sentences).
        3. Adopt a clear, professional, and supportive tone.
        `;
        // 3. Call the Gemini API
        // We use gemini-1.5-flash as it is extremely fast and perfect for text tasks
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 4. Send the AI's response back to the React app
        res.status(200).json({ answer: responseText });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ message: "The crystal ball is currently cloudy. Try again later." });
    }
};