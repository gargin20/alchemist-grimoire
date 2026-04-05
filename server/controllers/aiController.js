const { GoogleGenerativeAI } = require('@google/generative-ai');
const Medication = require('../models/Medication');
const Log = require('../models/Log');

// Initialize Gemini with your API key (done once for the whole file)
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

// @desc    Scan a pill bottle and check for drug interactions
// @route   POST /api/ai/scan
exports.scanPill = async (req, res) => {
    console.log("👁️ Oracle Eye Activated: Scanning image...");
    try {
        const { image } = req.body;
        const userId = req.user.id; 

        if (!image) return res.status(400).json({ error: "No image provided" });

        // 1. Strip the HTML prefix from the base64 image string so Google can read it
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        // 2. Fetch the user's CURRENT active medications to check for interactions
        const currentMeds = await Medication.find({ user: userId });
        const currentMedNames = currentMeds.map(med => med.name).join(', ');

        // 3. We use the existing genAI instance declared at the top!
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 4. The Magic Prompt: Read the image AND act as a pharmacist
        const prompt = `
        You are a world-class pharmacist and OCR system.
        1. Look at the attached image of a pill bottle label. Extract the medication 'name' and 'dosage'.
        2. The user is CURRENTLY taking the following medications: ${currentMedNames || "None"}.
        3. Perform a critical drug interaction check between the newly scanned medication and their current list.
        
        Respond strictly with a JSON object in this exact format (do not include markdown wrapping like \`\`\`json):
        {
            "name": "Extracted Name",
            "dosage": "Extracted Dosage",
            "safetyWarning": "null if perfectly safe, OR a 1-sentence severe warning if there is a dangerous drug interaction."
        }
        `;

        const imageParts = [
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            }
        ];

        // 5. Ask Gemini to analyze the image + prompt
        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        
        // Clean up the response to ensure it's valid JSON
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const extractedData = JSON.parse(cleanedText);

        console.log("🔮 Scan Complete:", extractedData);
        res.json(extractedData);

    } catch (error) {
        console.error("Scanner Error:", error);
        res.status(500).json({ error: "Failed to read the label. Please try again." });
    }
};

// Add this helper function at the top of your file (outside the exports)
// It converts the uploaded image into a format Gemini can see
const fileToGenerativePart = (buffer, mimeType) => {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType
        },
    };
};

// @desc    Scan a prescription image and extract medication details
// @route   POST /api/ai/scan-prescription
exports.scanPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        console.log("📸 Scanning Prescription Image...");

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 2. Build the System Prompt (The rules for the AI)
        const prompt = `
        You are a smart, professional, and helpful medication adherence assistant. 
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
        4. CRITICAL MEDICAL GUARDRAIL: If the user describes new symptoms (e.g., "I feel dizzy", "my stomach hurts") or asks what new medication they should take, YOU MUST STRICTLY REFUSE. Reply exactly with: "I am a medication tracking assistant, not a doctor. Because you are experiencing symptoms, please consult your healthcare provider immediately or seek emergency medical care."
        `;

        const imagePart = fileToGenerativePart(req.file.buffer, req.file.mimetype);

        // Send the prompt AND the image to Gemini
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Clean the JSON response (in case Gemini wraps it in markdown)
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        console.log("✅ Prescription Parsed Successfully:", parsedData);
        res.status(200).json(parsedData);

    } catch (error) {
        console.error("Prescription Scan Error:", error);
        res.status(500).json({ error: "Failed to process prescription image." });
    }
};