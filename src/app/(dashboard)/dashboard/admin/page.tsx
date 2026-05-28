"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AdminDashboard = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            // Basic auth check: if no session, redirect. 
            // In a real production app, also verify user role is 'admin' via DB.
            if (!session) {
                router.push('/login');
            } else {
                setLoading(false);
            }
        };
        checkSession();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#121212]">
                <p className="text-white">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-6 bg-[#121212] min-h-screen">
            <h1 className="text-white text-3xl mb-8 font-bold">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Management */}
                <div className="bg-[#1E1E1E] p-6 rounded-xl border border-white/10 shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">User Management</h2>
                    <p className="text-gray-400 text-sm">Manage user roles, bans, and permissions.</p>
                    {/* Add user management component here */}
                </div>
                
                {/* Product Moderation */}
                <div className="bg-[#1E1E1E] p-6 rounded-xl border border-white/10 shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Product Moderation</h2>
                    <p className="text-gray-400 text-sm">Review, approve, or reject products.</p>
                    {/* Add product moderation component here */}
                </div>
                
                {/* System Monitoring */}
                <div className="bg-[#1E1E1E] p-6 rounded-xl border border-white/10 shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">System Monitoring</h2>
                    <p className="text-gray-400 text-sm">View realtime health and error rates.</p>
                    {/* Add system monitoring component here */}
                </div>
                
                {/* Queue & Payment Monitoring */}
                <div className="bg-[#1E1E1E] p-6 rounded-xl border border-white/10 shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Queue & Payment Monitoring</h2>
                    <p className="text-gray-400 text-sm">Monitor Stripe payments and background jobs.</p>
                    {/* Add queue and payment monitoring component here */}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
