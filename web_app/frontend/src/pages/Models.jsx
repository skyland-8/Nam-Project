import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, GitBranch, Download, ChevronRight, Zap } from 'lucide-react';

const Models = () => {
    const [modelInfo, setModelInfo] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'https://secure-fl-backend.onrender.com';

    useEffect(() => {
        axios.get(`${API_URL}/api/v1/model`)
            .then(res => setModelInfo(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Model Registry</h1>
                <p className="text-blue-200/60 font-medium">Version control for aggregated global models.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Latest Model Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 shadow-2xl shadow-blue-900/50">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/20 rounded-full blur-2xl"></div>

                    <div className="relative">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white mb-2 backdrop-blur-sm">
                                    LATEST RELEASE
                                </span>
                                <h2 className="text-3xl font-bold text-white">Global v{modelInfo?.version || '1.0'}</h2>
                            </div>
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                <Box className="text-white" size={32} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                                <p className="text-blue-100 text-xs font-semibold uppercase">Validation Acc</p>
                                <p className="text-2xl font-bold text-white mt-1">94.2%</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                                <p className="text-blue-100 text-xs font-semibold uppercase">Params</p>
                                <p className="text-2xl font-bold text-white mt-1">12M</p>
                            </div>
                        </div>

                        <button className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-xl">
                            <Download size={20} /> Download Checkpoint
                        </button>
                    </div>
                </div>

                {/* History List */}
                <div className="card">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <GitBranch className="text-accent" size={24} /> Version History
                    </h3>
                    <div className="space-y-2">
                        {modelsHistory.length === 0 && <p className="text-gray-500 italic">No history available.</p>}
                        {modelsHistory.map((model) => (
                            <div key={model.version} className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5">
                                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-gray-400 font-bold group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                    v{model.version}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-semibold flex items-center gap-2">
                                        Model Checkpoint #{model.version}
                                        {/* {model.version === modelInfo?.version && <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary">CURRENT</span>} */}
                                    </h4>
                                    <p className="text-xs text-gray-500">Round {model.round_id} • {new Date(model.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                                        <Zap size={14} /> {(model.accuracy * 100).toFixed(1)}%
                                    </div>
                                    <ChevronRight size={16} className="text-gray-600 ml-auto mt-1 group-hover:translate-x-1 transition-transform" />
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
