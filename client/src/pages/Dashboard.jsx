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

    const [isListening, setIsListening] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');

    const totalDoses = logs.length;
    const takenDoses = logs.filter((log) => log.status === 'Taken').length;
    const adherenceScore = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

    let currentStreak = 0;
    for (let i = 0; i < logs.length; i++) {
        if (logs[i].status === 'Taken') { currentStreak++; } else { break; }
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
        if (!user) { navigate('/login'); return; }
        fetchMeds();
        fetchLogs();
    }, [user, navigate]);

    const fetchMeds = async () => {
        try { const res = await API.get('/meds'); setMeds(res.data); }
        catch (error) { console.error('Failed to fetch meds', error); }
    };

    const fetchLogs = async () => {
        try { const res = await API.get('/logs'); setLogs(res.data); }
        catch (error) { console.error('Failed to fetch logs', error); }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleAddMed = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/meds', formData);
            setMeds([...meds, res.data]);
            setFormData({ name: '', dosage: '', time: '', frequency: 'Daily' });
        } catch (error) { console.error('Failed to add med', error); }
    };

    const handleDelete = async (id) => {
        try { await API.delete(`/meds/${id}`); setMeds(meds.filter((med) => med._id !== id)); }
        catch (error) { console.error('Failed to delete med', error); }
    };

    const handleLogDose = async (medicationId, status) => {
        try { await API.post('/logs', { medicationId, status }); fetchLogs(); }
        catch (error) { console.error('Failed to log dose', error); }
    };

    const speakResponse = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { alert("Your browser does not support voice input. Try Chrome!"); return; }
        const recognition = new SpeechRecognition();
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => { const transcript = event.results[0][0].transcript; setQuestion(transcript); setIsListening(false); };
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
            setAiResponse('I am currently unable to connect to the server. Please try again later.');
        } finally { setIsThinking(false); }
    };

    const handleTwilioTest = async () => {
        try { alert('🚨 Dialing emergency contact...'); const res = await API.post('/twilio/alert'); console.log(res.data); }
        catch (error) { console.error('Twilio test failed', error); alert('❌ Failed to trigger call. Check server console.'); }
    };

    const handleCalendarSync = async () => {
        try { const res = await API.get('/calendar/auth'); window.location.href = res.data.url; }
        catch (error) { console.error('Failed to start calendar sync', error); alert('Could not connect to Google right now. Make sure your server is running!'); }
    };

    const handleScanComplete = (data) => {
        setShowScanner(false);
        if (data.safetyWarning && data.safetyWarning !== 'null') {
            alert(`🚨 DRUG INTERACTION DETECTED:\n\n${data.safetyWarning}`);
        } else { alert('✅ Scan successful! No interactions found.'); }
        setFormData((prev) => ({ ...prev, name: data.name || '', dosage: data.dosage || '' }));
    };

    const handlePrescriptionUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const fd = new FormData();
        fd.append('image', file);
        try {
            const res = await API.post('/ai/scan-prescription', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.safetyWarning && res.data.safetyWarning !== 'null') {
                alert(`🚨 DRUG INTERACTION DETECTED:\n\n${res.data.safetyWarning}`);
            } else { alert('✅ Prescription analyzed successfully!'); }
            setFormData((prev) => ({ ...prev, name: res.data.name || '', dosage: res.data.dosage || '', time: res.data.time || '', frequency: res.data.frequency || 'Daily' }));
        } catch (error) { console.error('Failed to parse prescription', error); alert('❌ Failed to analyze prescription. Check server console.'); }
        finally { setIsUploading(false); e.target.value = null; }
    };

    const generatePDFReport = () => {
        const doc = new jsPDF();
        doc.setFontSize(22); doc.setTextColor(30, 64, 175);
        doc.text("Patient Adherence Report", 14, 22);
        doc.setFontSize(12); doc.setTextColor(71, 85, 105);
        doc.text(`Patient Name: ${user?.name || 'Unknown'}`, 14, 34);
        doc.text(`Adherence Score: ${adherenceScore}%`, 14, 42);
        doc.text(`Current Perfect Streak: ${currentStreak} days`, 14, 50);
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 58);
        doc.setFontSize(16); doc.setTextColor(15, 23, 42);
        doc.text("Active Medications", 14, 75);
        const medsData = meds.map(m => [m.name, m.dosage, m.time, m.frequency]);
        doc.autoTable({ startY: 80, head: [['Medication Name', 'Dosage', 'Time', 'Frequency']], body: medsData, theme: 'grid', headStyles: { fillColor: [79, 70, 229] } });
        const finalY = doc.lastAutoTable.finalY || 80;
        doc.text("Recent Activity Log", 14, finalY + 15);
        const logsData = logs.slice(0, 15).map(l => [l.medication ? l.medication.name : 'Deleted Medication', l.status, new Date(l.date).toLocaleString()]);
        doc.autoTable({ startY: finalY + 20, head: [['Medication', 'Status', 'Date & Time']], body: logsData, theme: 'grid', headStyles: { fillColor: [6, 182, 212] } });
        doc.save(`${user?.name || 'Patient'}_Health_Report.pdf`);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-indigo-500/30">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
                * { font-family: 'DM Sans', sans-serif; }
                h1, h2, h3, .font-display { font-family: 'Syne', sans-serif; }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes orb1 {
                    0%, 100% { transform: translate(0,0) scale(1); }
                    50% { transform: translate(3%,2%) scale(1.05); }
                }
                @keyframes orb2 {
                    0%, 100% { transform: translate(0,0) scale(1); }
                    50% { transform: translate(-2%,-3%) scale(0.96); }
                }
                .orb-1 { animation: orb1 18s ease-in-out infinite; }
                .orb-2 { animation: orb2 22s ease-in-out infinite; }
                .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
                .animate-fade-in { animation: fadeIn 0.5s ease both; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }

                .glass-input {
                    background: rgba(9,9,11,0.75);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: white;
                    transition: all 0.2s ease;
                    outline: none;
                }
                .glass-input::placeholder { color: rgba(115,115,115,0.8); }
                .glass-input:focus {
                    background: rgba(9,9,11,0.95);
                    border-color: rgba(99,102,241,0.55);
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.10);
                }
                .nav-blur {
                    background: rgba(9,9,11,0.75);
                    backdrop-filter: blur(24px) saturate(1.5);
                    -webkit-backdrop-filter: blur(24px) saturate(1.5);
                }
                .glass-card {
                    background: rgba(23,23,23,0.55);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .glass-card-hover {
                    transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
                }
                .glass-card-hover:hover {
                    border-color: rgba(99,102,241,0.2);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.06);
                    transform: translateY(-2px);
                }
                .tab-active {
                    border: 1px solid rgba(99,102,241,0.35);
                    background: rgba(99,102,241,0.1);
                    color: #a5b4fc;
                    box-shadow: 0 0 20px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
                }
                .tab-inactive {
                    border: 1px solid rgba(255,255,255,0.07);
                    background: rgba(255,255,255,0.03);
                    color: #737373;
                    transition: all 0.2s ease;
                }
                .tab-inactive:hover {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(255,255,255,0.12);
                    color: #d4d4d4;
                }
                .btn-white {
                    background: white;
                    color: black;
                    transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
                }
                .btn-white:hover:not(:disabled) {
                    background: #e5e7eb;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(255,255,255,0.1);
                }
                .btn-white:disabled { background: rgba(255,255,255,0.1); color: #525252; cursor: not-allowed; }
                .score-bar-fill { transition: width 1.2s cubic-bezier(0.22,1,0.36,1); }
                option { background: #1a1a1a; color: white; }
                .ai-response-enter {
                    animation: fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
                }
            `}</style>

            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="orb-1 absolute top-[-15%] left-[-12%] h-[50%] w-[50%] rounded-full bg-indigo-600" style={{ filter: 'blur(130px)', opacity: 0.08 }} />
                <div className="orb-2 absolute bottom-[-15%] right-[-12%] h-[50%] w-[50%] rounded-full bg-cyan-600" style={{ filter: 'blur(140px)', opacity: 0.07 }} />
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
                        backgroundSize: '36px 36px',
                        opacity: 0.7
                    }}
                />
            </div>

            {/* ─── HEADER ─── */}
            <header className="sticky top-0 z-40 border-b border-white/[0.06] nav-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">

                    {/* Logo + title */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-600 font-medium">Health System</p>
                            <h1 className="font-display text-lg font-bold tracking-tight text-white leading-tight">Dashboard</h1>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <span className="hidden rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 text-xs text-neutral-500 md:inline-flex">
                            Welcome,&nbsp;<span className="font-medium text-neutral-200">{user?.name}</span>
                        </span>

                        <button
                            onClick={handleTwilioTest}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/15 bg-pink-500/[0.08] px-4 py-2 text-xs font-medium text-pink-400 transition-all duration-300 hover:border-pink-500/30 hover:bg-pink-500/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/10"
                        >
                            <span className="animate-pulse">🚨</span>
                            Call
                        </button>

                        <button
                            onClick={handleCalendarSync}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-xs font-medium text-neutral-300 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/[0.14] hover:-translate-y-0.5"
                        >
                            <svg className="h-3.5 w-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.23 2.18c-3.11 0-5.83 1.83-7.07 4.5H.59v2.24h3.69c-.31 1-.49 2.07-.49 3.19s.18 2.19.49 3.19H.59v2.24h4.57c1.24 2.67 3.96 4.5 7.07 4.5 4.38 0 7.95-3.57 7.95-7.95s-3.57-7.96-7.95-7.96zm0 13.67c-3.14 0-5.71-2.56-5.71-5.71s2.56-5.71 5.71-5.71 5.71 2.56 5.71 5.71-2.57 5.71-5.71 5.71z" />
                            </svg>
                            Sync
                        </button>

                        <button
                            onClick={handleLogout}
                            className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-500 transition-all duration-300 hover:bg-white/[0.04] hover:text-neutral-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* ─── MAIN ─── */}
            <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">

                {/* TABS */}
                <div className="animate-fade-in mb-8 flex flex-wrap gap-2">
                    {['Overview', 'Medication Management', 'Logs & Insights'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-full px-5 py-2 text-xs font-medium cursor-pointer transition-all duration-300 ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* AI + ANALYTICS — Overview & Logs tabs */}
                {(activeTab === 'Overview' || activeTab === 'Logs & Insights') && (
                    <>
                        {/* AI SECTION */}
                        <section className="animate-fade-in-up glass-card glass-card-hover group relative mb-8 overflow-hidden rounded-3xl p-6 shadow-xl md:p-8">
                            <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-70" />
                            <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-indigo-500/[0.07] blur-3xl transition-all duration-700 group-hover:bg-indigo-500/[0.12]" />

                            <div className="relative z-10">
                                <div className="mb-1 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/[0.12] text-base">✨</div>
                                    <h3 className="font-display text-lg font-semibold text-white">AI Health Assistant</h3>
                                </div>
                                <p className="mb-6 ml-0 text-xs text-neutral-500 font-light md:ml-11">
                                    Ask questions about your daily schedule or past medication logs.
                                </p>

                                <form onSubmit={handleAskAI} className="ml-0 flex flex-col gap-3 md:ml-11 md:flex-row">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="e.g., Did I take my vitamins today?"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            className="glass-input w-full rounded-2xl px-5 py-3.5 pr-14 text-sm text-white placeholder-neutral-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVoiceInput}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-all duration-200 ${isListening ? 'bg-pink-500/20 text-pink-400 animate-pulse' : 'text-neutral-600 hover:text-indigo-400 hover:bg-white/[0.05]'}`}
                                            title="Click to speak"
                                        >
                                            {isListening ? '🔴' : '🎙️'}
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isThinking}
                                        className={`btn-white inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-semibold ${isThinking ? 'opacity-50' : ''}`}
                                    >
                                        {isThinking ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Analyzing
                                            </>
                                        ) : 'Ask AI'}
                                    </button>
                                </form>

                                {aiResponse && (
                                    <div className="ai-response-enter relative mt-5 overflow-hidden rounded-2xl border border-white/[0.05] bg-neutral-950/60 p-5 md:ml-11">
                                        <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-500/0" />
                                        <p className="m-0 pl-1 text-sm leading-relaxed text-neutral-300">
                                            <strong className="font-semibold text-white">Assistant:</strong>&nbsp;{aiResponse}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ANALYTICS SECTION */}
                        <section className="animate-fade-in-up delay-100 mb-8">
                            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/15 bg-cyan-500/[0.08] text-cyan-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-display text-xl font-semibold text-white">Health Analytics</h3>
                                </div>
                                <button
                                    onClick={generatePDFReport}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-2 text-xs font-medium text-neutral-300 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.14] hover:-translate-y-0.5 w-max"
                                >
                                    📄 Export PDF Report
                                </button>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                                {/* Adherence Score */}
                                <div className="glass-card glass-card-hover relative overflow-hidden rounded-3xl p-6 shadow-xl">
                                    {currentStreak > 0 && (
                                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/[0.08] px-3 py-1 text-[10px] font-bold text-orange-400">
                                            🔥 {currentStreak}d
                                        </div>
                                    )}
                                    <div className="absolute left-0 top-0 h-[2px] w-full bg-neutral-800">
                                        <div className="score-bar-fill h-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${adherenceScore}%` }} />
                                    </div>
                                    <span className="mt-2 mb-1 block text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-600">Adherence Score</span>
                                    <div className="font-display text-5xl font-bold tracking-tight text-white mt-2">{adherenceScore}%</div>
                                    <p className="mt-2 text-[11px] text-neutral-600 font-light">
                                        {adherenceScore > 80 ? '✦ Excellent consistency!' : '↑ Keep pushing forward!'}
                                    </p>
                                </div>

                                {/* Doses Taken */}
                                <div className="glass-card glass-card-hover flex items-center gap-5 rounded-3xl p-6 shadow-xl">
                                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-400" style={{ height: '52px', width: '52px' }}>
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-600">Doses Taken</span>
                                        <strong className="font-display text-4xl font-bold text-white">{takenDoses}</strong>
                                    </div>
                                </div>

                                {/* Doses Missed */}
                                <div className="glass-card glass-card-hover flex items-center gap-5 rounded-3xl p-6 shadow-xl">
                                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-pink-500/15 bg-pink-500/[0.08] text-pink-400" style={{ height: '52px', width: '52px' }}>
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-600">Doses Missed</span>
                                        <strong className="font-display text-4xl font-bold text-white">{totalDoses - takenDoses}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="mx-auto max-w-md">
                                <DigitalTwin score={adherenceScore} />
                            </div>
                        </section>
                    </>
                )}

                {/* BOTTOM GRID */}
                <div className={`grid grid-cols-1 gap-6 ${activeTab === 'Overview' ? 'lg:grid-cols-5' : 'max-w-5xl mx-auto'}`}>

                    {/* ADD MEDS + ACTIVE SCHEDULE */}
                    {(activeTab === 'Overview' || activeTab === 'Medication Management') && (
                        <div className={`flex flex-col gap-6 ${activeTab === 'Overview' ? 'lg:col-span-3' : 'w-full'}`}>

                            {/* ADD MEDICATION */}
                            <section className="animate-fade-in-up glass-card rounded-3xl p-6 shadow-xl md:p-8">
                                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="font-display text-lg font-semibold text-white">Add Medication</h3>
                                    <div className="flex gap-2">
                                        <input type="file" id="prescription-upload" hidden accept="image/*" onChange={handlePrescriptionUpload} />
                                        <label
                                            htmlFor="prescription-upload"
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/15 bg-cyan-500/[0.08] px-3 py-2 text-xs font-medium text-cyan-400 transition-all duration-300 hover:border-cyan-500/30 hover:bg-cyan-500/15 hover:-translate-y-0.5 cursor-pointer"
                                        >
                                            {isUploading ? (
                                                <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            )}
                                            {isUploading ? 'Scanning...' : 'Upload Rx'}
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => setShowScanner(true)}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.08] px-3 py-2 text-xs font-medium text-indigo-400 transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-500/15 hover:-translate-y-0.5"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Scan Bottle
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleAddMed} noValidate className="flex flex-col gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-600">Medication Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="e.g. Amoxicillin"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-600">Dosage</label>
                                            <input
                                                type="text"
                                                name="dosage"
                                                placeholder="e.g. 10mg"
                                                value={formData.dosage}
                                                onChange={handleChange}
                                                required
                                                className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-600">Time</label>
                                            <input
                                                type="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange}
                                                required
                                                className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-600">Frequency</label>
                                        <div className="relative">
                                            <select
                                                name="frequency"
                                                value={formData.frequency}
                                                onChange={handleChange}
                                                className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                                                style={{ paddingRight: '40px', WebkitAppearance: 'none', appearance: 'none' }}
                                            >
                                                <option value="Daily">Daily</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="As Needed">As Needed</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-600">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-white mt-1 rounded-xl py-3 text-sm font-semibold">
                                        Save Medication
                                    </button>
                                </form>
                            </section>

                            {/* ACTIVE SCHEDULE */}
                            <section className="animate-fade-in-up delay-100 glass-card rounded-3xl p-6 shadow-xl md:p-8">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/15 bg-indigo-500/[0.08] text-indigo-400">
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <h3 className="font-display text-lg font-semibold text-white">Active Schedule</h3>
                                    {meds.length > 0 && (
                                        <span className="ml-auto rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-neutral-500">{meds.length} active</span>
                                    )}
                                </div>

                                {meds.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.07] bg-neutral-950/30 py-12">
                                        <svg className="mb-3 h-10 w-10 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="text-xs text-neutral-600 font-light">No active medications scheduled.</p>
                                    </div>
                                ) : (
                                    <ul className="flex flex-col gap-2.5">
                                        {meds.map((med) => (
                                            <li
                                                key={med._id}
                                                className="group flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/[0.05] bg-neutral-950/30 p-4 transition-all duration-300 hover:border-white/[0.09] hover:bg-neutral-950/50 sm:flex-row sm:items-center"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.03] text-base sm:mt-0">💊</div>
                                                    <div>
                                                        <strong className="block text-sm font-semibold text-white">{med.name}</strong>
                                                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                                                            <span>{med.dosage}</span>
                                                            <span className="h-0.5 w-0.5 rounded-full bg-neutral-700" />
                                                            <span className="flex items-center gap-1 text-indigo-400/80">
                                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {med.time}
                                                            </span>
                                                            <span className="h-0.5 w-0.5 rounded-full bg-neutral-700" />
                                                            <span className="rounded border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-neutral-500">{med.frequency}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-1 flex w-full flex-row items-center gap-2 sm:mt-0 sm:w-auto sm:flex-col sm:items-end sm:gap-1.5">
                                                    <div className="flex w-full gap-2 sm:w-auto">
                                                        <button
                                                            onClick={() => handleLogDose(med._id, 'Taken')}
                                                            className="flex-1 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] px-4 py-1.5 text-[11px] font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-500/15 hover:border-emerald-500/30 sm:flex-none"
                                                        >
                                                            Take
                                                        </button>
                                                        <button
                                                            onClick={() => handleLogDose(med._id, 'Missed')}
                                                            className="flex-1 rounded-xl border border-pink-500/15 bg-pink-500/[0.08] px-4 py-1.5 text-[11px] font-semibold text-pink-400 transition-all duration-200 hover:bg-pink-500/15 hover:border-pink-500/30 sm:flex-none"
                                                        >
                                                            Skip
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(med._id)}
                                                        className="flex items-center gap-1 text-[10px] text-neutral-700 transition-colors hover:text-neutral-400"
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

                    {/* RECENT LOGS */}
                    {(activeTab === 'Overview' || activeTab === 'Logs & Insights') && (
                        <div className={`${activeTab === 'Overview' ? 'lg:col-span-2' : 'w-full'}`}>
                            <section className="animate-fade-in-up delay-200 glass-card flex h-full flex-col rounded-3xl p-6 shadow-xl md:p-8">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-neutral-500">
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-display text-lg font-semibold text-white">Recent Logs</h3>
                                    {logs.length > 0 && (
                                        <span className="ml-auto rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-neutral-500">{logs.length} entries</span>
                                    )}
                                </div>

                                {logs.length === 0 ? (
                                    <div className="flex flex-1 flex-col items-center justify-center py-12">
                                        <svg className="mb-3 h-10 w-10 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs text-neutral-700 font-light">No activity recorded yet.</p>
                                    </div>
                                ) : (
                                    <div className="-mr-1 flex-1 space-y-1 overflow-y-auto pr-1" style={{ maxHeight: '520px' }}>
                                        <ul className="flex flex-col gap-2">
                                            {logs.map((log) => (
                                                <li
                                                    key={log._id}
                                                    className="group flex items-center justify-between rounded-xl border border-white/[0.04] bg-neutral-950/40 p-3 transition-all duration-200 hover:border-white/[0.08] hover:bg-neutral-950/60"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${log.status === 'Taken' ? 'border border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-400' : 'border border-pink-500/15 bg-pink-500/[0.08] text-pink-400'}`}>
                                                            {log.status === 'Taken' ? (
                                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            )}
                                                        </span>
                                                        <div>
                                                            <strong className="block text-xs font-semibold leading-tight text-neutral-200">
                                                                {log.medication ? log.medication.name : 'Deleted Medication'}
                                                            </strong>
                                                            <span className="mt-0.5 block text-[10px] text-neutral-600 font-light transition-colors group-hover:text-neutral-500">
                                                                {new Date(log.date).toLocaleDateString()} · {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${log.status === 'Taken' ? 'text-emerald-400 border-emerald-500/15 bg-emerald-500/[0.08]' : 'text-pink-400 border-pink-500/15 bg-pink-500/[0.08]'}`}>
                                                        {log.status}
                                                    </span>
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

            {/* SCANNER MODAL */}
            {showScanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
                    <div className="relative w-full max-w-lg animate-fade-in-up">
                        <PillScanner onScanComplete={handleScanComplete} onClose={() => setShowScanner(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
