import React from 'react';
import { Play, Square, Activity, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ status, startSim, stopSim, logs, metrics, ledger }) => {
    return (
        <div className="space-y-6">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Sim Dashboard</h1>
                    <p className="text-gray-400">Manage and monitor the Federated Learning simulation.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={startSim}
                        disabled={status === "RUNNING"}
                        className={`flex gap-2 items-center px-4 py-2 rounded font-semibold transition-colors ${status === "RUNNING"
                                ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        <Play size={18} /> Start Simulation
                    </button>
                    <button
                        onClick={stopSim}
                        disabled={status !== "RUNNING"}
                        className={`flex gap-2 items-center px-4 py-2 rounded font-semibold transition-colors ${status !== "RUNNING"
                                ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        <Square size={18} /> Stop
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metrics Chart */}
                <div className="md:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center text-blue-400">
                        <Activity size={20} /> Global Model Loss
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="round" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                <Line type="monotone" dataKey="loss" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secure Ledger Preview */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col h-full">
                    <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center text-purple-400">
                        <Database size={20} /> Recent Blocks
                    </h2>
                    <div className="overflow-y-auto flex-1 space-y-3 max-h-[300px]">
                        {ledger.slice(0, 5).map((entry) => (
                            <div key={entry.id} className="bg-slate-950 p-3 rounded border-l-4 border-purple-500 text-xs">
                                <div className="flex justify-between font-bold text-gray-400">
                                    <span>#{entry.id}</span>
                                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="mt-1 text-gray-300">
                                    <span className="text-blue-400">Client:</span> {entry.client}
                                </div>
                            </div>
                        ))}
                        {ledger.length === 0 && <div className="text-gray-500 text-center mt-10">Ledger Empty</div>}
                    </div>
                </div>

                {/* System Logs */}
                <div className="md:col-span-3 bg-slate-900 p-6 rounded-xl border border-slate-800 h-64 overflow-hidden flex flex-col">
                    <h2 className="text-xl font-semibold mb-4">System Logs</h2>
                    <div className="overflow-y-auto flex-1 font-mono text-sm text-gray-300 space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className="border-b border-slate-800 pb-1">{log}</div>
                        ))}
                        {logs.length === 0 && <div className="text-gray-500 italic">Waiting for simulation...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
