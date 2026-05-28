import React from 'react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#121212] text-white pt-32 pb-24 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-bold mb-8">About Nexus AI</h1>
                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                        We built Nexus AI because we were tired of duct-taping five different tools together just to sell a digital product online.
                    </p>
                    <div className="bg-[#1E1E1E] border border-white/5 p-8 rounded-2xl mb-12">
                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                        <p className="text-gray-300">
                            To democratize digital entrepreneurship. We believe anyone with knowledge should be able to package it, market it automatically, and scale their income without needing to hire an engineering or marketing team.
                        </p>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">The Platform</h2>
                    <p className="text-gray-300 mb-6">
                        Nexus AI is a unified architecture. By combining AI generation, DM automation, email funnels, and affiliate tracking into a single database, your data flows seamlessly. When a user comments on Instagram, they enter the funnel, receive the product, and become an affiliate—all in one unbroken chain.
                    </p>
                </div>
            </div>
        </div>
    );
}
