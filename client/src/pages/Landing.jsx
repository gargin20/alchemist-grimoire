import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DigitalTwin from '../components/DigitalTwin';

function Landing() {
    const phrases = ["Powered by Gemini Vision AI", "Secured by Twilio Voice", "Synced with Google Calendar"];
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const typingSpeed = 100;

    useEffect(() => {
        let ticker = setTimeout(() => {
            const i = loopNum % phrases.length;
            const fullText = phrases[i];
            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );
            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        }, isDeleting ? typingSpeed / 2 : typingSpeed);
        return () => clearTimeout(ticker);
    }, [text, isDeleting, loopNum]);

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

                * { font-family: 'DM Sans', sans-serif; }
                h1, h2, h3, .font-display { font-family: 'Syne', sans-serif; }

                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll { display: inline-block; white-space: nowrap; animation: scroll 28s linear infinite; }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes orb1 {
                    0%, 100% { transform: translate(0,0) scale(1); }
                    33% { transform: translate(3%,2%) scale(1.04); }
                    66% { transform: translate(-2%,3%) scale(0.97); }
                }
                @keyframes orb2 {
                    0%, 100% { transform: translate(0,0) scale(1); }
                    33% { transform: translate(-3%,-2%) scale(0.96); }
                    66% { transform: translate(2%,-3%) scale(1.03); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .animate-fade-in-up { animation: fadeInUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
                .animate-fade-in { animation: fadeIn 0.6s ease both; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
                .delay-600 { animation-delay: 0.6s; }
                .orb-1 { animation: orb1 14s ease-in-out infinite; }
                .orb-2 { animation: orb2 18s ease-in-out infinite; }
                .shimmer-text {
                    background: linear-gradient(90deg, #818cf8, #a78bfa, #22d3ee, #818cf8);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 4s linear infinite;
                }
                .card-glow:hover {
                    box-shadow: 0 0 40px rgba(99,102,241,0.12), 0 20px 60px rgba(0,0,0,0.4);
                }
                .nav-blur {
                    background: rgba(9,9,11,0.7);
                    backdrop-filter: blur(24px) saturate(1.5);
                    -webkit-backdrop-filter: blur(24px) saturate(1.5);
                }
                .hero-glow {
                    filter: blur(80px);
                    opacity: 0.18;
                }
                .badge-pulse::before {
                    content: '';
                    position: absolute;
                    inset: -1px;
                    border-radius: inherit;
                    background: linear-gradient(90deg, #6366f1, #a855f7, #22d3ee);
                    z-index: -1;
                    opacity: 0.5;
                    animation: pulse 2s ease-in-out infinite;
                }
                @keyframes pulse { 0%,100%{opacity:0.4;} 50%{opacity:0.8;} }
            `}</style>

            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="orb-1 absolute top-[-15%] left-[-12%] h-[55%] w-[55%] rounded-full bg-indigo-600/10 hero-glow" />
                <div className="orb-2 absolute bottom-[-15%] right-[-12%] h-[55%] w-[55%] rounded-full bg-cyan-600/10 hero-glow" />
                <div className="absolute top-[40%] left-[30%] h-[30%] w-[30%] rounded-full bg-purple-600/6 hero-glow" />
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                        opacity: 0.6
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/0 via-neutral-950/0 to-neutral-950/80" />
            </div>

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 border-b border-white/[0.06] nav-blur animate-fade-in">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25">
                            <svg className="h-4 w-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-display text-xl font-bold tracking-tight text-white">Alchemist Grimoire</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="px-4 py-2 text-sm font-medium text-neutral-400 transition-all duration-300 hover:text-white">
                            Sign In
                        </Link>
                        <Link to="/register" className="relative rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:bg-white/[0.12] hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <main className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
                <div className="animate-fade-in-up relative inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/[0.08] px-4 py-2 text-xs font-medium text-indigo-300 mb-10 shadow-[0_0_30px_rgba(99,102,241,0.12)]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    The Future of Medication Adherence
                </div>

                <h1 className="animate-fade-in-up delay-100 font-display text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.05]">
                    Never Miss a Dose.<br />
                    <span className="shimmer-text">Never Fight Alone.</span>
                </h1>

                <p className="animate-fade-in-up delay-200 text-base md:text-lg text-neutral-400 max-w-xl mb-4 leading-relaxed font-light">
                    An AI-powered healthcare ecosystem that reads your prescriptions, tracks your adherence, and actively calls your family if you are in danger.
                </p>

                <div className="animate-fade-in-up delay-300 h-9 mb-10 flex items-center justify-center">
                    <span className="text-cyan-400/90 font-mono text-sm md:text-base tracking-wide">
                        {text}<span className="inline-block w-[2px] h-5 bg-cyan-400 ml-0.5 animate-pulse align-middle" />
                    </span>
                </div>

                <div className="animate-fade-in-up delay-400 flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link to="/register" className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 px-9 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-indigo-500/40 hover:shadow-xl">
                        <span className="relative z-10">Enter the System</span>
                        <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </Link>
                    <a href="#features" className="rounded-2xl border border-white/10 bg-white/[0.04] px-9 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5">
                        Explore Features
                    </a>
                </div>

                {/* Floating stat pills */}
                <div className="animate-fade-in-up delay-500 mt-16 flex flex-wrap items-center justify-center gap-3">
                    {[
                        { icon: '🧠', label: 'Vision AI Scanning' },
                        { icon: '🔒', label: 'End-to-End Secure' },
                        { icon: '📅', label: 'Google Calendar Sync' },
                        { icon: '🚨', label: 'Emergency Escalation' },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-xs text-neutral-400">
                            <span>{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                </div>
            </main>

            {/* MARQUEE */}
            <div className="w-full overflow-hidden border-y border-white/[0.05] bg-neutral-950/90 py-4">
                <div className="animate-scroll text-xs font-medium text-neutral-600 uppercase tracking-[0.15em]">
                    <span className="mx-10">⚠️ 50% of patients fail to take medications correctly</span>
                    <span className="mx-10">🏥 125,000 preventable deaths annually from non-adherence</span>
                    <span className="mx-10">🛡️ Alchemist Grimoire closes the gap between doctor and patient</span>
                    <span className="mx-10">✨ Powered by Gemini Vision AI</span>
                    <span className="mx-10">⚠️ 50% of patients fail to take medications correctly</span>
                    <span className="mx-10">🏥 125,000 preventable deaths annually from non-adherence</span>
                    <span className="mx-10">🛡️ Alchemist Grimoire closes the gap between doctor and patient</span>
                    <span className="mx-10">✨ Powered by Gemini Vision AI</span>
                </div>
            </div>

            {/* BENTO FEATURES */}
            <section id="features" className="mx-auto max-w-7xl px-6 py-32">
                <div className="text-center mb-20 animate-fade-in-up">
                    <p className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-medium mb-4">Everything in one place</p>
                    <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
                        A Complete Ecosystem
                    </h2>
                    <p className="text-neutral-400 max-w-md mx-auto text-base font-light leading-relaxed">
                        Every tool you need to stay healthy, safe, and informed — built into one seamless dashboard.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Feature 1 — Wide */}
                    <div className="md:col-span-2 card-glow group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-indigo-500/20 hover:-translate-y-1">
                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/8 blur-3xl transition-all duration-700 group-hover:bg-indigo-600/15 group-hover:scale-110" />
                        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="relative z-10">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-2xl shadow-lg shadow-indigo-500/10">🧠</div>
                            <h3 className="font-display text-2xl font-bold text-white mb-3">Multimodal Vision AI</h3>
                            <p className="text-neutral-400 leading-relaxed max-w-md text-sm font-light">
                                Don't type. Just snap a photo. Our elite AI instantly reads messy doctor handwriting to safely extract dosages, check interactions, and build your schedule.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="card-glow group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-pink-500/20 hover:-translate-y-1">
                        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-pink-600/8 blur-2xl transition-all duration-700 group-hover:bg-pink-600/15" />
                        <div className="relative z-10">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10 text-2xl shadow-lg shadow-pink-500/10">🚨</div>
                            <h3 className="font-display text-xl font-bold text-white mb-3">Active Escalation</h3>
                            <p className="text-neutral-400 leading-relaxed text-sm font-light">
                                Push notifications aren't enough. If you miss a critical dose, Alchemist Grimoire automatically dials your emergency contact using Twilio voice.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="card-glow group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/20 hover:-translate-y-1">
                        <div className="absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-cyan-600/8 blur-2xl transition-all duration-700 group-hover:bg-cyan-600/15" />
                        <div className="relative z-10">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-2xl shadow-lg shadow-cyan-500/10">🎙️</div>
                            <h3 className="font-display text-xl font-bold text-white mb-3">Voice Intelligence</h3>
                            <p className="text-neutral-400 leading-relaxed text-sm font-light">
                                Designed for absolute accessibility. Ask our AI assistant about your health logs using just your voice, and it talks back.
                            </p>
                        </div>
                    </div>

                    {/* Feature 4 — Wide */}
                    <div className="md:col-span-2 card-glow flex flex-col md:flex-row items-center gap-8 group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-emerald-500/20 hover:-translate-y-1">
                        <div className="absolute -right-10 -bottom-10 h-52 w-52 rounded-full bg-emerald-600/8 blur-3xl transition-all duration-700 group-hover:bg-emerald-600/15" />
                        <div className="flex-1 relative z-10">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-2xl shadow-lg shadow-emerald-500/10">📄</div>
                            <h3 className="font-display text-2xl font-bold text-white mb-3">The Doctor Loop</h3>
                            <p className="text-neutral-400 leading-relaxed max-w-md text-sm font-light">
                                Generate pristine, gamified adherence reports and clinical PDFs to share with your healthcare provider in one click. Close the loop of care.
                            </p>
                        </div>
                        <div className="w-full md:w-64 shrink-0 rounded-2xl border border-white/[0.06] bg-black/40 p-4 backdrop-blur-sm">
                            <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-600 text-center mb-3 font-medium">Live Preview</div>
                            <DigitalTwin score={85} />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative overflow-hidden border-t border-white/[0.05] py-36 text-center">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[120px]" />
                </div>
                <div className="relative z-10 mx-auto max-w-2xl px-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-500/70 font-medium mb-6">Start your journey</p>
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Ready to take control?
                    </h2>
                    <p className="text-lg text-neutral-400 mb-12 font-light leading-relaxed">
                        Join the platform that works as hard as your doctors do.
                    </p>
                    <Link to="/register" className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-white px-10 py-5 text-base font-bold text-black shadow-[0_0_50px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_70px_rgba(255,255,255,0.25)]">
                        Create Your Free Profile
                        <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default Landing;
