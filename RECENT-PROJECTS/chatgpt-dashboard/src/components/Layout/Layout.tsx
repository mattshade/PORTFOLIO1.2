import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

export const Layout: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col md:flex-row text-gray-900 font-sans">
            <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center p-1">
                        <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">ChatGPT Enablement</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-1 md:ml-[17rem] md:mr-6 md:my-6 overflow-x-hidden min-h-screen">
                <div className="glass-panel min-h-[calc(100vh-3rem)] p-4 md:p-8 rounded-none md:rounded-2xl border-x-0 border-t-0 md:border">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
