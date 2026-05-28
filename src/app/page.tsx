import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#121212] text-white selection:bg-purple-500/30">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#121212]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold">X</div>
                        <span className="font-bold text-lg tracking-tight">Nexus AI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
                        <Link href="/features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/showcase" className="hover:text-white transition-colors">Showcase</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Log in</Link>
                        <Link href="/signup" className="text-sm bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors">Start Free</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-purple-400 mb-8">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        Nexus AI v2.0 is now live
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                        Scale your digital business on <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Autopilot.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        The all-in-one AI engine that creates products, automates your Instagram DMs, manages referrals, and closes sales while you sleep.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                            Start your 14-day free trial
                        </Link>
                        <Link href="#demo" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold hover:bg-white/10 transition-colors">
                            View Live Demo
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">No credit card required. Cancel anytime.</p>
                </div>

                {/* Dashboard Mockup */}
                <div className="max-w-6xl mx-auto mt-20 relative z-10">
                    <div className="rounded-2xl border border-white/10 bg-[#1E1E1E]/50 backdrop-blur-sm p-2 shadow-2xl">
                        <div className="rounded-xl overflow-hidden border border-white/5 bg-[#121212] aspect-[16/9] relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                            <p className="text-gray-500 font-mono text-sm">Dashboard Analytics Visualization Placeholder</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Replace 5 different SaaS tools with one unified architecture designed specifically for creators and digital businesses.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl bg-[#1E1E1E] border border-white/5 hover:border-purple-500/30 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">AI Product Generation</h3>
                            <p className="text-gray-400 leading-relaxed">Instantly generate high-quality eBooks, templates, and courses using our advanced AI engine. Ready to sell in minutes.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl bg-[#1E1E1E] border border-white/5 hover:border-indigo-500/30 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">IG DM Automation</h3>
                            <p className="text-gray-400 leading-relaxed">Turn comments into sales. Automatically send links to your products when followers comment a specific keyword on your posts.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl bg-[#1E1E1E] border border-white/5 hover:border-emerald-500/30 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Built-in Affiliate System</h3>
                            <p className="text-gray-400 leading-relaxed">Let your customers sell for you. Powerful referral tracking, automatic payouts, and transparent dashboard for your affiliates.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20" />
                <div className="max-w-4xl mx-auto text-center relative z-10 bg-[#1E1E1E] border border-white/10 rounded-3xl p-12 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                    <h2 className="text-4xl font-bold mb-6">Ready to automate your business?</h2>
                    <p className="text-gray-400 mb-8 text-lg">Join thousands of creators who are scaling their income without increasing their screen time.</p>
                    <Link href="/signup" className="inline-block px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors">
                        Get Started for Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 text-sm text-gray-500">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">X</div>
                            <span className="font-bold text-white">Nexus AI</span>
                        </div>
                        <p className="text-gray-500">The growth engine for the modern creator economy.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-medium mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/showcase" className="hover:text-white transition-colors">Showcase</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-medium mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-medium mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/legal/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
                            <li><Link href="/legal/cookie" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between">
                    <p>© 2026 Nexus AI Inc. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
