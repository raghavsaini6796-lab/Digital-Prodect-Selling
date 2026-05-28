import React from 'react';
import Link from 'next/link';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-[#121212] text-white pt-32 pb-24 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 mb-6">
                        Platform Capabilities
                    </div>
                    <h1 className="text-5xl font-bold mb-6">Everything you need to run a digital empire.</h1>
                    <p className="text-xl text-gray-400">Nexus AI replaces your fragmented tool stack. Creation, marketing, and sales—all unified in one automated platform.</p>
                </div>

                <div className="space-y-32">
                    {/* Feature 1: AI Generation */}
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Instant Digital Products</h2>
                            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                                Stop spending weeks writing eBooks or structuring courses. Our advanced AI engine analyzes your niche and generates high-converting, professional digital products in minutes.
                            </p>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Automated eBook generation</li>
                                <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Video course structuring</li>
                                <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Notion template scaffolding</li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
                            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl border border-white/10 bg-[#1E1E1E] overflow-hidden flex items-center justify-center p-8">
                                <div className="w-full h-full border border-white/5 bg-[#121212] rounded-xl flex items-center justify-center text-gray-500 font-mono text-sm shadow-2xl">
                                    [AI Generation Interface UI]
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: DM Automation */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                        <div className="flex-1">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Instagram DM Automation</h2>
                            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                                Turn your followers into customers while you sleep. Tell your audience to comment a keyword, and Nexus AI will automatically DM them the checkout link.
                            </p>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-center gap-3"><span className="text-pink-400">✓</span> Keyword-triggered DMs</li>
                                <li className="flex items-center gap-3"><span className="text-pink-400">✓</span> Story reply automation</li>
                                <li className="flex items-center gap-3"><span className="text-pink-400">✓</span> Meta API compliant</li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="absolute inset-0 bg-pink-500/20 blur-[100px] rounded-full" />
                            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl border border-white/10 bg-[#1E1E1E] overflow-hidden flex items-center justify-center p-8">
                                <div className="w-full h-full border border-white/5 bg-[#121212] rounded-xl flex items-center justify-center text-gray-500 font-mono text-sm shadow-2xl">
                                    [Instagram Automation Flow UI]
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: Growth Engine */}
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Built-in Growth & Affiliates</h2>
                            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                                Don't pay for ads. Let your customers do the marketing for you. Generate affiliate links instantly and track commissions natively without third-party software.
                            </p>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> Custom commission rates</li>
                                <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> Automated referral tracking</li>
                                <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> Affiliate payout dashboard</li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />
                            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl border border-white/10 bg-[#1E1E1E] overflow-hidden flex items-center justify-center p-8">
                                <div className="w-full h-full border border-white/5 bg-[#121212] rounded-xl flex items-center justify-center text-gray-500 font-mono text-sm shadow-2xl">
                                    [Affiliate Dashboard UI]
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-32 text-center">
                    <h2 className="text-3xl font-bold mb-6">Stop juggling tools. Start scaling.</h2>
                    <Link href="/signup" className="inline-block px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors">
                        Start your 14-day free trial
                    </Link>
                </div>
            </div>
        </div>
    );
}
