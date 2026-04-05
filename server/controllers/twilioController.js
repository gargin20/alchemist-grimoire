const twilio = require('twilio');
const User = require('../models/User'); // 👈 We must import the User model now!

exports.triggerEmergencyCall = async (req, res) => {
    console.log("🚨 Initiating Caregiver Escalation Protocol...");
    
    try {
        // 1. Find the current logged-in user in the database
        const user = await User.findById(req.user.id);

        // 2. Security Check: Do they have a contact set up?
        if (!user.emergencyContactPhone) {
            return res.status(400).json({ 
                error: "No emergency contact found. Please set one up in your dashboard." 
            });
        }

        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // 3. Dynamic Voice Message using the patient's actual name
        const voiceMessage = `
            <Response>
                <Say voice="alice" language="en-US">
                    Warning. This is an automated emergency alert from the Health Dashboard. 
                    ${user.name} has missed a critical medication dose. 
                    Please check in on them immediately. Goodbye.
                </Say>
            </Response>
        `;

        // 4. Dial the specific user's emergency contact
        const call = await client.calls.create({
            twiml: voiceMessage,
            to: user.emergencyContactPhone,           // 👈 Dynamic!
            from: process.env.TWILIO_PHONE_NUMBER     // Your Twilio trial number
        });

        console.log(`📞 Call successfully dispatched to ${user.emergencyContactName} at ${user.emergencyContactPhone}!`);
        res.status(200).json({ message: "Emergency call dispatched successfully!", callSid: call.sid });

    } catch (error) {
        console.error("Twilio Call Error:", error);
        res.status(500).json({ error: "Failed to dispatch emergency call." });
    }
};

// @desc    Send a WhatsApp Emergency Alert
// @route   POST /api/twilio/whatsapp
exports.triggerWhatsAppAlert = async (req, res) => {
    console.log("💬 Initiating WhatsApp Escalation Protocol...");
    
    try {
        const user = await User.findById(req.user.id);

        if (!user.emergencyContactPhone) {
            return res.status(400).json({ 
                error: "No emergency contact found. Please set one up in your dashboard." 
            });
        }

        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // Twilio requires WhatsApp numbers to be prefixed with "whatsapp:"
        const toWhatsAppNumber = `whatsapp:${user.emergencyContactPhone}`;
        // You must also use your Twilio WhatsApp sender number (usually your Twilio trial number prefixed)
        const fromWhatsAppNumber = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`; 

        const messageText = `🚨 *Health Dashboard Alert* 🚨\n\nHello, this is an automated message. ${user.name} has missed a critical medication dose. Please check in on them immediately.`;

        const message = await client.messages.create({
            body: messageText,
            from: fromWhatsAppNumber,
            to: toWhatsAppNumber
        });

        console.log(`💬 WhatsApp sent successfully to ${user.emergencyContactName}! Message SID: ${message.sid}`);
        res.status(200).json({ message: "WhatsApp message sent successfully!", sid: message.sid });

    } catch (error) {
        console.error("Twilio WhatsApp Error:", error);
        res.status(500).json({ error: "Failed to dispatch WhatsApp message." });
    }
};