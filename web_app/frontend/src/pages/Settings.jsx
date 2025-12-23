import React from 'react';
import { Save, AlertTriangle } from 'lucide-react';

const Settings = () => {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Configure simulation parameters and system preferences.</p>
            </header>

            <div className="max-w-2xl space-y-8">
                {/* Network Config */}
                <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Network Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Backend API URL</label>
                            <input
                                type="text"
                                disabled
                                value="https://secure-fl-backend.onrender.com"
                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-600 mt-1">Managed via environment variables.</p>
                        </div>
                    </div>
                </section>

                {/* Hyperparameters */}
                <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Hyperparameters</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Min Clients</label>
                            <input type="number" defaultValue={5} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Round Timeout (sec)</label>
                            <input type="number" defaultValue={300} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Learning Rate</label>
                            <input type="number" step="0.001" defaultValue={0.01} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Local Epochs</label>
                            <input type="number" defaultValue={3} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors">
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-red-900/10 p-6 rounded-xl border border-red-900/30">
                    <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} /> Danger Zone
                    </h2>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-300 font-medium">Reset Database</p>
                            <p className="text-sm text-gray-500">Clear all ledger entries and registered clients.</p>
                        </div>
                        <button className="bg-transparent border border-red-800 text-red-500 hover:bg-red-900/20 px-4 py-2 rounded transition-colors text-sm font-medium">
                            Reset Data
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
