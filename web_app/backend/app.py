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

DB_PASSWORD = os.getenv('DB_PASSWORD', 'sdb-o.hosting.stackcp.net')

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

    db = None
    try:
        db = DBManager(password=DB_PASSWORD)
        db.connect()
        db.register_client(client_id, public_key)
        return jsonify({"message": f"Client {client_id} registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if db:
            db.close()

@app.route('/api/v1/clients', methods=['GET'])
def list_clients():
    """List all registered participants"""
    db = None
    try:
        db = DBManager(password=DB_PASSWORD)
        db.connect()
        rows = db.get_all_clients()
        
        clients = []
        for r in rows:
            clients.append({
                "client_id": r[0],
                "registered_at": r[1],
                "status": "Online" # In a real system, we'd check heartbeat
            })
        return jsonify(clients)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if db:
            db.close()

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



@app.route('/api/v1/models/history', methods=['GET'])
def get_model_history():
    """Get history of global model checkpoints"""
    db = None
    try:
        db = DBManager(password=DB_PASSWORD)
        db.connect()
        rows = db.get_model_history()
        
        history = []
        for r in rows:
            history.append({
                "version": r[0],
                "round_id": r[1],
                "accuracy": r[2],
                "timestamp": r[3]
            })
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if db:
            db.close()

@app.route('/api/v1/datasets', methods=['GET'])
def list_datasets():
    """List available dataset partitions"""
    datasets_dir = os.path.join(project_root, "web_app", "backend", "datasets")
    if not os.path.exists(datasets_dir):
        return jsonify([])
    
    files = [f for f in os.listdir(datasets_dir) if f.endswith(".txt")]
    return jsonify(sorted(files))

@app.route('/api/v1/datasets/<filename>', methods=['GET'])
def get_dataset_file(filename):
    """Get a specific dataset partition"""
    try:
        # Security: Prevent directory traversal
        if ".." in filename or "/" in filename or "\\" in filename:
             return jsonify({"error": "Invalid filename"}), 400

        datasets_dir = os.path.join(project_root, "web_app", "backend", "datasets")
        file_path = os.path.join(datasets_dir, filename)
        
        if not os.path.exists(file_path):
             # Fallback to main shakespeare if requested or not found
             if filename == "sample":
                 return get_dataset_sample()
             return jsonify({"error": "File not found"}), 404
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read(2000) # Preview 2000 chars
        
        return jsonify({
            "dataset": filename,
            "total_size": os.path.getsize(file_path),
            "preview": content + "..."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/v1/dataset/sample', methods=['GET'])
def get_dataset_sample():
    """Get a preview of the training data"""
    try:
        file_path = os.path.join(project_root, "shakespeare.txt")
        if not os.path.exists(file_path):
            return jsonify({"error": "Dataset not found on server"}), 404
            
        with open(file_path, 'r', encoding='utf-8') as f:
            # Read first 1000 chars
            content = f.read(1000)
        
        return jsonify({
            "dataset": "Shakespeare",
            "total_size": os.path.getsize(file_path),
            "preview": content + "..."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/v1/updates', methods=['POST'])
def submit_update():
    """Submit an encrypted update"""
    data = request.json
    required_fields = ['round_id', 'client_id', 'encrypted_data', 'nonce', 'tag', 'signature']
    
    if not all(k in data for k in required_fields):
        return jsonify({"error": "Invalid update payload"}), 400

    db = None
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
        return jsonify({"message": "Update received and stored in ledger"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if db:
            db.close()


# --- Ledger & Analytics ---

@app.route('/api/v1/ledger', methods=['GET'])
def get_ledger():
    db = None
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
    finally:
        if db:
            db.close()

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

@app.route('/api/v1/reset', methods=['POST'])
def reset_system():
    """Reset the entire system state (Danger Zone)"""
    db = None
    try:
        simulation_runner.stop_simulation()
        db = DBManager(password=DB_PASSWORD)
        db.connect()
        success = db.reset_database()
        
        if success:
            return jsonify({"message": "System reset successful"}), 200
        else:
            return jsonify({"error": "Failed to reset database"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if db:
            db.close()

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(simulation_runner.simulation_state)

# Wrapper for legacy endpoint
@app.route('/api/ledger', methods=['GET']) 
def get_ledger_legacy():
    return get_ledger()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
