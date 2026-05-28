import React from 'react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#121212] text-white pt-32 pb-24 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-6">Get in touch</h1>
                    <p className="text-xl text-gray-400">Have questions about Enterprise plans or need technical support? We're here to help.</p>
                </div>

                <div className="bg-[#1E1E1E] border border-white/5 p-8 rounded-2xl">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                <input type="text" className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Jane" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                <input type="text" className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Work Email</label>
                            <input type="email" className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="jane@company.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">How can we help?</label>
                            <textarea rows={4} className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Tell us about your needs..."></textarea>
                        </div>
                        <button type="button" className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
