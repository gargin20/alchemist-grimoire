const { google } = require('googleapis');
const Medication = require('../models/Medication');

// Set up the Google OAuth 2.0 Client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5000/api/calendar/callback' // The exact URI we gave Google
);

// 1. Generate the Google Login URL
exports.getAuthUrl = (req, res) => {
    // We pass the user's ID into the 'state' variable so we remember who they are after Google redirects them back
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        state: req.user.id 
    });
    res.json({ url });
};

// 2. Handle the Callback and Sync the Calendar
exports.handleCallback = async (req, res) => {
    const code = req.query.code;
    const userId = req.query.state; // We get the user ID back from the state variable

    try {
        // Exchange the code for the secret access tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Find all medications for this specific user
        const userMeds = await Medication.find({ user: userId });

        if (userMeds.length === 0) {
            return res.redirect('http://localhost:5173/dashboard?sync=nomeds');
        }

        // Loop through their meds and create an event for today
        for (const med of userMeds) {
            // Get today's date, but set the time to the medication's schedule time
            const [hours, minutes] = med.time.split(':');
            const eventStartTime = new Date();
            eventStartTime.setHours(hours, minutes, 0, 0);

            // Make the event last 30 minutes
            const eventEndTime = new Date(eventStartTime);
            eventEndTime.setMinutes(eventEndTime.getMinutes() + 30);

            const event = {
                summary: `💊 Take ${med.name} (${med.dosage})`,
                description: 'Automated reminder from your Health Dashboard.',
                start: {
                    dateTime: eventStartTime.toISOString(),
                    timeZone: 'Asia/Kolkata', // Change this to your local timezone if needed
                },
                end: {
                    dateTime: eventEndTime.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 10 }, // Pops up on their phone 10 mins before
                    ],
                },
            };

            await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });
            console.log(`✅ Synced ${med.name} to Google Calendar!`);
        }

        // Send them back to their dashboard with a success message
        res.redirect('http://localhost:5173/dashboard?sync=success');

    } catch (error) {
        console.error('Calendar Sync Error:', error);
        res.redirect('http://localhost:5173/dashboard?sync=error');
    }
};