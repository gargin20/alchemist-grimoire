import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api'; 

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', email: '', password: '',
        age: '', sex: '', bloodGroup: '',
        emergencyContactName: '', emergencyContactPhone: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await API.post('/auth/register', formData);
            alert('Account created successfully! Please log in.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6 md:py-12 font-sans selection:bg-indigo-500/30">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl w-full max-w-2xl relative overflow-hidden">
                
                {/* Top gradient accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-50"></div>
                
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight mb-2">
                        Join Health Dashboard
                    </h2>
                    <p className="text-slate-400 text-sm">Create your comprehensive medical profile.</p>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-center font-medium text-sm shadow-inner">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    
                    {/* SECTION 1: Account Info */}
                    <div>
                        <h4 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2 mb-4 flex items-center gap-2">
                            <span className="bg-indigo-500/20 text-indigo-400 py-0.5 px-2 rounded text-sm">1</span> 
                            Account Details
                        </h4>
                        <div className="flex flex-col gap-4">
                            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300" />
                            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300" />
                            <input type="password" name="password" placeholder="Create Password" value={formData.password} onChange={handleChange} required className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300" />
                        </div>
                    </div>

                    {/* SECTION 2: Medical Profile */}
                    <div>
                        <h4 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2 mb-4 flex items-center gap-2">
                            <span className="bg-cyan-500/20 text-cyan-400 py-0.5 px-2 rounded text-sm">2</span> 
                            Medical Profile
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300" />
                            <select name="sex" value={formData.sex} onChange={handleChange} required className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300 appearance-none">
                                <option value="" disabled>Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300 appearance-none">
                                <option value="" disabled>Blood Type</option>
                                <option value="A+">A+</option><option value="A-">A-</option>
                                <option value="B+">B+</option><option value="B-">B-</option>
                                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                <option value="O+">O+</option><option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    {/* SECTION 3: Emergency Protocol */}
                    <div>
                        <h4 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                            <span className="bg-rose-500/20 text-rose-400 py-0.5 px-2 rounded text-sm">3</span> 
                            Emergency Protocol
                        </h4>
                        <p className="text-sm text-slate-500 mb-4">Who should our AI call if you miss a critical medication?</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input type="text" name="emergencyContactName" placeholder="Contact Name (e.g., Mom)" value={formData.emergencyContactName} onChange={handleChange} required className="w-full flex-1 bg-slate-950/50 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300" />
                            <input type="tel" name="emergencyContactPhone" placeholder="Phone (+91...)" value={formData.emergencyContactPhone} onChange={handleChange} required className="w-full flex-1 bg-slate-950/50 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">* Must include country code (e.g., +91 or +1)</p>
                    </div>

                    <button type="submit" disabled={isLoading} className={`w-full mt-4 flex justify-center items-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${isLoading ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/50 hover:shadow-indigo-600/40'}`}>
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Creating Profile...
                            </>
                        ) : 'Complete Registration'}
                    </button>

                </form>

                <p className="text-center mt-8 text-slate-500 text-sm">
                    Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Log in here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;