from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os
import json

# Add project root to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(project_root)

from src.db_manager import DBManager
import simulation_runner

app = Flask(__name__)
CORS(app)

DB_PASSWORD = os.getenv('DB_PASSWORD', '1234')

# =========================================================
#  V1 API ENDPOINTS
# =========================================================

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "online", "service": "Secure FL API"}), 200

# --- Client Management ---
@app.route('/api/v1/clients/register', methods=['POST'])
def register_client():
    """Register a new participant"""
    data = request.json
    client_id = data.get('client_id')
    public_key = data.get('public_key')
    
    if not client_id or not public_key:
        return jsonify({"error": "Missing client_id or public_key"}), 400

    try:
        db = DBManager(password=DB_PASSWORD)
        db.connect()
        db.register_client(client_id, public_key)
        db.close()
        return jsonify({"message": f"Client {client_id} registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- FL Lifecycle ---

@app.route('/api/v1/rounds/current', methods=['GET'])
def get_current_round():
    """Get active round info"""
    # For this simulation, we read from the runner state
    # In a real system, we'd query the DB for the latest 'IN_PROGRESS' round
    state = simulation_runner.simulation_state
    
    return jsonify({
        "round_id": state.get("current_round", 0),
        "status": state.get("status", "IDLE"),
        "config": {
            "min_clients": 5,
            "timeout": 300
        }
    })

@app.route('/api/v1/model', methods=['GET'])
def get_global_model():
    """Download global model weights"""
    # In a real implementation, fetch from DB or File Storage
    # Here we mock it or fetch from the live server instance if accessible
    # For now, return a placeholder or the last checkpoint
    return jsonify({
        "weights_url": "/models/global_v1.json",
        "version": "1.0",
        "timestamp": "2025-12-23T12:00:00Z"
    })

@app.route('/api/v1/updates', methods=['POST'])
def submit_update():
    """Submit an encrypted update"""
    data = request.json
    required_fields = ['round_id', 'client_id', 'encrypted_data', 'nonce', 'tag', 'signature']
    
    if not all(k in data for k in required_fields):
        return jsonify({"error": "Invalid update payload"}), 400

    try:
        db = DBManager(password=DB_PASSWORD)
        db.connect()
        db.store_update(
            data['round_id'],
            data['client_id'],
            data['encrypted_data'],
            data['nonce'],
            data['tag'],
            data['signature']
        )
        db.close()
        return jsonify({"message": "Update received and stored in ledger"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Ledger & Analytics ---

@app.route('/api/v1/ledger', methods=['GET'])
def get_ledger():
    try:
        db = DBManager(password=DB_PASSWORD)
        db.connect()
        # Fetch last 50 updates
        db.cursor.execute("""
            SELECT update_id, round_id, client_id, encrypted_data, signature, timestamp 
            FROM updates 
            ORDER BY update_id DESC LIMIT 50
        """)
        rows = db.cursor.fetchall()
        db.close()
        
        ledger_data = []
        for r in rows:
            ledger_data.append({
                "id": r[0],
                "round": r[1],
                "client": r[2],
                "data_hash": r[3][:20] + "...", 
                "signature": r[4][:20] + "...",
                "timestamp": r[5]
            })
            
        return jsonify(ledger_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================================================
#  SIMULATION CONTROL (Legacy / Admin)
# =========================================================

@app.route('/api/start', methods=['POST'])
def start_sim():
    data = request.json or {}
    pwd = data.get('db_password', DB_PASSWORD)
    success = simulation_runner.start_simulation(pwd)
    if success:
        return jsonify({"message": "Simulation started"}), 200
    else:
        return jsonify({"message": "Simulation already running"}), 400

@app.route('/api/stop', methods=['POST'])
def stop_sim():
    simulation_runner.stop_simulation()
    return jsonify({"message": "Stopping simulation..."}), 200

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(simulation_runner.simulation_state)

# Wrapper for legacy endpoint
@app.route('/api/ledger', methods=['GET']) 
def get_ledger_legacy():
    return get_ledger()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
