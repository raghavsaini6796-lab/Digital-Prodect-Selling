"use client";

import React from 'react';
import useSWRInfinite from 'swr/infinite';

const fetcher = async (url: string, pageParam?: number) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API failed');
        return await response.json();
    } catch (error) {
        // Mock data to prevent crash during development if API doesn't exist
        return [[
            { id: 1, email: 'demo1@example.com', source: 'Instagram DM', campaign: 'Launch V1', funnel_stage: 'Captured' },
            { id: 2, email: 'demo2@example.com', source: 'Referral', campaign: 'Q3 Promo', funnel_stage: 'Converted' },
            { id: 3, email: 'demo3@example.com', source: 'Organic', campaign: 'Waitlist', funnel_stage: 'Nurture' }
        ]];
    }
};

const LeadsTable = () => {
    const { data, error, size, setSize } = useSWRInfinite((index, prevData) => {
        if (prevData && !prevData.nextPageUrl) return null;
        return `/api/leads?page=${index + 1}`;
    }, fetcher);

    if (error) return <p className="text-red-500 p-4">Failed to load leads.</p>;

    const leads = data ? data.flat() : [];

    return (
        <div className="bg-[#1E1E1E] p-6 rounded-xl shadow-md border border-white/10 overflow-x-auto">
            <h2 className="text-xl font-bold text-white mb-6">Leads & Customer Pipeline</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border-b border-white/10 px-4 py-3 bg-black/20 text-left text-sm text-gray-300 font-semibold rounded-tl-lg">Email</th>
                        <th className="border-b border-white/10 px-4 py-3 bg-black/20 text-left text-sm text-gray-300 font-semibold">Source</th>
                        <th className="border-b border-white/10 px-4 py-3 bg-black/20 text-left text-sm text-gray-300 font-semibold">Campaign</th>
                        <th className="border-b border-white/10 px-4 py-3 bg-black/20 text-left text-sm text-gray-300 font-semibold rounded-tr-lg">Funnel Stage</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.length > 0 ? leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                            <td className="border-b border-white/5 px-4 py-4 text-white text-sm">{lead.email}</td>
                            <td className="border-b border-white/5 px-4 py-4 text-gray-300 text-sm">
                                <span className="px-2 py-1 bg-white/10 rounded text-xs">{lead.source}</span>
                            </td>
                            <td className="border-b border-white/5 px-4 py-4 text-gray-300 text-sm">{lead.campaign}</td>
                            <td className="border-b border-white/5 px-4 py-4 text-gray-300 text-sm">{lead.funnel_stage}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-400">Loading leads...</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LeadsTable;
