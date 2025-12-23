import React from 'react';
import { Play, Square, Activity, Database, Server, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = ({ status, startSim, stopSim, logs, metrics, ledger }) => {
    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">System Overview</h1>
                    <p className="text-blue-200/60 font-medium">Real-time federated learning orchestration</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={startSim}
                        disabled={status === "RUNNING"}
                        className={`btn ${status === "RUNNING" ? 'bg-surface text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
                    >
                        <Play size={18} fill="currentColor" /> Initialize Training
                    </button>
                    <button
                        onClick={stopSim}
                        disabled={status !== "RUNNING"}
                        className={`btn ${status !== "RUNNING" ? 'bg-surface text-gray-500 cursor-not-allowed' : 'btn-danger'}`}
                    >
                        <Square size={18} fill="currentColor" /> Emergency Stop
                    </button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium">System Status</p>
                        <p className={`text-lg font-bold ${status === 'RUNNING' ? 'text-emerald-400' : 'text-gray-200'}`}>
                            {status}
                        </p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                        <Database size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Ledger Blocks</p>
                        <p className="text-lg font-bold text-white">{ledger.length}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Active Round</p>
                        <p className="text-lg font-bold text-white"># {metrics.length > 0 ? metrics[metrics.length - 1].round : 0}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Server size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium">API Latency</p>
                        <p className="text-lg font-bold text-white">24ms</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Metrics Chart */}
                <div className="lg:col-span-2 card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex gap-2 items-center">
                            <Activity className="text-primary" size={20} /> Model Convergence
                        </h2>
                        <span className="text-xs font-mono text-gray-500 bg-surface px-2 py-1 rounded">LOSS_METRIC</span>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics}>
                                <defs>
                                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="round" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="loss" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLoss)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secure Ledger Preview */}
                <div className="card flex flex-col h-full">
                    <h2 className="text-xl font-bold mb-6 flex gap-2 items-center">
                        <Database className="text-accent" size={20} /> Recent Blocks
                    </h2>
                    <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
                        {ledger.slice(0, 6).map((entry) => (
                            <div key={entry.id} className="bg-background/50 p-4 rounded-xl border border-white/5 hover:border-accent/30 transition-colors group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">
                                        BLOCK #{entry.id}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-300">
                                    <span className="text-gray-500">Client:</span> {entry.client}
                                </div>
                                <div className="mt-2 text-[10px] font-mono text-gray-600 truncate group-hover:text-gray-400 transition-colors">
                                    {entry.signature}
                                </div>
                            </div>
                        ))}
                        {ledger.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                                <Database size={32} className="mb-2 opacity-20" />
                                <p className="text-sm">Ledger Empty</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Logs */}
                <div className="lg:col-span-3 card h-72 flex flex-col">
                    <h2 className="text-xl font-bold mb-4">System Console</h2>
                    <div className="flex-1 bg-black/40 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-1 text-gray-300 border border-white/5">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3">
                                <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                                <span className={log.includes('Error') ? 'text-red-400' : 'text-gray-300'}>
                                    {log}
                                </span>
                            </div>
                        ))}
                        {logs.length === 0 && <span className="text-gray-600">System idle. Waiting for commands...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
