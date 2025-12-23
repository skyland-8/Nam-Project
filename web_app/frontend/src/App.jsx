import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Models from './pages/Models';
import Datasets from './pages/Datasets';
import Settings from './pages/Settings';

function App() {
    const [status, setStatus] = useState("IDLE");
    const [logs, setLogs] = useState([]);
    const [ledger, setLedger] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(false);

    // API Base URL (Deployed Backend or Local)
    // Check if running on localhost to default to local backend
    const API_URL = import.meta.env.VITE_API_URL ||
        (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://secure-fl-backend.onrender.com');

    // Polling for Dashboard Data
    useEffect(() => {
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            // Local backend for status/simulation usually
            // If using the same API_URL for everything:
            const statusUrl = API_URL.includes('localhost') ? 'http://localhost:5000/api/status' : `${API_URL}/api/status`;

            const statusRes = await axios.get(statusUrl);
            setStatus(statusRes.data.status);
            setLogs(statusRes.data.logs?.slice().reverse() || []);

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
            console.error("Polling Error:", err?.message);
        }
    };

    const startSim = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/start`, { db_password: "1234" });
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setStatus("RUNNING");
                fetchData();
            } else {
                alert(`Failed to start: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const stopSim = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/stop`);
            setStatus("IDLE");
            alert("Simulation stopped.");
        } catch (err) {
            alert(`Failed to stop: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={
                        <Dashboard
                            status={status}
                            startSim={startSim}
                            stopSim={stopSim}
                            logs={logs}
                            metrics={metrics}
                            ledger={ledger}
                            loading={loading}
                        />
                    } />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/models" element={<Models />} />
                    <Route path="/datasets" element={<Datasets />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
