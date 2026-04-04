import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [meds, setMeds] = useState([]);
    const [logs, setLogs] = useState([]); 
    
    const [formData, setFormData] = useState({
        name: '', dosage: '', time: '', frequency: 'Daily'
    });

    const [question, setQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isThinking, setIsThinking] = useState(false);

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

    return (
        <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: '"Inter", "Segoe UI", sans-serif', color: '#333' }}>
            
            {/* Navbar */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, color: '#1a73e8' }}>Health Dashboard</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: '500' }}>{user?.name}</span>
                    <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#f1f3f4', color: '#5f6368', border: '1px solid #dadce0', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        Logout
                    </button>
                </div>
            </header>

            {/* AI Assistant Section */}
            <section style={{ marginBottom: '30px', background: '#f8fafd', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✨ AI Health Assistant
                </h3>
                <p style={{ margin: '0 0 15px 0', color: '#5f6368', fontSize: '0.95em' }}>Ask questions about your daily schedule or past logs.</p>
                
                <form onSubmit={handleAskAI} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="e.g., Did I take my vitamins today?" 
                        value={question} 
                        onChange={(e) => setQuestion(e.target.value)}
                        style={{ padding: '12px 16px', flex: '1', borderRadius: '6px', border: '1px solid #dadce0', fontSize: '1em', outline: 'none' }}
                    />
                    <button type="submit" disabled={isThinking} style={{ padding: '12px 24px', background: '#1a73e8', color: 'white', fontWeight: '500', border: 'none', borderRadius: '6px', cursor: isThinking ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                        {isThinking ? 'Analyzing...' : 'Ask AI'}
                    </button>
                </form>

                {aiResponse && (
                    <div style={{ marginTop: '20px', padding: '16px', background: 'white', borderLeft: '4px solid #1a73e8', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <p style={{ margin: 0, lineHeight: '1.6', color: '#3c4043' }}><strong>Assistant:</strong> {aiResponse}</p>
                    </div>
                )}
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* Left Column: Add Meds & List */}
                <div>
                    <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                        <h3 style={{ margin: '0 0 20px 0' }}>Add Medication</h3>
                        <form onSubmit={handleAddMed} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" name="name" placeholder="Medication Name" value={formData.name} onChange={handleChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #dadce0' }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" name="dosage" placeholder="Dosage (e.g. 10mg)" value={formData.dosage} onChange={handleChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #dadce0', flex: '1' }} />
                                <input type="time" name="time" value={formData.time} onChange={handleChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #dadce0' }} />
                            </div>
                            <select name="frequency" value={formData.frequency} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #dadce0' }}>
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="As Needed">As Needed</option>
                            </select>
                            <button type="submit" style={{ padding: '12px', background: '#34a853', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}>
                                Save Medication
                            </button>
                        </form>
                    </section>

                    <section>
                        <h3 style={{ margin: '0 0 15px 0' }}>Active Schedule</h3>
                        {meds.length === 0 ? (
                            <p style={{ color: '#80868b' }}>No active medications.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {meds.map((med) => (
                                    <li key={med._id} style={{ background: 'white', border: '1px solid #e2e8f0', margin: '0 0 10px 0', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong style={{ fontSize: '1.1em', display: 'block', marginBottom: '4px' }}>{med.name}</strong>
                                            <span style={{ color: '#5f6368', fontSize: '0.9em' }}>{med.dosage} • ⏰ {med.time} ({med.frequency})</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => handleLogDose(med._id, 'Taken')} style={{ padding: '6px 10px', background: '#e6f4ea', border: 'none', color: '#137333', cursor: 'pointer', borderRadius: '4px', fontWeight: '500', fontSize: '0.85em' }}>Take</button>
                                                <button onClick={() => handleLogDose(med._id, 'Missed')} style={{ padding: '6px 10px', background: '#fce8e6', border: 'none', color: '#c5221f', cursor: 'pointer', borderRadius: '4px', fontWeight: '500', fontSize: '0.85em' }}>Skip</button>
                                            </div>
                                            <button onClick={() => handleDelete(med._id)} style={{ padding: '4px', background: 'transparent', border: 'none', color: '#80868b', cursor: 'pointer', fontSize: '0.8em', textDecoration: 'underline' }}>Remove</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                {/* Right Column: Log History */}
                <div>
                    <section style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', height: '100%' }}>
                        <h3 style={{ margin: '0 0 20px 0' }}>Recent Logs</h3>
                        {logs.length === 0 ? (
                            <p style={{ color: '#80868b' }}>No activity recorded yet.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {logs.map((log) => ( 
                                    <li key={log._id} style={{ padding: '12px 0', borderBottom: '1px solid #f1f3f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: log.status === 'Taken' ? '#34a853' : '#ea4335' }}></span>
                                            <strong style={{ color: '#3c4043' }}>{log.medication ? log.medication.name : 'Deleted Medication'}</strong> 
                                        </div>
                                        <span style={{ color: '#5f6368', fontSize: '0.9em' }}>
                                            {new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;