import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Square, Activity, Database, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
    const [status, setStatus] = useState("IDLE");
    const [logs, setLogs] = useState([]);
    const [ledger, setLedger] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [datasetPreview, setDatasetPreview] = useState(null);

    // API Base URL (Deployed Backend)
    const API_URL = import.meta.env.VITE_API_URL || 'https://secure-fl-backend.onrender.com';

    // Polling
    useEffect(() => {
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const statusRes = await axios.get('http://localhost:5000/api/status');
            setStatus(statusRes.data.status);
            setLogs(statusRes.data.logs.slice().reverse()); // Show newest first

            if (statusRes.data.metrics && statusRes.data.metrics.loss) {
                const chartData = statusRes.data.metrics.rounds.map((r, i) => ({
                    round: r,
                    loss: statusRes.data.metrics.loss[i]
                }));
                setMetrics(chartData);
            }

            const ledgerRes = await axios.get(`${API_URL}/api/ledger`);
            setLedger(ledgerRes.data);

        } catch (err) {
            console.error(err);
        }
    };

    const startSim = async () => {
        try {
            console.log("Attempting to start simulation via:", `${API_URL}/api/start`);
            await axios.post(`${API_URL}/api/start`, { db_password: "1234" });
        } catch (err) {
            console.error("Start Simulation Error:", err);
            alert(`Failed to start: ${err.message}\nURL: ${API_URL}\nCheck Console for details.`);
        }
    };

    const stopSim = async () => {
        try {
            await axios.post(`${API_URL}/api/stop`);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDataset = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/v1/dataset/sample`);
            setDatasetPreview(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8" /> Secure Federated Learning
                    </h1>
                    <p className="text-gray-400 mt-2">Authenticated & Encrypted Model Updates via MySQL Ledger</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={startSim} disabled={status === "RUNNING"} className="flex gap-2 items-center bg-green-600 hover:bg-green-700">
                        <Play size={18} /> Start Simulation
                    </button>
                    <button onClick={stopSim} disabled={status !== "RUNNING"} className="flex gap-2 items-center bg-red-600 hover:bg-red-700">
                        <Square size={18} /> Stop
                    </button>
                    <button onClick={fetchDataset} className="flex gap-2 items-center bg-slate-700 hover:bg-slate-600">
                        <Database size={18} /> View Dataset
                    </button>
                </div>
            </header>

            {/* Dataset Modal/Panel */}
            {datasetPreview && (
                <div className="mb-6 bg-slate-800 p-6 rounded-xl border border-slate-700 relative">
                    <button onClick={() => setDatasetPreview(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                    <h2 className="text-xl font-semibold mb-2 text-yellow-400">Dataset: {datasetPreview.dataset}</h2>
                    <p className="text-sm text-gray-400 mb-4">Size: {Math.round(datasetPreview.total_size / 1024)} KB</p>
                    <div className="bg-slate-900 p-4 rounded font-mono text-xs text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-700">
                        {datasetPreview.preview}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Col: Status & Metrics */}
                <div className="md:col-span-2 space-y-6">
                    {/* Chart */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center">
                            <Activity className="text-blue-400" /> Global Model Loss
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

                    {/* Logs */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-64 overflow-hidden flex flex-col">
                        <h2 className="text-xl font-semibold mb-4">System Logs</h2>
                        <div className="overflow-y-auto flex-1 font-mono text-sm text-gray-300 space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="border-b border-slate-700 pb-1">{log}</div>
                            ))}
                            {logs.length === 0 && <div className="text-gray-500 italic">Waiting for simulation...</div>}
                        </div>
                    </div>
                </div>

                {/* Right Col: Ledger */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-[600px] flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center">
                        <Database className="text-purple-400" /> Secure Ledger
                    </h2>
                    <div className="overflow-y-auto flex-1 space-y-3">
                        {ledger.map((entry) => (
                            <div key={entry.id} className="bg-slate-900 p-3 rounded border-l-4 border-purple-500 text-xs">
                                <div className="flex justify-between font-bold text-gray-400">
                                    <span>Block #{entry.id}</span>
                                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="mt-2 text-gray-300">
                                    <span className="text-blue-400">Client:</span> {entry.client}
                                </div>
                                <div className="mt-1 font-mono break-all text-gray-500">
                                    Enc: {entry.data_hash}
                                </div>
                                <div className="mt-1 font-mono break-all text-green-700">
                                    Sig: {entry.signature}
                                </div>
                            </div>
                        ))}
                        {ledger.length === 0 && <div className="text-gray-500 text-center mt-10">Ledger Empty</div>}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default App
