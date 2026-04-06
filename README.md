# 🧬 Alchemist Grimoire (Health System)

> An AI-powered healthcare ecosystem that bridges the gap between patients, doctors, and families through multimodal AI and active telephony escalation.



## 📖 Overview
Medication non-adherence leads to millions of preventable hospitalizations every year. ET Cortex solves this by removing friction from the patient experience. Instead of manual data entry, patients can upload a photo of their prescription, ask questions using their voice, and rely on automated, real-time emergency phone calls to family members if a critical dose is missed.

## ✨ Key Features
* **👁️ Multimodal Vision AI:** Built with Google Gemini 2.5 Flash to instantly read, extract, and schedule messy doctor prescriptions from uploaded images.
* **🚨 Active Escalation Protocol:** Integrated with the Twilio Voice API to automatically bypass push notifications and directly call emergency contacts when doses are skipped.
* **🎙️ Voice-Activated Intelligence:** Utilizes native Speech-to-Text and Text-to-Speech to allow elderly or visually impaired patients to converse with an AI health assistant.
* **⚕️ Medical Guardrails & Drug Interactions:** AI acts strictly as an adherence checker, automatically flagging severe drug interactions while refusing to self-diagnose patients.
* **📄 The Doctor Loop:** Generates dynamic, formatted PDF clinical reports of patient adherence streaks to share with healthcare providers.

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS (Glassmorphism UI)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB & Mongoose
* **AI Engine:** Google Gemini API (Multimodal text & vision)
* **Telephony:** Twilio SDK (Programmable Voice)
* **File Handling:** Multer (Memory Storage)

## 🚀 Local Setup & Installation

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/gargin20/alchemist-grimoire.git
cd alchemist-grimoire
\`\`\`

**2. Install Dependencies**
You will need to install packages for both the server and the client.
\`\`\`bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
\`\`\`

**3. Environment Variables**
Create a \`.env\` file in the `server` directory with the following keys:
\`\`\`text
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
\`\`\`

**4. Run the Application**
Open two terminal windows:
\`\`\`bash
# Terminal 1: Start the backend
cd server
npm run dev

# Terminal 2: Start the frontend
cd client
npm run dev
\`\`\`

## 🧠 Why I Built This
I built this project to demonstrate the seamless integration of Generative AI into traditional CRUD applications, focusing on real-world edge cases like medical liability guardrails and asynchronous third-party API triggers (Twilio).