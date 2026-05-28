"use client";

import React from 'react';

const FunnelChart = () => {
    // Mock funnel data for visualizing the growth pipeline
    const funnelSteps = [
        { label: 'Landing Page Views', count: 12500, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        { label: 'Waitlist Signups', count: 3200, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
        { label: 'Email Confirmations', count: 2800, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
        { label: 'Active Trials', count: 850, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
        { label: 'Paid Conversions', count: 310, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    ];

    const maxCount = funnelSteps[0].count;

    return (
        <div className="bg-[#1E1E1E] p-6 rounded-xl shadow-md border border-white/10 flex flex-col h-full">
            <h2 className="text-xl font-bold text-white mb-6">Funnel Analytics</h2>
            
            <div className="flex-1 flex flex-col justify-center space-y-3">
                {funnelSteps.map((step, index) => {
                    const widthPercent = Math.max((step.count / maxCount) * 100, 15);
                    
                    return (
                        <div key={index} className="flex flex-col items-center w-full">
                            <div 
                                className={`flex justify-between items-center px-4 py-3 rounded-lg border ${step.color} transition-all duration-500`}
                                style={{ width: `${widthPercent}%` }}
                            >
                                <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                                <span className="text-sm font-bold">{step.count.toLocaleString()}</span>
                            </div>
                            {/* Conversion rate indicator between steps */}
                            {index < funnelSteps.length - 1 && (
                                <div className="text-xs text-gray-500 py-1">
                                    {Math.round((funnelSteps[index + 1].count / step.count) * 100)}% conversion
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FunnelChart;
