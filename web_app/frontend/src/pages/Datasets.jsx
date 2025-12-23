import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, FileText, Download, Code, Loader2 } from 'lucide-react';

const Datasets = () => {
    const [availableDatasets, setAvailableDatasets] = useState([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [datasetPreview, setDatasetPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);

    const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL ||
        (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://secure-fl-backend.onrender.com');

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        setLoading(true);
        try {
            const listRes = await axios.get(`${API_URL}/api/v1/datasets`);
            if (listRes.data && listRes.data.length > 0) {
                setAvailableDatasets(listRes.data);
                fetchDataset(listRes.data[0]);
            } else {
                setAvailableDatasets([]);
            }
        } catch (err) {
            console.error("Failed to fetch datasets list", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDataset = async (filename) => {
        if (!filename) return;
        setPreviewLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/v1/datasets/${filename}`);
            setDatasetPreview(res.data);
            setSelectedFile(filename);
        } catch (err) {
            console.error(err);
        } finally {
            setPreviewLoading(false);
        }
    };

    return (
        <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
            <header>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Dataset Explorer</h1>
                <p className="text-blue-200/60 font-medium">Inspect and validate training data partitions.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 flex-1 min-h-0">
                {/* Sidebar List */}
                <div className="card p-0 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-surface/50">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Available Files</h2>
                    </div>
                    <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin" /></div>
                        ) : availableDatasets.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No datasets found.</div>
                        ) : (
                            availableDatasets.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => fetchDataset(f)}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${selectedFile === f
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <FileText size={18} />
                                    <span className="font-medium truncate">{f}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Content Viewer */}
                <div className="md:col-span-3 card flex flex-col min-h-0 bg-surface/50 backdrop-blur-md">
                    {datasetPreview ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{datasetPreview.dataset}</h2>
                                        <p className="text-sm text-gray-400 font-mono">
                                            {(datasetPreview.total_size / 1024).toFixed(2)} KB • UTF-8
                                        </p>
                                    </div>
                                </div>
                                <button className="btn bg-surface hover:bg-white/10 text-white border border-white/10">
                                    <Download size={18} /> Export
                                </button>
                            </div>

                            <div className="relative flex-1 bg-black/40 rounded-xl border border-white/5 overflow-hidden group">
                                {previewLoading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                        <Loader2 className="animate-spin text-primary" size={32} />
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 bg-surface rounded text-gray-400 hover:text-white">
                                        <Code size={16} />
                                    </button>
                                </div>
                                <pre className="p-6 font-mono text-sm text-gray-300 h-full overflow-y-auto custom-scrollbar">
                                    {datasetPreview.preview}
                                </pre>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <div className="p-4 bg-white/5 rounded-full mb-4">
                                <Database size={48} className="opacity-50" />
                            </div>
                            <p>Select a dataset to view contents</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Datasets;
