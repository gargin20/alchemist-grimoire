import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            navigate('/dashboard'); // Send them to the dashboard on success!
        } catch (err) {
            // Safely render error message whether it's an object or string
            setError(err.response?.data?.message || err.message || 'Failed to login');
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6 font-sans selection:bg-indigo-500/30">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl w-full max-w-md relative overflow-hidden">
                
                {/* Top gradient accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-50"></div>
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-slate-400 text-sm">Secure access to your health dashboard</p>
                </div>
                
                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl mb-6 text-sm text-center font-medium">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300"
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3 outline-none transition-all duration-300"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full mt-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-900/50 hover:shadow-indigo-600/40"
                    >
                        Log In
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-500 text-sm">
                    Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign up here</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;