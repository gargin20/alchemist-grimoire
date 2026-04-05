import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DigitalTwin from '../components/DigitalTwin';

function Landing() {
    // Typing Effect Logic for the Hero Section
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
            
            {/* INLINE STYLES FOR THE INFINITE SCROLLING MARQUEE */}
            <style>
                {`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-scroll {
                        display: inline-block;
                        white-space: nowrap;
                        animation: scroll 20s linear infinite;
                    }
                `}
            </style>

            {/* FLOATING AMBIENT ORBS (Animated Background) */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse duration-1000" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-cyan-600/10 blur-[120px] animate-pulse duration-1000" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            </div>

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/50 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Alchemist Grimoire</span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Sign In</Link>
                        <Link to="/register" className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/5">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <main className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300 mb-8 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    The Future of Adherence
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                    Never Miss a Dose. <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                        Never Fight Alone.
                    </span>
                </h1>
                
                <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-4">
                    An AI-powered healthcare ecosystem that reads your prescriptions, tracks your adherence, and actively calls your family if you are in danger.
                </p>

                {/* TYPING EFFECT */}
                <div className="h-8 mb-10">
                    <span className="text-cyan-400 font-mono text-sm md:text-base border-r-2 border-cyan-400 pr-1 animate-pulse">
                         {text}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link to="/register" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40">
                        Enter the System
                    </Link>
                    <a href="#features" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20">
                        Explore Features
                    </a>
                </div>
            </main>

            {/* MARQUEE TAPE */}
            <div className="w-full overflow-hidden border-y border-white/5 bg-neutral-950/80 py-4 backdrop-blur-sm">
                <div className="animate-scroll text-sm font-medium text-neutral-500 uppercase tracking-widest">
                    <span className="mx-8">⚠️ 50% of patients fail to take medications correctly</span>
                    <span className="mx-8">🏥 125,000 preventable deaths annually</span>
                    <span className="mx-8">🛡️ Alchemist Grimoire closes the gap between doctor and patient</span>
                    <span className="mx-8">⚠️ 50% of patients fail to take medications correctly</span>
                    <span className="mx-8">🏥 125,000 preventable deaths annually</span>
                    <span className="mx-8">🛡️ Alchemist Grimoire closes the gap between doctor and patient</span>
                </div>
            </div>

            {/* BENTO BOX FEATURES */}
            <section id="features" className="mx-auto max-w-7xl px-6 py-32">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">A Complete Ecosystem</h2>
                    <p className="text-neutral-400">Everything you need to survive and thrive, built into one dashboard.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Feature 1 (Wide) */}
                    <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-indigo-500/30 hover:bg-neutral-900/80 hover:-translate-y-1">
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl transition-all duration-500 group-hover:bg-indigo-500/20" />
                        <div className="relative z-10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 text-2xl">🧠</div>
                            <h3 className="text-2xl font-bold text-white mb-3">Multimodal Vision AI</h3>
                            <p className="text-neutral-400 leading-relaxed max-w-md">
                                Don't type. Just snap a photo. Our elite AI instantly reads messy doctor handwriting to safely extract dosages, check interactions, and build your schedule.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 (Square) */}
                    <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-pink-500/30 hover:bg-neutral-900/80 hover:-translate-y-1">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-500/10 blur-2xl transition-all duration-500 group-hover:bg-pink-500/20" />
                        <div className="relative z-10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-400 text-2xl">🚨</div>
                            <h3 className="text-xl font-bold text-white mb-3">Active Escalation</h3>
                            <p className="text-neutral-400 leading-relaxed text-sm">
                                Push notifications aren't enough. If you miss a critical dose, Alchemist Grimoire automatically dials your emergency contact using Twilio voice.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 (Square) */}
                    <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/30 hover:bg-neutral-900/80 hover:-translate-y-1">
                        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl transition-all duration-500 group-hover:bg-cyan-500/20" />
                        <div className="relative z-10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 text-2xl">🎙️</div>
                            <h3 className="text-xl font-bold text-white mb-3">Voice Intelligence</h3>
                            <p className="text-neutral-400 leading-relaxed text-sm">
                                Designed for absolute accessibility. Ask our AI assistant about your health logs using just your voice, and it talks back.
                            </p>
                        </div>
                    </div>

                    {/* Feature 4 (Wide) */}
                    <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-8 group relative overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-emerald-500/30 hover:bg-neutral-900/80 hover:-translate-y-1">
                        <div className="flex-1 relative z-10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl">📄</div>
                            <h3 className="text-2xl font-bold text-white mb-3">The Doctor Loop</h3>
                            <p className="text-neutral-400 leading-relaxed max-w-md">
                                Generate pristine, gamified adherence reports and clinical PDFs to share with your healthcare provider in one click. Close the loop of care.
                            </p>
                        </div>
                        {/* Interactive Digital Twin Preview */}
                        <div className="w-full md:w-64 shrink-0 rounded-2xl bg-black/40 p-4 border border-white/5">
                            <div className="text-xs text-neutral-500 text-center mb-2 uppercase tracking-widest">Live Preview</div>
                            <DigitalTwin score={85} />
                        </div>
                    </div>

                </div>
            </section>

            {/* FINAL CTA */}
            <section className="relative overflow-hidden border-t border-white/5 bg-neutral-900/30 py-32 text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-600/10 blur-[150px]" />
                <div className="relative z-10 mx-auto max-w-2xl px-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to take control?</h2>
                    <p className="text-xl text-neutral-400 mb-10">
                        Join the platform that works as hard as your doctors do.
                    </p>
                    <Link to="/register" className="inline-block rounded-2xl bg-white px-10 py-5 text-lg font-bold text-black shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:bg-neutral-200">
                        Create Your Free Profile
                    </Link>
                </div>
            </section>

        </div>
    );
}

export default Landing;