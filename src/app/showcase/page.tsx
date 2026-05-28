import React from 'react';
import Link from 'next/link';

export default function ShowcasePage() {
    // Mock data for the showcase gallery
    const showcases = [
        { id: 1, title: 'The Ultimate Guide to Notion', creator: 'Marie P.', sales: '1,204', category: 'Productivity', color: 'from-blue-500 to-cyan-500' },
        { id: 2, title: 'Faceless Instagram Masterclass', creator: 'Growth H.', sales: '3,450', category: 'Marketing', color: 'from-pink-500 to-rose-500' },
        { id: 3, title: 'SaaS Design System Template', creator: 'DesignJ', sales: '890', category: 'Design', color: 'from-purple-500 to-indigo-500' },
        { id: 4, title: '0-10k Twitter Growth Playbook', creator: 'Alex W.', sales: '2,100', category: 'Social Media', color: 'from-emerald-500 to-teal-500' },
        { id: 5, title: 'Figma for Developers', creator: 'Sarah Dev', sales: '5,000+', category: 'Development', color: 'from-orange-500 to-amber-500' },
        { id: 6, title: 'Minimalist Budget Spreadsheet', creator: 'Finance Bro', sales: '450', category: 'Finance', color: 'from-gray-400 to-gray-600' },
    ];

    return (
        <div className="min-h-screen bg-[#121212] text-white pt-32 pb-24 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-5xl font-bold mb-6">Made with Nexus AI</h1>
                    <p className="text-xl text-gray-400">Discover incredible digital products, courses, and templates built and sold by our top creators.</p>
                </div>

                {/* Filter / Categories placeholder */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                    <button className="px-6 py-2 rounded-full bg-white text-black font-semibold">All</button>
                    <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Marketing</button>
                    <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Design</button>
                    <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Productivity</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {showcases.map((item) => (
                        <div key={item.id} className="group relative rounded-3xl bg-[#1E1E1E] border border-white/5 overflow-hidden hover:border-white/20 transition-all cursor-pointer shadow-lg hover:shadow-2xl">
                            {/* Card Image Area */}
                            <div className={`w-full aspect-[4/3] bg-gradient-to-br ${item.color} p-6 flex flex-col justify-between relative`}>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                <div className="relative z-10 flex justify-between items-start">
                                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-bold">{item.category}</span>
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1">
                                        🔥 {item.sales} sales
                                    </span>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold leading-tight mb-2 drop-shadow-md">{item.title}</h3>
                                    <p className="font-medium text-white/80 drop-shadow-sm">by {item.creator}</p>
                                </div>
                            </div>
                            
                            {/* Card Details */}
                            <div className="p-6 flex items-center justify-between bg-[#1A1A1A]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xs">{item.creator[0]}</div>
                                    <span className="text-sm font-medium text-gray-300">View Creator Store</span>
                                </div>
                                <svg className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <p className="text-gray-400 mb-6">Ready to create your own digital product empire?</p>
                    <Link href="/signup" className="inline-block px-8 py-4 bg-purple-500 text-white rounded-full font-semibold hover:bg-purple-600 transition-colors shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]">
                        Start Building Today
                    </Link>
                </div>
            </div>
        </div>
    );
}
