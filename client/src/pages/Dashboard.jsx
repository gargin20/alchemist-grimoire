import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import PillScanner from '../components/PillScanner';
import DigitalTwin from '../components/DigitalTwin';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [meds, setMeds] = useState([]);
    const [logs, setLogs] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        time: '',
        frequency: 'Daily',
    });

    const [question, setQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    
    // NEW STATES FOR VOICE, UPLOAD & TABS
    const [isListening, setIsListening] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview'); // 👈 Tab State

    const totalDoses = logs.length;
    const takenDoses = logs.filter((log) => log.status === 'Taken').length;
    const adherenceScore =
        totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

    // 🔥 Calculate Current Streak
    let currentStreak = 0;
    for (let i = 0; i < logs.length; i++) {
        if (logs[i].status === 'Taken') {
            currentStreak++;
        } else {
            break; // Streak broken!
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const syncStatus = params.get('sync');

        if (syncStatus === 'success') {
            alert('🎉 Magic! Your medications are now synced to your Google Calendar!');
            navigate('/dashboard', { replace: true });
        } else if (syncStatus === 'error') {
            alert('❌ Oops! The calendar sync failed. Please try again.');
            navigate('/dashboard', { replace: true });
        } else if (syncStatus === 'nomeds') {
            alert('⚠️ You have no active medications to sync!');
            navigate('/dashboard', { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMeds();
        fetchLogs();
    }, [user, navigate]);

    const fetchMeds = async () => {
        try {
            const res = await API.get('/meds');
            setMeds(res.data);
        } catch (error) {
            console.error('Failed to fetch meds', error);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await API.get('/logs');
            setLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddMed = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/meds', formData);
            setMeds([...meds, res.data]);
            setFormData({
                name: '',
                dosage: '',
                time: '',
                frequency: 'Daily',
            });
        } catch (error) {
            console.error('Failed to add med', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/meds/${id}`);
            setMeds(meds.filter((med) => med._id !== id));
        } catch (error) {
            console.error('Failed to delete med', error);
        }
    };

    const handleLogDose = async (medicationId, status) => {
        try {
            await API.post('/logs', { medicationId, status });
            fetchLogs();
        } catch (error) {
            console.error('Failed to log dose', error);
        }
    };

    // 🗣️ Text-to-Speech (Reads AI answer out loud)
    const speakResponse = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    // 🎤 Speech-to-Text (Listens to user)
    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support voice input. Try Chrome!");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript); 
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleAskAI = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsThinking(true);
        setAiResponse('');

        try {
            const res = await API.post('/ai/ask', { question });
            setAiResponse(res.data.answer);
            setQuestion('');
            speakResponse(res.data.answer);
        } catch (error) {
            setAiResponse(
                'I am currently unable to connect to the server. Please try again later.'
            );
        } finally {
            setIsThinking(false);
        }
    };

    const handleTwilioTest = async () => {
        try {
            alert('🚨 Dialing emergency contact...');
            const res = await API.post('/twilio/alert');
            console.log(res.data);
        } catch (error) {
            console.error('Twilio test failed', error);
            alert('❌ Failed to trigger call. Check server console.');
        }
    };

    
    const handleCalendarSync = async () => {
        try {
            const res = await API.get('/calendar/auth');
            window.location.href = res.data.url;
        } catch (error) {
            console.error('Failed to start calendar sync', error);
            alert('Could not connect to Google right now. Make sure your server is running!');
        }
    };

    const handleScanComplete = (data) => {
        setShowScanner(false);
        if (data.safetyWarning && data.safetyWarning !== 'null') {
            alert(`🚨 DRUG INTERACTION DETECTED:\n\n${data.safetyWarning}`);
        } else {
            alert('✅ Scan successful! No interactions found.');
        }
        setFormData((prev) => ({
            ...prev,
            name: data.name || '',
            dosage: data.dosage || '',
        }));
    };

    const handlePrescriptionUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await API.post('/ai/scan-prescription', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.safetyWarning && res.data.safetyWarning !== 'null') {
                alert(`🚨 DRUG INTERACTION DETECTED:\n\n${res.data.safetyWarning}`);
            } else {
                alert('✅ Prescription analyzed successfully!');
            }

            setFormData((prev) => ({
                ...prev,
                name: res.data.name || '',
                dosage: res.data.dosage || '',
                time: res.data.time || '',
                frequency: res.data.frequency || 'Daily',
            }));
        } catch (error) {
            console.error('Failed to parse prescription', error);
            alert('❌ Failed to analyze prescription. Check server console.');
        } finally {
            setIsUploading(false);
            e.target.value = null; 
        }
    };

    // 📄 Generate Doctor Report (PDF)
    const generatePDFReport = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(30, 64, 175); // Indigo
        doc.text("Patient Adherence Report", 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(71, 85, 105); // Slate
        doc.text(`Patient Name: ${user?.name || 'Unknown'}`, 14, 34);
        doc.text(`Adherence Score: ${adherenceScore}%`, 14, 42);
        doc.text(`Current Perfect Streak: ${currentStreak} days`, 14, 50);
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 58);

        // Meds Table
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42); 
        doc.text("Active Medications", 14, 75);
        const medsData = meds.map(m => [m.name, m.dosage, m.time, m.frequency]);
        doc.autoTable({
            startY: 80,
            head: [['Medication Name', 'Dosage', 'Time', 'Frequency']],
            body: medsData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] } // Indigo header
        });

        // Logs Table
        const finalY = doc.lastAutoTable.finalY || 80;
        doc.text("Recent Activity Log", 14, finalY + 15);
        const logsData = logs.slice(0, 15).map(l => [ // Only export last 15 logs
            l.medication ? l.medication.name : 'Deleted Medication',
            l.status,
            new Date(l.date).toLocaleString()
        ]);
        doc.autoTable({
            startY: finalY + 20,
            head: [['Medication', 'Status', 'Date & Time']],
            body: logsData,
            theme: 'grid',
            headStyles: { fillColor: [6, 182, 212] } // Cyan header
        });

        doc.save(`${user?.name || 'Patient'}_Health_Report.pdf`);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-indigo-500/30">
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-cyan-600/5 blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            </div>

            <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/75 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                                Health System
                            </p>
                            <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                                Dashboard
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-neutral-400 md:inline-flex">
                            Welcome,&nbsp;<span className="font-medium text-white">{user?.name}</span>
                        </span>

                       

                        <button
                            onClick={handleTwilioTest}
                            className="inline-flex items-center gap-2 rounded-xl border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-400 transition-all duration-200 hover:border-transparent hover:bg-pink-500 hover:text-white"
                        >
                            <span className="animate-pulse">🚨</span>
                            Call
                        </button>

                        <button
                            onClick={handleCalendarSync}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 transition-all duration-200 hover:bg-neutral-800"
                        >
                            <svg className="h-4 w-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.23 2.18c-3.11 0-5.83 1.83-7.07 4.5H.59v2.24h3.69c-.31 1-.49 2.07-.49 3.19s.18 2.19.49 3.19H.59v2.24h4.57c1.24 2.67 3.96 4.5 7.07 4.5 4.38 0 7.95-3.57 7.95-7.95s-3.57-7.96-7.95-7.96zm0 13.67c-3.14 0-5.71-2.56-5.71-5.71s2.56-5.71 5.71-5.71 5.71 2.56 5.71 5.71-2.57 5.71-5.71 5.71z" />
                            </svg>
                            Sync
                        </button>

                        <button
                            onClick={handleLogout}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-400 transition-all duration-200 hover:bg-white/[0.04] hover:text-white"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                
                {/* DYNAMIC TABS */}
                <div className="mb-8 flex flex-wrap gap-3">
                    {['Overview', 'Medication Management', 'Logs & Insights'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 cursor-pointer ${
                                activeTab === tab
                                    ? 'border border-indigo-500/50 bg-indigo-500/10 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                    : 'border border-white/10 bg-white/[0.04] text-neutral-400 hover:bg-white/[0.08] hover:text-neutral-200'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* AI & ANALYTICS ONLY SHOW ON OVERVIEW & LOGS TABS */}
                {(activeTab === 'Overview' || activeTab === 'Logs & Insights') && (
                    <>
                        <section className="group relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl transition-colors duration-500 hover:border-indigo-500/30 md:p-8">
                            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-80" />
                            <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl transition-all duration-500 group-hover:bg-indigo-500/20" />

                            <div className="relative z-10">
                                <div className="mb-2 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                                        ✨
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">AI Health Assistant</h3>
                                </div>
                                <p className="mb-6 ml-0 text-sm text-neutral-400 md:ml-12">
                                    Ask questions about your daily schedule or past medication logs.
                                </p>

                                <form
                                    onSubmit={handleAskAI}
                                    className="ml-0 flex flex-col gap-4 md:ml-12 md:flex-row"
                                >
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="e.g., Did I take my vitamins today?"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-neutral-950/80 px-5 py-3.5 pr-14 text-white placeholder-neutral-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-neutral-900 focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleVoiceInput}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isListening ? 'bg-pink-500/20 text-pink-400 animate-pulse' : 'text-neutral-500 hover:text-indigo-400 hover:bg-white/5'}`}
                                            title="Click to speak"
                                        >
                                            {isListening ? '🔴' : '🎙️'}
                                        </button>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={isThinking}
                                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-medium transition-all duration-200 ${
                                            isThinking
                                                ? 'cursor-not-allowed bg-neutral-800 text-neutral-400'
                                                : 'bg-white text-black hover:bg-neutral-200 focus:ring-4 focus:ring-white/20'
                                        }`}
                                    >
                                        {isThinking ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Analyzing
                                            </>
                                        ) : (
                                            'Ask AI'
                                        )}
                                    </button>
                                </form>

                                {aiResponse && (
                                    <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/5 bg-neutral-950/50 p-5 shadow-inner md:ml-12">
                                        <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500" />
                                        <p className="m-0 text-sm leading-relaxed text-neutral-300">
                                            <strong className="font-medium text-white">Assistant:</strong> {aiResponse}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="mb-10">
                            {/* 🔥 NEW EXPORT PDF HEADER */}
                            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Health Analytics</h3>
                                </div>
                                <button 
                                    onClick={generatePDFReport}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 w-max"
                                >
                                    📄 Export PDF Report
                                </button>
                            </div>

                            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/10">
                                    
                                    {/* 🔥 FIRE STREAK BADGE */}
                                    {currentStreak > 0 && (
                                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                                            <span>🔥</span> {currentStreak} Day Streak
                                        </div>
                                    )}

                                    <div className="absolute left-0 top-0 h-1 w-full bg-neutral-800">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-1000"
                                            style={{ width: `${adherenceScore}%` }}
                                        />
                                    </div>
                                    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-neutral-400">
                                        Adherence Score
                                    </span>
                                    <div className="text-5xl font-bold tracking-tight text-white mt-2">
                                        {adherenceScore}%
                                    </div>
                                    <p className="mt-2 text-xs text-neutral-500">
                                        {adherenceScore > 80 ? 'Excellent consistency!' : 'Keep pushing forward!'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-5 rounded-3xl border border-white/5 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/10">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-neutral-400">
                                            Doses Taken
                                        </span>
                                        <strong className="text-3xl font-bold text-white">{takenDoses}</strong>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 rounded-3xl border border-white/5 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/10">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10 text-pink-400">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-neutral-400">
                                            Doses Missed
                                        </span>
                                        <strong className="text-3xl font-bold text-white">{totalDoses - takenDoses}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="mx-auto max-w-md">
                                <DigitalTwin score={adherenceScore} />
                            </div>
                        </section>
                    </>
                )}

                {/* BOTTOM DYNAMIC GRID */}
                <div className={`grid grid-cols-1 gap-8 ${activeTab === 'Overview' ? 'lg:grid-cols-5' : 'max-w-5xl mx-auto'}`}>
                    
                    {/* ADD MEDS & ACTIVE SCHEDULE ONLY SHOWS ON OVERVIEW & MEDICATION MANAGEMENT */}
                    {(activeTab === 'Overview' || activeTab === 'Medication Management') && (
                        <div className={`flex flex-col gap-8 ${activeTab === 'Overview' ? 'lg:col-span-3' : 'w-full'}`}>
                            <section className="rounded-3xl border border-white/5 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl md:p-8">
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-xl font-medium text-white">Add Medication</h3>
                                    
                                    <div className="flex gap-2">
                                        {/* UPLOAD PRESCRIPTION BUTTON */}
                                        <input 
                                            type="file" 
                                            id="prescription-upload" 
                                            hidden 
                                            accept="image/*" 
                                            onChange={handlePrescriptionUpload} 
                                        />
                                        <label 
                                            htmlFor="prescription-upload"
                                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-all duration-200 hover:border-transparent hover:bg-cyan-500 hover:text-white cursor-pointer"
                                        >
                                            {isUploading ? (
                                                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            )}
                                            {isUploading ? 'Uploading...' : 'Upload Rx'}
                                        </label>

                                        {/* SCAN BOTTLE BUTTON */}
                                        <button
                                            type="button"
                                            onClick={() => setShowScanner(true)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 transition-all duration-200 hover:border-transparent hover:bg-indigo-500 hover:text-white"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Scan Bottle
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleAddMed} noValidate className="flex flex-col gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-neutral-400">
                                            Medication Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="e.g. Amoxicillin"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-3 text-white placeholder-neutral-600 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-neutral-900 focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-neutral-400">Dosage</label>
                                            <input
                                                type="text"
                                                name="dosage"
                                                placeholder="e.g. 10mg"
                                                value={formData.dosage}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-3 text-white placeholder-neutral-600 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-neutral-900 focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-neutral-400">Time</label>
                                            <input
                                                type="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-neutral-900 focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-neutral-400">Frequency</label>
                                        <div className="relative">
                                            <select
                                                name="frequency"
                                                value={formData.frequency}
                                                onChange={handleChange}
                                                className="w-full appearance-none rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-neutral-900 focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="Daily">Daily</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="As Needed">As Needed</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-2 rounded-xl bg-white py-3 text-sm font-medium text-black transition-all duration-200 hover:bg-neutral-200 focus:ring-4 focus:ring-white/20"
                                    >
                                        Save Medication
                                    </button>
                                </form>
                            </section>

                            <section className="rounded-3xl border border-white/5 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl md:p-8">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-medium text-white">Active Schedule</h3>
                                </div>

                                {meds.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-neutral-950/30 py-12">
                                        <svg className="mb-3 h-12 w-12 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="text-sm text-neutral-500">No active medications scheduled.</p>
                                    </div>
                                ) : (
                                    <ul className="flex flex-col gap-3">
                                        {meds.map((med) => (
                                            <li
                                                key={med._id}
                                                className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/5 bg-neutral-800/30 p-5 transition-all duration-200 hover:border-white/10 hover:bg-neutral-800/50 sm:flex-row sm:items-center"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-indigo-400 sm:mt-0">
                                                        💊
                                                    </div>
                                                    <div>
                                                        <strong className="block text-base font-medium text-white">
                                                            {med.name}
                                                        </strong>
                                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-400">
                                                            <span>{med.dosage}</span>
                                                            <span className="h-1 w-1 rounded-full bg-neutral-600" />
                                                            <span className="flex items-center gap-1 text-indigo-400">
                                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {med.time}
                                                            </span>
                                                            <span className="h-1 w-1 rounded-full bg-neutral-600" />
                                                            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                                                                {med.frequency}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex w-full flex-row items-center gap-3 sm:mt-0 sm:w-auto sm:flex-col sm:items-end sm:gap-2">
                                                    <div className="flex w-full gap-2 sm:w-auto">
                                                        <button
                                                            onClick={() => handleLogDose(med._id, 'Taken')}
                                                            className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 sm:flex-none"
                                                        >
                                                            Take
                                                        </button>
                                                        <button
                                                            onClick={() => handleLogDose(med._id, 'Missed')}
                                                            className="flex-1 rounded-xl border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-xs font-semibold text-pink-400 transition-all hover:bg-pink-500/20 sm:flex-none"
                                                        >
                                                            Skip
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(med._id)}
                                                        className="mt-1 flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-neutral-300 sm:mt-0"
                                                    >
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Remove
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </div>
                    )}

                    {/* RECENT LOGS SHOWS ON OVERVIEW & LOGS TABS */}
                    {(activeTab === 'Overview' || activeTab === 'Logs & Insights') && (
                        <div className={`${activeTab === 'Overview' ? 'lg:col-span-2' : 'w-full'}`}>
                            <section className="flex h-full flex-col rounded-3xl border border-white/5 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl md:p-8">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-neutral-800 text-neutral-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-medium text-white">Recent Logs</h3>
                                </div>

                                {logs.length === 0 ? (
                                    <div className="flex flex-1 flex-col items-center justify-center py-12">
                                        <svg className="mb-3 h-12 w-12 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-neutral-500">No activity recorded yet.</p>
                                    </div>
                                ) : (
                                    <div className="-mr-2 flex-1 space-y-1 overflow-y-auto pr-2">
                                        <ul className="flex flex-col gap-2">
                                            {logs.map((log) => (
                                                <li
                                                    key={log._id}
                                                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-neutral-950/40 p-3 transition-colors duration-200 hover:border-white/10"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                                log.status === 'Taken'
                                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                                    : 'bg-pink-500/10 text-pink-400'
                                                            }`}
                                                        >
                                                            {log.status === 'Taken' ? (
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            )}
                                                        </span>

                                                        <div>
                                                            <strong className="block text-sm font-medium leading-tight text-neutral-200">
                                                                {log.medication ? log.medication.name : 'Deleted Medication'}
                                                            </strong>
                                                            <span className="mt-0.5 block text-xs text-neutral-500 transition-colors group-hover:text-neutral-400">
                                                                {new Date(log.date).toLocaleDateString()} at{' '}
                                                                {new Date(log.date).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </main>

            {showScanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg">
                        <PillScanner
                            onScanComplete={handleScanComplete}
                            onClose={() => setShowScanner(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;