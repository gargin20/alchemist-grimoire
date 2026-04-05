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
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.12),_transparent_26%),linear-gradient(to_bottom_right,_#09090b,_#111827,_#0a0a0a)] text-white">
            {/* Ambient background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute bottom-[-7rem] right-[-6rem] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.18]" />
            </div>

            <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[1.05fr_1.1fr]">
                    
                    {/* Left panel */}
                    <div className="relative hidden flex-col justify-between border-r border-white/10 bg-gradient-to-br from-white/8 to-white/[0.03] p-8 lg:flex xl:p-10">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Secure health access
                            </div>

                            <div className="mt-8 max-w-md">
                                <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                                    Welcome
                                    <span className="bg-gradient-to-r from-indigo-300 via-white to-cyan-300 bg-clip-text text-transparent">
                                        {' '}back
                                    </span>
                                </h1>
                                <p className="mt-4 text-sm leading-6 text-neutral-300">
                                    Sign in to access your modern health dashboard, review your personal profile,
                                    and manage important medical and emergency information in one secure place.
                                </p>
                            </div>

                            <div className="mt-10 space-y-4">
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-sm font-medium text-white">Fast, focused access</div>
                                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                                        Designed for clarity, comfort, and trust with a clean interface and
                                        polished sign-in experience.
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                        <div className="text-sm font-medium text-white">Premium interface</div>
                                        <div className="mt-1 text-sm text-neutral-400">
                                            Better spacing, better readability, and a more refined user experience.
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                        <div className="text-sm font-medium text-white">Secure dashboard entry</div>
                                        <div className="mt-1 text-sm text-neutral-400">
                                            Continue to your dashboard and manage your profile with confidence.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-4 text-sm text-neutral-300">
                            New here?
                            <Link
                                to="/register"
                                className="ml-2 font-medium text-white underline underline-offset-4 decoration-white/30 transition hover:text-cyan-300 hover:decoration-cyan-300"
                            >
                                Create account
                            </Link>
                        </div>
                    </div>

                    {/* Right panel */}
                    <div className="flex items-center p-5 sm:p-8 lg:p-10 xl:p-12">
                        <div className="mx-auto w-full max-w-xl">
                            <div className="mb-8 lg:hidden">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-200">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    Secure health access
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 sm:p-8">
                                <div className="mb-8 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                            Sign in
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-neutral-400">
                                            Access your account with a clean, secure, and professional login experience.
                                        </p>
                                    </div>

                                    <Link
                                        to="/register"
                                        className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-white/10 sm:inline-flex"
                                    >
                                        Register
                                    </Link>
                                </div>

                                {error && (
                                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
                                        <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-200">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-neutral-500 outline-none transition focus:border-indigo-400 focus:bg-black/30 focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <label className="text-sm font-medium text-neutral-200">Password</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="text-xs font-medium text-neutral-400 transition hover:text-white"
                                            >
                                                {showPassword ? 'Hide password' : 'Show password'}
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 pr-12 text-white placeholder-neutral-500 outline-none transition focus:border-indigo-400 focus:bg-black/30 focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-neutral-400">
                                        <span>Secure access to your dashboard</span>
                                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                            Protected
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 ${
                                            isLoading
                                                ? 'cursor-not-allowed border border-white/10 bg-white/10 text-neutral-400'
                                                : 'bg-white text-black shadow-lg shadow-white/10 hover:-translate-y-0.5 hover:bg-neutral-200 focus:outline-none focus:ring-4 focus:ring-white/15'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Signing in...
                                            </>
                                        ) : (
                                            'Log In'
                                        )}
                                    </button>
                                </form>

                                <p className="mt-8 text-center text-sm text-neutral-400">
                                    Don&apos;t have an account?{' '}
                                    <Link
                                        to="/register"
                                        className="font-medium text-white underline underline-offset-4 decoration-white/30 transition hover:text-cyan-300 hover:decoration-cyan-300"
                                    >
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