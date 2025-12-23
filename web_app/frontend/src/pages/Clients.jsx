import React from 'react';
import { UserCheck, Clock, CheckCircle, Smartphone } from 'lucide-react';

const Clients = () => {
    // Mock data since API doesn't expose list yet
    const clients = [
        { id: 'client_alpha', status: 'Online', lastActive: '2s ago', contribution: 124, device: 'Pixel 7 Pro' },
        { id: 'client_beta', status: 'Training', lastActive: '45s ago', contribution: 89, device: 'Galaxy S23' },
        { id: 'client_gamma', status: 'Offline', lastActive: '2h ago', contribution: 450, device: 'iPhone 14' },
        { id: 'client_delta', status: 'Online', lastActive: '5s ago', contribution: 12, device: 'OnePlus 11' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Connected Clients</h1>
                <p className="text-blue-200/60 font-medium">Manage participating edge devices in the federation.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {clients.map((client) => (
                    <div key={client.id} className="card group hover:border-primary/50 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-inner">
                                <Smartphone className="text-gray-400 group-hover:text-white transition-colors" size={24} />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${client.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    client.status === 'Training' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-gray-800 text-gray-500 border-gray-700'
                                }`}>
                                {client.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{client.id}</h3>
                        <p className="text-sm text-gray-500 mb-6">{client.device}</p>

                        <div className="flex justify-between items-center text-xs text-gray-400 border-t border-white/5 pt-4">
                            <span className="flex items-center gap-1.5">
                                <Clock size={12} /> {client.lastActive}
                            </span>
                            <span className="flex items-center gap-1.5 text-primary">
                                <CheckCircle size={12} /> {client.contribution} blocks
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Clients;
