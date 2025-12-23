import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-transparent text-white font-sans selection:bg-primary/30">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center p-4 border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-40">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 mr-4 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold tracking-tight">Secure FL</h1>
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="lg:pl-72 transition-all duration-300">
                <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 animate-fade-in">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
