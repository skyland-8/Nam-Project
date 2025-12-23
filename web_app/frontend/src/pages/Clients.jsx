import React from 'react';
import { UserCheck, Clock } from 'lucide-react';

const Clients = () => {
    // Mock data since API doesn't expose list yet
    const clients = [
        { id: 'client_01', status: 'Online', lastActive: '2 mins ago', contribution: 12 },
        { id: 'client_02', status: 'Training', lastActive: 'Just now', contribution: 8 },
        { id: 'client_03', status: 'Offline', lastActive: '1 hour ago', contribution: 45 },
    ];

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Connected Clients</h1>
                <p className="text-gray-400">Manage participating edge devices in the federation.</p>
            </header>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-slate-950 text-gray-200 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Client ID</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Active</th>
                            <th className="px-6 py-4">Updates Contributed</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {clients.map((client) => (
                            <tr key={client.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400">
                                        <UserCheck size={16} />
                                    </div>
                                    {client.id}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'Online' ? 'bg-green-900/30 text-green-400' :
                                            client.status === 'Training' ? 'bg-yellow-900/30 text-yellow-400' :
                                                'bg-gray-800 text-gray-400'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Online' ? 'bg-green-400' :
                                                client.status === 'Training' ? 'bg-yellow-400' :
                                                    'bg-gray-400'
                                            }`}></span>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <Clock size={14} /> {client.lastActive}
                                </td>
                                <td className="px-6 py-4">
                                    {client.contribution} blocks
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Clients;
