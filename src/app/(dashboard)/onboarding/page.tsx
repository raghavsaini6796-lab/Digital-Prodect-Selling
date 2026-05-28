"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [brandName, setBrandName] = useState('');

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-[#121212] pointer-events-none" />
            
            <div className="w-full max-w-2xl bg-[#1E1E1E] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
                
                {/* Progress Bar */}
                <div className="flex gap-2 mb-12">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-purple-500' : 'bg-white/10'}`} />
                    ))}
                </div>

                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Welcome to Nexus AI!</h1>
                        <p className="text-gray-400 mb-8 text-lg">You're 3 steps away from launching your automated digital business. Let's get your store set up.</p>
                        <button onClick={nextStep} className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors">
                            Let's Go
                        </button>
                    </div>
                )}

                {/* Step 2: Brand Setup */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl font-bold mb-2">Set up your brand</h1>
                        <p className="text-gray-400 mb-8">What should we call your creator store?</p>
                        
                        <div className="space-y-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Store Name</label>
                                <input 
                                    type="text" 
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-purple-500 text-lg" 
                                    placeholder="e.g. Design Masterclass" 
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={prevStep} className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors">
                                Back
                            </button>
                            <button onClick={nextStep} disabled={!brandName} className="flex-1 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: IG Connection */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl font-bold mb-2">Connect Instagram</h1>
                        <p className="text-gray-400 mb-8">To enable DM automation, Nexus AI needs access to your Instagram Professional account.</p>
                        
                        <div className="p-6 border border-white/10 rounded-2xl bg-[#121212] mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500" />
                                <div>
                                    <h3 className="font-semibold">Instagram DM Automation</h3>
                                    <p className="text-sm text-gray-500">Not connected</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20">
                                Connect
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={prevStep} className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors">
                                Back
                            </button>
                            <button onClick={nextStep} className="flex-1 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                Skip for now
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h1 className="text-3xl font-bold mb-4">You're all set, {brandName || 'Creator'}!</h1>
                        <p className="text-gray-400 mb-8 text-lg">Your business engine is ready. Let's go to your dashboard and generate your first digital product.</p>
                        
                        <Link href="/dashboard" className="block w-full py-4 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]">
                            Go to Dashboard
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
