import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, FileText } from 'lucide-react';

const Datasets = () => {
    const [availableDatasets, setAvailableDatasets] = useState([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [datasetPreview, setDatasetPreview] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'https://secure-fl-backend.onrender.com';

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            const listRes = await axios.get(`${API_URL}/api/v1/datasets`);
            if (listRes.data && listRes.data.length > 0) {
                setAvailableDatasets(listRes.data);
                // Auto select first
                fetchDataset(listRes.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch datasets list", err);
        }
    };

    const fetchDataset = async (filename) => {
        if (!filename) return;
        try {
            const res = await axios.get(`${API_URL}/api/v1/datasets/${filename}`);
            setDatasetPreview(res.data);
            setSelectedFile(filename);
        } catch (err) {
            console.error(err);
            alert("Failed to load dataset content");
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Datasets</h1>
                <p className="text-gray-400">Inspect training data partitions available on the server.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar List */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <h2 className="text-lg font-semibold mb-4 text-gray-300">Available Files</h2>
                    <div className="space-y-2">
                        {availableDatasets.map((f) => (
                            <button
                                key={f}
                                onClick={() => fetchDataset(f)}
                                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${selectedFile === f ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-slate-800'
                                    }`}
                            >
                                <FileText size={16} />
                                <span className="truncate">{f}</span>
                            </button>
                        ))}
                        {availableDatasets.length === 0 && <div className="text-sm text-gray-500">No datasets found.</div>}
                    </div>
                </div>

                {/* Content Viewer */}
                <div className="md:col-span-3 bg-slate-900 p-6 rounded-xl border border-slate-800 min-h-[500px]">
                    {datasetPreview ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                                    <Database size={20} /> {datasetPreview.dataset}
                                </h2>
                                <span className="text-sm text-gray-500 font-mono">
                                    Size: {Math.round(datasetPreview.total_size / 1024)} KB
                                </span>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-lg font-mono text-sm text-gray-300 whitespace-pre-wrap h-[400px] overflow-y-auto border border-slate-800">
                                {datasetPreview.preview}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">* Showing first 2000 characters only.</p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Database size={48} className="mb-4 opacity-20" />
                            <p>Select a dataset to view content</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Datasets;
