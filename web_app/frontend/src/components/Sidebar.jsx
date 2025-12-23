import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Database, Settings, BrainCircuit, ShieldCheck } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/clients', label: 'Clients', icon: Users },
        { path: '/models', label: 'Global Models', icon: BrainCircuit },
        { path: '/datasets', label: 'Datasets', icon: Database },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={`
            w-72 h-screen fixed left-0 top-0 flex flex-col pt-6 pb-4 px-4 
            border-r border-white/10 bg-surface/95 backdrop-blur-xl z-50
            transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="px-4 mb-10 flex justify-between items-center">
                <div className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg shadow-primary/20">
                        <ShieldCheck size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Secure FL</h1>
                        <p className="text-xs text-blue-200/60 font-medium tracking-wider uppercase">Enterprise Grid</p>
                    </div>
                </div>
                {/* Close button for mobile */}
                <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                            if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
                        }
                    >
                        <item.icon size={20} className={({ isActive }) => isActive ? "text-primary" : "text-gray-500"} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5 mx-2">
                <div className="bg-gradient-to-br from-surface to-background border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">System Online</p>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono">v2.4.0-stable</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
