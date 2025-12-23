</main>

<script>
    // Main Logic
    const ctx = document.getElementById('lossChart').getContext('2d');
    const lossChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Global Model Loss',
                data: [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { grid: { color: '#334155' } },
                x: { grid: { color: '#334155' } }
            }
        }
    });

    function updateUI() {
        fetch('index.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=fetch_data'
        })
            .then(res => res.json())
            .then(data => {
                if (!data || !data.status) return;

                // Update Status
                const statusEl = document.getElementById('statusBadge');
                statusEl.innerText = data.status.status;
                statusEl.className = `px-4 py-2 rounded font-bold text-white transition-colors duration-300 ${data.status.status === 'RUNNING' ? 'bg-green-600' : 'bg-gray-600'
                    }`;

                // Update Chart
                if (data.status.metrics && data.status.metrics.rounds) {
                    lossChart.data.labels = data.status.metrics.rounds;
                    lossChart.data.datasets[0].data = data.status.metrics.loss;
                    lossChart.update();
                }

                // Update Logs
                const logContainer = document.getElementById('logContainer');
                logContainer.innerHTML = data.status.logs.reverse().map(l =>
                    `<div class="border-b border-gray-700 py-1 font-mono text-sm text-gray-400">${l}</div>`
                ).join('');

                // Update Ledger
                const ledgerContainer = document.getElementById('ledgerContainer');
                if (data.ledger && data.ledger.length > 0) {
                    ledgerContainer.innerHTML = data.ledger.map(entry => `
                        <div class="bg-gray-900/50 p-3 rounded border-l-4 border-purple-500 mb-2">
                            <div class="flex justify-between text-xs font-bold text-gray-500">
                                <span>BLOCK #${entry.id}</span>
                                <span>${new Date(entry.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div class="text-blue-400 font-semibold mt-1">Client: ${entry.client}</div>
                            <div class="text-xs font-mono text-gray-600 mt-1 truncate">Enc: ${entry.data_hash}</div>
                            <div class="text-xs font-mono text-green-700 mt-1 truncate">Sig: ${entry.signature}</div>
                        </div>
                     `).join('');
                }

                document.getElementById('connectionStatus').innerText = "Backend Connected";
                document.getElementById('connectionStatus').classList.remove('bg-red-900');
                document.getElementById('connectionStatus').classList.add('bg-green-900');
            })
            .catch(err => {
                console.error(err);
                document.getElementById('connectionStatus').innerText = "Backend Offline";
                document.getElementById('connectionStatus').classList.add('bg-red-900');
            });
    }

    function trigger(action) {
        fetch('index.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=' + action
        }).then(() => updateUI());
    }

    setInterval(updateUI, 1000);
    updateUI();
</script>
</body>

</html>