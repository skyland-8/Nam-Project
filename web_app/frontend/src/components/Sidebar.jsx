import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Database, Settings, BrainCircuit, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/clients', label: 'Clients', icon: Users },
        { path: '/models', label: 'Models', icon: BrainCircuit },
        { path: '/datasets', label: 'Datasets', icon: Database },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full fixed left-0 top-0">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                    <ShieldCheck size={28} />
                    Secure FL
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 p-3 rounded-lg text-xs text-gray-500">
                    <p>Version 1.0.0</p>
                    <p>Secure Connection</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
