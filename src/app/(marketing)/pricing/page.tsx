import React from 'react';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#121212] text-white pt-32 pb-24 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-5xl font-bold mb-6">Simple, transparent pricing</h1>
                    <p className="text-xl text-gray-400">Start for free, then scale as your business grows. No hidden fees.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-24">
                    {/* Free Plan */}
                    <div className="p-8 rounded-2xl bg-[#1E1E1E] border border-white/5 flex flex-col">
                        <h3 className="text-2xl font-bold mb-2">Free</h3>
                        <p className="text-gray-400 mb-6 text-sm">Perfect for exploring the platform.</p>
                        <div className="text-4xl font-bold mb-8">$0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                        <Link href="/signup" className="w-full py-3 px-6 rounded-full bg-white/5 border border-white/10 text-center font-semibold hover:bg-white/10 transition-colors mb-8">
                            Get Started
                        </Link>
                        <ul className="space-y-4 text-sm text-gray-300 flex-1">
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> 1 AI Product Generation</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> 50 Leads / month</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Basic Link in Bio</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Standard Support</li>
                        </ul>
                    </div>

                    {/* Starter Plan */}
                    <div className="p-8 rounded-2xl bg-[#1E1E1E] border border-white/5 flex flex-col relative">
                        <h3 className="text-2xl font-bold mb-2">Starter</h3>
                        <p className="text-gray-400 mb-6 text-sm">For early-stage digital creators.</p>
                        <div className="text-4xl font-bold mb-8">$29<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                        <Link href="/signup?plan=starter" className="w-full py-3 px-6 rounded-full bg-white/5 border border-white/10 text-center font-semibold hover:bg-white/10 transition-colors mb-8">
                            Start 14-Day Trial
                        </Link>
                        <ul className="space-y-4 text-sm text-gray-300 flex-1">
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> 5 AI Product Generations</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> 1,000 Leads / month</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Basic DM Automation</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> 1 Email Funnel</li>
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-8 rounded-2xl bg-gradient-to-b from-purple-900/20 to-[#1E1E1E] border border-purple-500/30 flex flex-col relative shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">MOST POPULAR</div>
                        <h3 className="text-2xl font-bold mb-2">Pro</h3>
                        <p className="text-gray-400 mb-6 text-sm">For scaling automated businesses.</p>
                        <div className="text-4xl font-bold mb-8">$99<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                        <Link href="/signup?plan=pro" className="w-full py-3 px-6 rounded-full bg-white text-black text-center font-semibold hover:bg-gray-200 transition-colors mb-8 shadow-lg">
                            Start 14-Day Trial
                        </Link>
                        <ul className="space-y-4 text-sm text-gray-300 flex-1">
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Unlimited AI Products</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> 10,000 Leads / month</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Full DM Automation</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Affiliate & Referral System</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Priority Support</li>
                        </ul>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="p-8 rounded-2xl bg-[#1E1E1E] border border-white/5 flex flex-col">
                        <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                        <p className="text-gray-400 mb-6 text-sm">For massive scale and custom needs.</p>
                        <div className="text-4xl font-bold mb-8">$299<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                        <Link href="/contact" className="w-full py-3 px-6 rounded-full bg-white/5 border border-white/10 text-center font-semibold hover:bg-white/10 transition-colors mb-8">
                            Contact Sales
                        </Link>
                        <ul className="space-y-4 text-sm text-gray-300 flex-1">
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Everything in Pro</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Unlimited Leads</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Custom Domain & Branding</li>
                            <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> Dedicated Success Manager</li>
                        </ul>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-[#1E1E1E] border border-white/5">
                            <h4 className="text-lg font-semibold mb-2">Can I switch plans later?</h4>
                            <p className="text-gray-400 text-sm">Absolutely. You can upgrade or downgrade your plan at any time. Prorated charges or credits will be applied automatically.</p>
                        </div>
                        <div className="p-6 rounded-xl bg-[#1E1E1E] border border-white/5">
                            <h4 className="text-lg font-semibold mb-2">What happens when I hit my lead limit?</h4>
                            <p className="text-gray-400 text-sm">We'll never block your growth. We will continue to capture leads and simply notify you to upgrade your plan for the next billing cycle.</p>
                        </div>
                        <div className="p-6 rounded-xl bg-[#1E1E1E] border border-white/5">
                            <h4 className="text-lg font-semibold mb-2">Is there a contract or commitment?</h4>
                            <p className="text-gray-400 text-sm">No, all plans are month-to-month by default. You can cancel your subscription anytime with just two clicks.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
