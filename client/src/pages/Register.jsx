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
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.12),_transparent_26%),linear-gradient(to_bottom_right,_#09090b,_#111827,_#0a0a0a)] text-white">
            {/* Ambient background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute bottom-[-7rem] right-[-6rem] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.18]" />
            </div>

            <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[1.05fr_1.35fr]">
                    
                    {/* Left panel */}
                    <div className="relative hidden flex-col justify-between border-r border-white/10 bg-gradient-to-br from-white/8 to-white/[0.03] p-8 lg:flex xl:p-10">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Smart health onboarding
                            </div>

                            <div className="mt-8 max-w-md">
                                <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                                    Create your
                                    <span className="bg-gradient-to-r from-indigo-300 via-white to-cyan-300 bg-clip-text text-transparent">
                                        {' '}health profile
                                    </span>
                                </h1>
                                <p className="mt-4 text-sm leading-6 text-neutral-300">
                                    A premium, secure onboarding experience for managing your medical identity,
                                    emergency contact information, and essential personal details in one place.
                                </p>
                            </div>

                            <div className="mt-10 space-y-4">
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-sm font-medium text-white">Why create an account?</div>
                                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                                        Access a structured health dashboard, organize personal medical details,
                                        and keep emergency information ready when it matters.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                        <div className="text-sm font-medium text-white">Secure onboarding</div>
                                        <div className="mt-1 text-sm text-neutral-400">
                                            Thoughtful form layout with guided sections and better readability.
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                        <div className="text-sm font-medium text-white">Emergency-ready profile</div>
                                        <div className="mt-1 text-sm text-neutral-400">
                                            Keep contact details accessible for important health workflows.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-4 text-sm text-neutral-300">
                            Already registered?
                            <Link
                                to="/login"
                                className="ml-2 font-medium text-white underline underline-offset-4 decoration-white/30 transition hover:text-cyan-300 hover:decoration-cyan-300"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>

                    {/* Right panel */}
                    <div className="p-5 sm:p-8 lg:p-10 xl:p-12">
                        <div className="mx-auto max-w-2xl">
                            <div className="mb-8 lg:hidden">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-200">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    Smart health onboarding
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                            Register account
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-neutral-400">
                                            Complete your details to create a secure and professional health dashboard profile.
                                        </p>
                                    </div>
                                    <Link
                                        to="/login"
                                        className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-white/10 sm:inline-flex"
                                    >
                                        Log in
                                    </Link>
                                </div>
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
                                {/* Account */}
                                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/10 sm:p-6">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-semibold text-indigo-300 ring-1 ring-indigo-400/20">
                                            1
                                        </span>
                                        <div>
                                            <h3 className="text-base font-semibold text-white">Account details</h3>
                                            <p className="text-sm text-neutral-400">Basic credentials for your profile</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-medium text-neutral-200">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-neutral-500 outline-none transition focus:border-indigo-400 focus:bg-black/30 focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-200">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-neutral-500 outline-none transition focus:border-indigo-400 focus:bg-black/30 focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-200">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 pr-12 text-white placeholder-neutral-500 outline-none transition focus:border-indigo-400 focus:bg-black/30 focus:ring-4 focus:ring-indigo-500/10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    className="absolute inset-y-0 right-3 my-auto text-sm text-neutral-400 transition hover:text-white"
                                                >
                                                    {showPassword ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Medical */}
                                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/10 sm:p-6">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-300 ring-1 ring-cyan-400/20">
                                            2
                                        </span>
                                        <div>
                                            <h3 className="text-base font-semibold text-white">Medical profile</h3>
                                            <p className="text-sm text-neutral-400">Personal health information</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-200">Age</label>
                                            <input
                                                type="number"
                                                name="age"
                                                placeholder="28"
                                                value={formData.age}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-neutral-500 outline-none transition focus:border-cyan-400 focus:bg-black/30 focus:ring-4 focus:ring-cyan-500/10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-200">Sex</label>
                                            <div className="relative">
                                                <select
                                                    name="sex"
                                                    value={formData.sex}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full appearance-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400 focus:bg-black/30 focus:ring-4 focus:ring-cyan-500/10"
                                                >
                                                    <option value="" disabled>Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-200">Blood Group</label>
                                            <div className="relative">
                                                <select
                                                    name="bloodGroup"
                                                    value={formData.bloodGroup}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full appearance-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400 focus:bg-black/30 focus:ring-4 focus:ring-cyan-500/10"
                                                >
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
                                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Emergency */}
                                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/10 sm:p-6">
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/15 text-sm font-semibold text-pink-300 ring-1 ring-pink-400/20">
                                            3
                                        </span>
                                        <div>
                                            <h3 className="text-base font-semibold text-white">Emergency protocol</h3>
                                            <p className="text-sm text-neutral-400">
                                                Contact details for urgent medication or health alerts
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-200">Contact Name</label>
                                            <input
                                                type="text"
                                                name="emergencyContactName"
                                                placeholder="e.g. Mom"
                                                value={formData.emergencyContactName}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-neutral-500 outline-none transition focus:border-pink-400 focus:bg-black/30 focus:ring-4 focus:ring-pink-500/10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <label className="text-sm font-medium text-neutral-200">Phone Number</label>
                                                <span className="text-xs text-neutral-500">Include country code</span>
                                            </div>
                                            <input
                                                type="tel"
                                                name="emergencyContactPhone"
                                                placeholder="+1 234 567 890"
                                                value={formData.emergencyContactPhone}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder-neutral-500 outline-none transition focus:border-pink-400 focus:bg-black/30 focus:ring-4 focus:ring-pink-500/10"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm leading-6 text-neutral-400">
                                        By continuing, you are creating your personal profile for the health dashboard.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 ${
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
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>
                                </div>
                            </form>

                            <p className="mt-8 text-center text-sm text-neutral-400 sm:hidden">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-white underline underline-offset-4 decoration-white/30 transition hover:text-cyan-300 hover:decoration-cyan-300"
                                >
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