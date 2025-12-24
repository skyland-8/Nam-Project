import axios from 'axios';
import { useState, useEffect, useMemo } from 'react';
import { Play, Square, Activity, Database, Server, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = ({ status, startSim, stopSim, logs, metrics, ledger, loading, error }) => {
    const [history, setHistory] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL || 'https://secure-fl-backend.onrender.com';

    useEffect(() => {
        // Fetch history for persistence when simulation is IDLE
        if (status === 'IDLE' && metrics.length === 0) {
            axios.get(`${API_URL}/api/v1/models/history`)
                .then(res => {
                    const formatted = res.data.map(h => ({
                        round: h.round_id,
                        accuracy: h.accuracy,
                        loss: 0 // History doesn't have loss yet
                    })).reverse(); // API returns descending, we want ascending for chart
                    setHistory(formatted);
                })
                .catch(err => console.error("Failed to fetch history:", err));
        }
    }, [status, metrics.length]);

    // Use live metrics if available, otherwise history
    const chartData = metrics.length > 0 ? metrics : history;

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
                    <div className="p-2 bg-red-500/20 rounded-full text-red-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-red-400">System Error</h3>
                        <p className="text-sm text-red-200">{error}</p>
                    </div>
                </div>
            )}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">System Overview</h1>
                    <p className="text-blue-200/60 font-medium">Real-time federated learning orchestration</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={startSim}
                        disabled={status === "RUNNING" || loading}
                        className={`btn ${status === "RUNNING" || loading ? 'bg-surface text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
                    >
                        {loading && status !== "RUNNING" ? <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div> : <Play size={18} fill="currentColor" />}
                        {loading && status !== "RUNNING" ? 'Starting...' : 'Initialize Training'}
                    </button>
                    <button
                        onClick={stopSim}
                        disabled={status !== "RUNNING" || loading}
                        className={`btn ${status !== "RUNNING" || loading ? 'bg-surface text-gray-500 cursor-not-allowed' : 'btn-danger'}`}
                    >
                        {loading && status === "RUNNING" ? <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div> : <Square size={18} fill="currentColor" />}
                        {loading && status === "RUNNING" ? 'Stopping...' : 'Emergency Stop'}
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
                        <p className="text-lg font-bold text-white"># {metrics.length > 0 ? metrics[metrics.length - 1].round : (history.length > 0 ? history[history.length - 1].round : 0)}</p>
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
                            <Activity className="text-primary" size={20} /> Model Accuracy
                        </h2>
                        <span className="text-xs font-mono text-gray-500 bg-surface px-2 py-1 rounded">ACCURACY_METRIC</span>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="round" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 1]} stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
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
