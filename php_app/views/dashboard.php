<div class="grid grid-cols-1 md:grid-cols-12 gap-6">

    <!-- Controls & Status -->
    <div
        class="md:col-span-12 bg-cardbg rounded-lg shadow-lg p-6 flex justify-between items-center border border-gray-700">
        <div>
            <h2 class="text-2xl font-bold text-white mb-1">Control Panel</h2>
            <p class="text-gray-400 text-sm">Manage the Federated Learning Simulation</p>
        </div>
        <div class="flex items-center gap-4">
            <span id="statusBadge" class="px-4 py-2 rounded font-bold bg-gray-600 text-white">IDLE</span>
            <button onclick="trigger('start')"
                class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded transition">
                Start Simulation
            </button>
            <button onclick="trigger('stop')"
                class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded transition">
                Stop
            </button>
        </div>
    </div>

    <!-- Chart & Logs -->
    <div class="md:col-span-8 flex flex-col gap-6">
        <!-- Chart -->
        <div class="bg-cardbg rounded-lg shadow-lg p-6 border border-gray-700 h-96">
            <h3 class="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <span class="w-2 h-2 bg-blue-400 rounded-full"></span> Global Model Loss
            </h3>
            <div class="relative h-full w-full pb-8">
                <canvas id="lossChart"></canvas>
            </div>
        </div>

        <!-- Logs -->
        <div class="bg-cardbg rounded-lg shadow-lg p-6 border border-gray-700 flex-1 min-h-[300px] flex flex-col">
            <h3 class="text-lg font-semibold text-gray-300 mb-4">System Event Log</h3>
            <div id="logContainer" class="flex-1 overflow-y-auto bg-gray-900/50 rounded p-4 font-mono text-xs max-h-64">
                <div class="text-gray-600">Waiting for logs...</div>
            </div>
        </div>
    </div>

    <!-- Secure Ledger -->
    <div class="md:col-span-4 bg-cardbg rounded-lg shadow-lg p-6 border border-gray-700 flex flex-col h-[700px]">
        <h3 class="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span class="w-2 h-2 bg-purple-400 rounded-full"></span> Immutable Ledger
        </h3>
        <p class="text-xs text-gray-400 mb-4">Live stream of encrypted model updates stored in MySQL.</p>

        <div id="ledgerContainer" class="flex-1 overflow-y-auto pr-2 space-y-2">
            <!-- Items injected via JS -->
            <div class="text-center text-gray-600 mt-10">Empty Ledger</div>
        </div>
    </div>

</div>