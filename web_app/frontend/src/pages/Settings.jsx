import React from 'react';
import { Save, AlertTriangle, Globe, Lock, Sliders, RefreshCw } from 'lucide-react';

const Settings = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Configuration</h1>
                <p className="text-blue-200/60 font-medium">Customize simulation parameters and security protocols.</p>
            </header>

            <div className="space-y-6">
                {/* Network Config */}
                <section className="card">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-primary">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Network & API</h2>
                            <p className="text-gray-400 text-sm">Manage connection endpoints and timeouts.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Backend Endpoint</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    disabled
                                    value="https://secure-fl-backend.onrender.com"
                                    className="input-field w-full opacity-50 cursor-not-allowed"
                                />
                                <div className="flex items-center px-4 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                                    ONLINE
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hyperparameters */}
                <section className="card">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-accent">
                            <Sliders size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Training Hyperparameters</h2>
                            <p className="text-gray-400 text-sm">Fine-tune the federated averaging algorithm.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Min Clients per Round</label>
                            <input type="number" defaultValue={5} className="input-field w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Round Timeout (sec)</label>
                            <input type="number" defaultValue={300} className="input-field w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Learning Rate</label>
                            <input type="number" step="0.001" defaultValue={0.01} className="input-field w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Local Epochs</label>
                            <input type="number" defaultValue={3} className="input-field w-full" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end border-t border-white/5 pt-6">
                        <button className="btn btn-primary">
                            <Save size={18} /> Save Configuration
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-4 text-red-400 mb-4">
                        <AlertTriangle size={24} />
                        <h2 className="text-xl font-bold">Danger Zone</h2>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-white font-medium">Reset System State</p>
                            <p className="text-sm text-red-200/60">This will wipe all ledger entries and client registrations.</p>
                        </div>
                        <button className="btn btn-danger">
                            <RefreshCw size={18} /> Reset Data
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
