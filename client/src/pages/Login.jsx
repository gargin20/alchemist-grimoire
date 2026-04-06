import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to login');
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
                    0%, 100% { transform: translate(0,0) scale(1); opacity: 0.12; }
                    50% { transform: translate(4%,3%) scale(1.06); opacity: 0.18; }
                }
                @keyframes orb2 {
                    0%, 100% { transform: translate(0,0) scale(1); opacity: 0.10; }
                    50% { transform: translate(-3%,-4%) scale(0.95); opacity: 0.16; }
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
                    transition: all 0.25s ease;
                }
                .glass-input:focus {
                    background: rgba(9,9,11,0.9);
                    border-color: rgba(99,102,241,0.6);
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.12), 0 0 20px rgba(99,102,241,0.08);
                    outline: none;
                }
                .glass-panel {
                    background: rgba(23,23,23,0.6);
                    backdrop-filter: blur(24px) saturate(1.4);
                    -webkit-backdrop-filter: blur(24px) saturate(1.4);
                }
                .left-panel {
                    background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(6,182,212,0.04) 100%);
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
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
                    height: 1px;
                }
            `}</style>

            {/* AMBIENT BACKGROUND */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="orb-1 absolute left-[-15%] top-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-600" style={{ filter: 'blur(120px)', opacity: 0.12 }} />
                <div className="orb-2 absolute bottom-[-15%] right-[-10%] h-[55%] w-[55%] rounded-full bg-cyan-600" style={{ filter: 'blur(130px)', opacity: 0.10 }} />
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
                        backgroundSize: '36px 36px',
                        opacity: 0.8
                    }}
                />
            </div>

            <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid w-full overflow-hidden rounded-[28px] border border-white/[0.07] shadow-[0_30px_100px_rgba(0,0,0,0.6)] lg:grid-cols-[1fr_1.1fr]" style={{ backdropFilter: 'blur(2px)' }}>

                    {/* LEFT PANEL */}
                    <div className="animate-fade-in-left left-panel relative hidden flex-col justify-between border-r border-white/[0.06] p-8 lg:flex xl:p-12">
                        <div>
                            {/* Logo */}
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
                                Secure health access
                            </div>

                            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight mb-5">
                                Welcome{' '}
                                <span className="shimmer-text">back</span>
                            </h1>
                            <p className="text-sm leading-7 text-neutral-400 font-light max-w-xs">
                                Sign in to access your modern health dashboard, review your personal profile, and manage important medical and emergency information.
                            </p>

                            <div className="mt-10 space-y-3">
                                <div className="divider-line mb-6" />
                                {[
                                    { icon: '⚡', title: 'Fast, focused access', desc: 'Clean interface designed for clarity, comfort, and trust.' },
                                    { icon: '✨', title: 'Premium experience', desc: 'Better spacing, readability, and refined interactions.' },
                                    { icon: '🔒', title: 'Secure dashboard entry', desc: 'Manage your profile with confidence.' },
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
                            New here?{' '}
                            <Link to="/register" className="font-medium text-white underline underline-offset-4 decoration-white/20 transition-all hover:text-cyan-300 hover:decoration-cyan-300">
                                Create account
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="glass-panel flex items-center p-6 sm:p-10 lg:p-12 xl:p-14">
                        <div className="mx-auto w-full max-w-md">

                            {/* Mobile logo */}
                            <div className="mb-8 flex items-center gap-3 lg:hidden">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500">
                                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="font-display text-lg font-bold">Alchemist Grimoire</span>
                            </div>

                            <div className="animate-fade-in-up">
                                <div className="mb-8 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Sign in</h2>
                                        <p className="mt-2 text-sm text-neutral-500 font-light leading-6">
                                            Access your account with a clean, secure experience.
                                        </p>
                                    </div>
                                    <Link to="/register" className="hidden rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-neutral-300 transition-all duration-300 hover:bg-white/[0.09] hover:text-white hover:-translate-y-0.5 sm:inline-flex">
                                        Register
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
                                    <div className="animate-fade-in-up delay-100 space-y-2">
                                        <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="glass-input w-full rounded-2xl px-5 py-3.5 text-white placeholder-neutral-600 text-sm"
                                        />
                                    </div>

                                    <div className="animate-fade-in-up delay-200 space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">Password</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="text-xs text-neutral-500 transition-all hover:text-indigo-400"
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="glass-input w-full rounded-2xl px-5 py-3.5 pr-12 text-white placeholder-neutral-600 text-sm"
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-600">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="animate-fade-in-up delay-300 flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-xs text-neutral-500">
                                        <span>Secure access to your dashboard</span>
                                        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1 text-[11px] font-medium text-emerald-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            Protected
                                        </span>
                                    </div>

                                    <div className="animate-fade-in-up delay-400 pt-1">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold ${
                                                isLoading ? 'cursor-not-allowed opacity-50' : ''
                                            }`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Signing in...
                                                </>
                                            ) : (
                                                <>
                                                    Log In
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>

                                <p className="mt-8 text-center text-sm text-neutral-500">
                                    Don&apos;t have an account?{' '}
                                    <Link to="/register" className="font-medium text-white underline underline-offset-4 decoration-white/20 transition-all hover:text-cyan-300 hover:decoration-cyan-300">
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
