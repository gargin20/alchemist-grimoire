const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Medication = require('../models/Medication');
const Log = require('../models/Log'); // We need the logs to find patterns!

const startCronJobs = () => {
    console.log("⏳ AI-Powered Background Cron Jobs Initialized...");

    // 1. Configure Email Transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2. Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 3. The Automation Loop (Running every minute for testing)
    cron.schedule('* * * * *', async () => {
        console.log("⏰ CRON TRIGGERED: Analyzing schedules and predicting adherence...");

        try {
            const allMeds = await Medication.find().populate('user', 'name email');

            if (allMeds.length === 0) return;

            // Loop through all medications due
            for (const med of allMeds) {
                if (med.user && med.user.email) {
                    
                    console.log(`🧠 AI is analyzing patterns for ${med.user.name}...`);

                    // A. Fetch the last 7 logs for this specific user and medication
                    const recentLogs = await Log.find({ 
                        user: med.user._id, 
                        medication: med._id 
                    }).sort({ date: -1 }).limit(7);

                    // B. Ask Gemini to predict adherence
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                    const prompt = `
                    You are a proactive health assistant.
                    User: ${med.user.name}
                    Medication: ${med.dosage} of ${med.name} at ${med.time}
                    Recent Log History (Status: Taken or Missed):
                    ${JSON.stringify(recentLogs)}

                    Analyze the history. Is the user struggling to remember this medication? Do they have a pattern of missing it?
                    - If they frequently MISS it: Write a single-sentence, highly proactive nudge (e.g., "I noticed you usually forget your evening pill after dinner—please don't forget it tonight!").
                    - If they are doing well (mostly 'Taken') OR if there is no history yet: Reply EXACTLY with the word: STANDARD
                    `;

                    const result = await model.generateContent(prompt);
                    const aiPrediction = result.response.text().trim();

                    // C. Construct the Email Body based on AI Prediction
                    let emailText = '';
                    if (aiPrediction === 'STANDARD') {
                        emailText = `Hello ${med.user.name},\n\nThis is your automated reminder to take your ${med.dosage} of ${med.name} scheduled for ${med.time}.\n\nStay healthy!`;
                        console.log(`📊 AI determined standard risk. Sending regular reminder.`);
                    } else {
                        emailText = `Hello ${med.user.name},\n\n🚨 PREDICTIVE NUDGE: ${aiPrediction}\n\nPlease remember to take your ${med.dosage} of ${med.name} scheduled for ${med.time}.\n\nStay healthy!`;
                        console.log(`⚠️ AI detected high risk! Sending proactive nudge.`);
                    }

                    // D. Send the Email
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: med.user.email,
                        subject: aiPrediction === 'STANDARD' 
                            ? `Reminder: Time to take your ${med.name}` 
                            : `Important: Don't forget your ${med.name} today!`,
                        text: emailText
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                        console.log(`✅ Email successfully sent to ${med.user.email}!`);
                    } catch (emailError) {
                        console.error(`❌ Failed to send email:`, emailError);
                    }
                }
            }

        } catch (error) {
            console.error("Cron Job Error:", error);
        }
    });
};

module.exports = startCronJobs;