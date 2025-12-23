import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, GitBranch, Download } from 'lucide-react';

const Models = () => {
    const [modelInfo, setModelInfo] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'https://secure-fl-backend.onrender.com';

    useEffect(() => {
        axios.get(`${API_URL}/api/v1/model`)
            .then(res => setModelInfo(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Global Models</h1>
                <p className="text-gray-400">Version history and performance metrics of the aggregated global model.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Latest Model Card */}
                <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30 p-8 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Box size={100} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Current Global Model</h2>
                    <p className="text-blue-200 mb-6">Version {modelInfo?.version || '1.0'}</p>

                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-300">Architecture</span>
                            <span className="font-mono text-white">Transformer (GPT-Micro)</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-300">Last Updated</span>
                            <span className="font-mono text-white">{modelInfo?.timestamp || 'Loading...'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-300">Accuracy (Val)</span>
                            <span className="font-mono text-green-400">87.4%</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/20">
                            <Download size={20} /> Download Weights
                        </button>
                    </div>
                </div>

                {/* History List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                        <GitBranch size={18} /> Version History
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((v) => (
                            <div key={v} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-gray-400 font-bold">
                                    v{v}.0
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-medium">checkpoint_{v}.pt</h4>
                                    <p className="text-xs text-gray-500">Updated 2 days ago</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono text-green-400">Acc: {(80 + v * 2).toFixed(1)}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Models;
