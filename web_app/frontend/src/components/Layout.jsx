import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-transparent text-white font-sans selection:bg-primary/30">
            <Sidebar />
            <div className="pl-72 transition-all duration-300">
                <div className="max-w-7xl mx-auto p-8 lg:p-12 animate-fade-in">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
