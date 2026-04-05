import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import PillScanner from '../components/PillScanner';
import DigitalTwin from '../components/DigitalTwin';

function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [meds, setMeds] = useState([]);
    const [logs, setLogs] = useState([]); 
    
    const [formData, setFormData] = useState({
        name: '', dosage: '', time: '', frequency: 'Daily'
    });

    const [question, setQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    
    // Analytics Calculations
    const totalDoses = logs.length;
    const takenDoses = logs.filter(log => log.status === 'Taken').length;
    const adherenceScore = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

    const [showScanner, setShowScanner] = useState(false);

    // Listen for Google Calendar Sync Results in the URL
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
            console.error("Failed to fetch meds", error);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await API.get('/logs');
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
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
            setFormData({ name: '', dosage: '', time: '', frequency: 'Daily' }); 
        } catch (error) {
            console.error("Failed to add med", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/meds/${id}`);
            setMeds(meds.filter((med) => med._id !== id)); 
        } catch (error) {
            console.error("Failed to delete med", error);
        }
    };

    const handleLogDose = async (medicationId, status) => {
        try {
            await API.post('/logs', { medicationId, status });
            fetchLogs();
        } catch (error) {
            console.error("Failed to log dose", error);
        }
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
        } catch (error) {
            setAiResponse("I am currently unable to connect to the server. Please try again later.");
        } finally {
            setIsThinking(false);
        }
    };

    const handleTwilioTest = async () => {
        try {
            alert("🚨 Dialing emergency contact...");
            const res = await API.post('/twilio/alert'); 
            console.log(res.data);
        } catch (error) {
            console.error("Twilio test failed", error);
            alert("❌ Failed to trigger call. Check server console.");
        }
    };

    const handleCalendarSync = async () => {
        try {
            const res = await API.get('/calendar/auth');
            window.location.href = res.data.url; 
        } catch (error) {
            console.error("Failed to start calendar sync", error);
            alert("Could not connect to Google right now. Make sure your server is running!");
        }
    };

    const handleScanComplete = (data) => {
        setShowScanner(false); 

        if (data.safetyWarning && data.safetyWarning !== "null") {
            alert(`🚨 DRUG INTERACTION DETECTED:\n\n${data.safetyWarning}`);
        } else {
            alert(`✅ Scan successful! No interactions found.`);
        }

        setFormData({ 
            ...formData, 
            name: data.name || '', 
            dosage: data.dosage || '' 
        });
    };

    return (
        <div className="min-h-screen bg-[#0b1120] text-slate-200 p-6 md:p-10 font-sans selection:bg-indigo-500/30">
            <div className="max-w-6xl mx-auto">
                
                {/* Navbar */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-slate-800/60 gap-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 m-0 tracking-tight">
                        Health Dashboard
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="font-medium text-slate-400 hidden md:block">Welcome, <span className="text-slate-200">{user?.name}</span></span>
                        
                        {/* EMERGENCY TWILIO BUTTON */}
                        <button onClick={handleTwilioTest} className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white border border-rose-600/50 hover:border-transparent rounded-lg cursor-pointer font-semibold transition-all duration-300 shadow-lg shadow-rose-900/20 hover:shadow-rose-600/40">
                            <span className="animate-pulse">🚨</span> Emergency Call
                        </button>

                        <button onClick={handleCalendarSync} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg cursor-pointer font-medium transition-all duration-300 shadow-lg shadow-black/20">
                            <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12.23 2.18c-3.11 0-5.83 1.83-7.07 4.5H.59v2.24h3.69c-.31 1-.49 2.07-.49 3.19s.18 2.19.49 3.19H.59v2.24h4.57c1.24 2.67 3.96 4.5 7.07 4.5 4.38 0 7.95-3.57 7.95-7.95s-3.57-7.96-7.95-7.96zm0 13.67c-3.14 0-5.71-2.56-5.71-5.71s2.56-5.71 5.71-5.71 5.71 2.56 5.71 5.71-2.57 5.71-5.71 5.71z"/></svg>
                            Sync
                        </button>

                        <button onClick={handleLogout} className="px-4 py-2 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg cursor-pointer font-medium transition-all duration-300">
                            Logout
                        </button>
                    </div>
                </header>

                {/* AI Assistant Section */}
                <section className="mb-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-50"></div>
                    
                    <h3 className="text-xl font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                        ✨ AI Health Assistant
                    </h3>
                    <p className="text-slate-400 mb-6 text-sm">Ask questions about your daily schedule or past logs.</p>
                    
                    <form onSubmit={handleAskAI} className="flex flex-col md:flex-row gap-4">
                        <input 
                            type="text" 
                            placeholder="e.g., Did I take my vitamins today?" 
                            value={question} 
                            onChange={(e) => setQuestion(e.target.value)}
                            className="flex-1 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300"
                        />
                        <button type="submit" disabled={isThinking} className={`flex justify-center items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${isThinking ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 hover:shadow-indigo-600/40'}`}>
                            {isThinking ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Analyzing...
                                </>
                            ) : 'Ask AI'}
                        </button>
                    </form>

                    {aiResponse && (
                        <div className="mt-6 p-5 bg-slate-950/50 border-l-4 border-indigo-500 rounded-r-xl shadow-inner">
                            <p className="m-0 leading-relaxed text-slate-300"><strong className="text-indigo-400">Assistant:</strong> {aiResponse}</p>
                        </div>
                    )}
                </section>

                {/* Analytics Dashboard */}
                <section className="mb-10">
                    <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Health Analytics
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Stat Card 1: Health Score */}
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300">
                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${adherenceScore}%` }}></div>
                            </div>
                            <span className="text-slate-400 text-sm font-medium mb-2 tracking-wide uppercase">Adherence Score</span>
                            <div className="text-5xl font-bold text-white">{adherenceScore}%</div>
                            <p className="text-xs text-slate-500 mt-3">{adherenceScore > 80 ? 'Excellent consistency!' : 'Keep pushing forward!'}</p>
                        </div>

                        {/* Stat Card 2: Total Taken */}
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex items-center gap-5 transition-colors duration-300">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                                <span className="text-slate-400 text-sm font-medium block mb-1 tracking-wide uppercase">Doses Taken</span>
                                <strong className="text-3xl text-white">{takenDoses}</strong>
                            </div>
                        </div>

                        {/* Stat Card 3: Total Missed */}
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex items-center gap-5 transition-colors duration-300">
                            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                            <div>
                                <span className="text-slate-400 text-sm font-medium block mb-1 tracking-wide uppercase">Doses Missed</span>
                                <strong className="text-3xl text-white">{totalDoses - takenDoses}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto">
                        <DigitalTwin score={adherenceScore} />
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Column: Add Meds & List */}
                    <div className="flex flex-col gap-8">
                        <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-slate-200 m-0">Add Medication</h3>
                                <button 
                                    type="button" 
                                    onClick={() => setShowScanner(true)}
                                    className="px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/50 hover:border-transparent rounded-lg font-semibold flex items-center gap-2 transition-all duration-300"
                                >
                                    📸 Scan Bottle
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddMed} noValidate className="flex flex-col gap-4">
                                <input type="text" name="name" placeholder="Medication Name" value={formData.name} onChange={handleChange} required className="bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 outline-none transition-all" />
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input type="text" name="dosage" placeholder="Dosage (e.g. 10mg)" value={formData.dosage} onChange={handleChange} required className="flex-1 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 outline-none transition-all" />
                                    <input type="time" name="time" value={formData.time} onChange={handleChange} required className="bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 outline-none transition-all" />
                                </div>
                                <select name="frequency" value={formData.frequency} onChange={handleChange} className="bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 rounded-xl px-4 py-3 outline-none transition-all appearance-none">
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="As Needed">As Needed</option>
                                </select>
                                <button type="submit" className="mt-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-900/30">
                                    Save Medication
                                </button>
                            </form>
                        </section>

                        <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
                            <h3 className="text-xl font-semibold text-slate-200 mb-6">Active Schedule</h3>
                            {meds.length === 0 ? (
                                <p className="text-slate-500 italic text-center py-8">No active medications scheduled.</p>
                            ) : (
                                <ul className="flex flex-col gap-3">
                                    {meds.map((med) => (
                                        <li key={med._id} className="bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300">
                                            <div>
                                                <strong className="text-lg text-slate-200 block mb-1">{med.name}</strong>
                                                <span className="text-slate-400 text-sm">{med.dosage} • <span className="text-indigo-400">⏰ {med.time}</span> ({med.frequency})</span>
                                            </div>
                                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleLogDose(med._id, 'Taken')} className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-semibold transition-all">Take</button>
                                                    <button onClick={() => handleLogDose(med._id, 'Missed')} className="px-4 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-sm font-semibold transition-all">Skip</button>
                                                </div>
                                                <button onClick={() => handleDelete(med._id)} className="text-slate-500 hover:text-slate-300 text-xs underline transition-colors mt-1 sm:mt-0">Remove</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Log History */}
                    <div>
                        <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl h-full">
                            <h3 className="text-xl font-semibold text-slate-200 mb-6">Recent Logs</h3>
                            {logs.length === 0 ? (
                                <p className="text-slate-500 italic text-center py-8">No activity recorded yet.</p>
                            ) : (
                                <ul className="flex flex-col">
                                    {logs.map((log) => ( 
                                        <li key={log._id} className="py-4 border-b border-slate-800/60 last:border-0 flex justify-between items-center group hover:bg-slate-800/20 px-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${log.status === 'Taken' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'}`}></span>
                                                <strong className="text-slate-300 font-medium">{log.medication ? log.medication.name : 'Deleted Medication'}</strong> 
                                            </div>
                                            <span className="text-slate-500 text-sm group-hover:text-slate-400 transition-colors">
                                                {new Date(log.date).toLocaleDateString()} <span className="opacity-50 mx-1">at</span> {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>

                </div>
            </div>

            {/* THIS IS THE MODAL COMPONENT */}
            {showScanner && (
                <PillScanner 
                    onScanComplete={handleScanComplete} 
                    onClose={() => setShowScanner(false)} 
                />
            )}
        </div>
    );
}

export default Dashboard;