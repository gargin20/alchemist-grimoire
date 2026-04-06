import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        sex: '',
        bloodGroup: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
                * { font-family: 'DM Sans', sans-serif; }
                h1, h2, h3, .font-display { font-family: 'Syne', sans-serif; }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-24px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes orb1 {
                    0%, 100% { transform: translate(0,0) scale(1); }
                    50% { transform: translate(3%,2%) scale(1.05); }
                }
                @keyframes orb2 {
                    0%, 100% { transform: translate(0,0) scale(1); }
                    50% { transform: translate(-3%,-3%) scale(0.96); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .animate-fade-in-up { animation: fadeInUp 0.65s cubic-bezier(0.22,1,0.36,1) both; }
                .animate-fade-in-left { animation: fadeInLeft 0.65s cubic-bezier(0.22,1,0.36,1) both; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .orb-1 { animation: orb1 16s ease-in-out infinite; }
                .orb-2 { animation: orb2 20s ease-in-out infinite; }
                .shimmer-text {
                    background: linear-gradient(90deg, #c7d2fe, #ffffff, #a5f3fc, #c7d2fe);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 5s linear infinite;
                }
                .glass-input {
                    background: rgba(9,9,11,0.7);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: white;
                    width: 100%;
                    border-radius: 16px;
                    padding: 14px 20px;
                    font-size: 14px;
                    transition: all 0.25s ease;
                    outline: none;
                    -webkit-appearance: none;
                    appearance: none;
                }
                .glass-input::placeholder { color: rgba(115,115,115,0.8); }
                .glass-input:focus {
                    background: rgba(9,9,11,0.92);
                    border-color: rgba(99,102,241,0.55);
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.10), 0 0 20px rgba(99,102,241,0.07);
                }
                .glass-input-cyan:focus {
                    border-color: rgba(6,182,212,0.55);
                    box-shadow: 0 0 0 3px rgba(6,182,212,0.10);
                }
                .glass-input-pink:focus {
                    border-color: rgba(236,72,153,0.55);
                    box-shadow: 0 0 0 3px rgba(236,72,153,0.10);
                }
                .glass-panel {
                    background: rgba(23,23,23,0.65);
                    backdrop-filter: blur(24px) saturate(1.4);
                    -webkit-backdrop-filter: blur(24px) saturate(1.4);
                }
                .left-panel {
                    background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(6,182,212,0.04) 100%);
                }
                .section-card {
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.06);
                    background: rgba(255,255,255,0.025);
                    padding: 20px 24px 24px;
                }
                .btn-primary {
                    background: white;
                    color: black;
                    transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
                }
                .btn-primary:hover:not(:disabled) {
                    background: #e5e7eb;
                    transform: translateY(-1px);
                    box-shadow: 0 8px 30px rgba(255,255,255,0.12);
                }
                .divider-line {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
                    height: 1px;
                    margin: 24px 0;
                }
                option { background: #1a1a1a; color: white; }
            `}</style>

            {/* AMBIENT BACKGROUND */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="orb-1 absolute left-[-15%] top-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-600" style={{ filter: 'blur(130px)', opacity: 0.11 }} />
                <div className="orb-2 absolute bottom-[-15%] right-[-10%] h-[55%] w-[55%] rounded-full bg-cyan-600" style={{ filter: 'blur(140px)', opacity: 0.09 }} />
                <div className="absolute top-[30%] left-[50%] h-[40%] w-[40%] rounded-full bg-purple-600" style={{ filter: 'blur(120px)', opacity: 0.05 }} />
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
                        backgroundSize: '36px 36px',
                        opacity: 0.8
                    }}
                />
            </div>

            <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid w-full overflow-hidden rounded-[28px] border border-white/[0.07] shadow-[0_30px_100px_rgba(0,0,0,0.6)] lg:grid-cols-[1fr_1.4fr]">

                    {/* LEFT PANEL */}
                    <div className="animate-fade-in-left left-panel relative hidden flex-col justify-between border-r border-white/[0.06] p-8 lg:flex xl:p-12">
                        <div>
                            <div className="flex items-center gap-3 mb-12">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25">
                                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="font-display text-lg font-bold text-white">Alchemist Grimoire</span>
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-300 mb-8">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Smart health onboarding
                            </div>

                            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight mb-5">
                                Create your{' '}
                                <span className="shimmer-text">health profile</span>
                            </h1>
                            <p className="text-sm leading-7 text-neutral-400 font-light max-w-xs">
                                A premium, secure onboarding experience for managing your medical identity and emergency contact information in one place.
                            </p>

                            <div className="divider-line" />

                            <div className="space-y-3">
                                {[
                                    { icon: '🔒', badge: 'indigo', title: 'Secure onboarding', desc: 'Thoughtful form layout with guided sections.' },
                                    { icon: '🚨', badge: 'pink', title: 'Emergency-ready profile', desc: 'Contact details accessible for critical health workflows.' },
                                    { icon: '📋', badge: 'cyan', title: 'Medical identity', desc: 'Blood group, age, and vitals stored safely.' },
                                ].map((item) => (
                                    <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.03] p-4 transition-all duration-300 hover:border-white/[0.09] hover:bg-white/[0.05]">
                                        <span className="mt-0.5 text-base">{item.icon}</span>
                                        <div>
                                            <div className="text-sm font-medium text-white mb-0.5">{item.title}</div>
                                            <div className="text-xs text-neutral-500 font-light leading-5">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10 rounded-2xl border border-white/[0.07] bg-gradient-to-r from-indigo-500/[0.08] to-cyan-500/[0.06] p-4 text-sm text-neutral-400">
                            Already registered?{' '}
                            <Link to="/login" className="font-medium text-white underline underline-offset-4 decoration-white/20 transition-all hover:text-cyan-300 hover:decoration-cyan-300">
                                Sign in
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="glass-panel p-6 sm:p-8 lg:p-10 xl:p-12">
                        <div className="mx-auto max-w-2xl">

                            {/* Mobile header */}
                            <div className="mb-8 flex items-center gap-3 lg:hidden">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500">
                                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="font-display text-lg font-bold">Alchemist Grimoire</span>
                            </div>

                            <div className="animate-fade-in-up mb-8 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Register account</h2>
                                    <p className="mt-2 text-sm text-neutral-500 font-light leading-6">
                                        Complete your details to create a secure health profile.
                                    </p>
                                </div>
                                <Link to="/login" className="hidden rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-neutral-300 transition-all duration-300 hover:bg-white/[0.09] hover:text-white hover:-translate-y-0.5 sm:inline-flex">
                                    Log in
                                </Link>
                            </div>

                            {error && (
                                <div className="animate-fade-in-up mb-6 flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-500/[0.08] px-4 py-4 text-sm text-red-300">
                                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* SECTION 1: Account */}
                                <div className="animate-fade-in-up delay-100 section-card">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/10 text-xs font-bold text-indigo-300">1</span>
                                        <div>
                                            <h3 className="font-display text-sm font-semibold text-white">Account details</h3>
                                            <p className="text-xs text-neutral-500 font-light">Basic credentials for your profile</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Full Name</label>
                                            <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="glass-input" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Email Address</label>
                                            <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="glass-input" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                    className="glass-input"
                                                    style={{ paddingRight: '60px' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    className="absolute inset-y-0 right-4 text-xs text-neutral-500 transition-all hover:text-indigo-400"
                                                >
                                                    {showPassword ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: Medical */}
                                <div className="animate-fade-in-up delay-200 section-card">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10 text-xs font-bold text-cyan-300">2</span>
                                        <div>
                                            <h3 className="font-display text-sm font-semibold text-white">Medical profile</h3>
                                            <p className="text-xs text-neutral-500 font-light">Personal health information</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Age</label>
                                            <input type="number" name="age" placeholder="28" value={formData.age} onChange={handleChange} required className="glass-input glass-input-cyan" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Sex</label>
                                            <div className="relative">
                                                <select name="sex" value={formData.sex} onChange={handleChange} required className="glass-input glass-input-cyan" style={{ paddingRight: '40px' }}>
                                                    <option value="" disabled>Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-600">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Blood Group</label>
                                            <div className="relative">
                                                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className="glass-input glass-input-cyan" style={{ paddingRight: '40px' }}>
                                                    <option value="" disabled>Select</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-600">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: Emergency */}
                                <div className="animate-fade-in-up delay-300 section-card">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-pink-400/20 bg-pink-500/10 text-xs font-bold text-pink-300">3</span>
                                        <div>
                                            <h3 className="font-display text-sm font-semibold text-white">Emergency protocol</h3>
                                            <p className="text-xs text-neutral-500 font-light">Contact details for urgent health alerts</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Contact Name</label>
                                            <input type="text" name="emergencyContactName" placeholder="e.g. Mom" value={formData.emergencyContactName} onChange={handleChange} required className="glass-input glass-input-pink" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Phone Number</label>
                                                <span className="text-[10px] text-neutral-600 font-light">Include country code</span>
                                            </div>
                                            <input type="tel" name="emergencyContactPhone" placeholder="+1 234 567 890" value={formData.emergencyContactPhone} onChange={handleChange} required className="glass-input glass-input-pink" />
                                        </div>
                                    </div>
                                </div>

                                <div className="animate-fade-in-up delay-400 flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-neutral-500 leading-6 font-light max-w-xs">
                                        By continuing, you are creating your personal profile for the health dashboard.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`btn-primary inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            <p className="mt-8 text-center text-sm text-neutral-500 sm:hidden">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-white underline underline-offset-4 decoration-white/20 transition-all hover:text-cyan-300 hover:decoration-cyan-300">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
