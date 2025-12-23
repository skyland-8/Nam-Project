import sys
import os
import threading
import time
import queue

# Add project root to sys.path to access src modules
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(project_root)

from src.db_manager import DBManager
from src.data_processing import DataProcessor
from src.client import FLClient
from src.server import FLServer
from src.security import KeyManager

# Global State
simulation_state = {
    "status": "IDLE", # IDLE, RUNNING, COMPLETED, ERROR
    "current_round": 0,
    "total_rounds": 0,
    "logs": [],
    "metrics": {
        "rounds": [],
        "accuracy": [],
        "loss": []
    }
}

class SimulationRunner(threading.Thread):
    def __init__(self, db_password, num_rounds=5, num_clients=5):
        super().__init__()
        self.db_password = db_password
        self.num_rounds = num_rounds
        self.num_clients = num_clients
        self.should_stop = False

    def log(self, message):
        timestamp = time.strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        print(log_entry)
        simulation_state["logs"].append(log_entry)
        # Keep only last 100 logs
        if len(simulation_state["logs"]) > 100:
            simulation_state["logs"].pop(0)

    def run(self):
        global simulation_state
        simulation_state["status"] = "RUNNING"
        simulation_state["total_rounds"] = self.num_rounds
        simulation_state["current_round"] = 0
        simulation_state["metrics"] = {"rounds": [], "accuracy": [], "loss": []}
        simulation_state["logs"] = []

        try:
            self.log("Initializing Simulation...")
            
            # 1. Data
            self.log("Loading Shakespeare Dataset...")
            processor = DataProcessor(os.path.join(project_root, "shakespeare.txt"), seq_length=40)
            processor.load_data()
            
            # 2. DB
            self.log("Connecting to Database...")
            db = DBManager(password=self.db_password)
            db.connect()
            
            # 3. Security
            shared_key = KeyManager.generate_shared_key()
            
            # 4. Clients
            self.log(f"Setting up {self.num_clients} Clients...")
            client_partitions = processor.partition_data(self.num_clients)
            
            # Ensure datasets dir exists
            datasets_dir = os.path.join(current_dir, "datasets")
            os.makedirs(datasets_dir, exist_ok=True)
            
            clients = []
            for i in range(self.num_clients):
                c = FLClient(f"client_{i+1}", client_partitions[i], processor, shared_key)
                clients.append(c)
                
                # SAVE DATASET FOR WEB APP PREVIEW
                # Convert indices back to text for display
                client_text = processor.indices_to_text(client_partitions[i])
                with open(os.path.join(datasets_dir, f"client_{i+1}.txt"), "w", encoding="utf-8") as f:
                    f.write(client_text)
            
            # Save Global Test Set too
            test_X_ind, test_y = processor.create_dataset(client_partitions[0][-200:])
            # Save a snippet of original text as "global.txt"
            with open(os.path.join(datasets_dir, "global_shakespeare.txt"), "w", encoding="utf-8") as f:
                f.write(processor.indices_to_text(processor.data[:5000])) # First 5000 chars
            
            # 5. Server
            server = FLServer(processor.vocab_size, processor.seq_length, db, shared_key)
            server.register_clients(clients)
            
            # Test Data
            test_X_ind, test_y = processor.create_dataset(client_partitions[0][-200:])
            test_X = processor.one_hot_encode(test_X_ind)

            # 6. Loop
            for r in range(1, self.num_rounds + 1):
                if self.should_stop:
                    break
                    
                simulation_state["current_round"] = r
                self.log(f"--- Starting Round {r} ---")
                
                round_id = db.start_round()
                curr_W, curr_b = server.global_model.get_parameters()
                
                # Client Steps
                for client in clients:
                    self.log(f"Client {client.client_id}: Training & Encrypting...")
                    update_pkg = client.train_round(curr_W, curr_b)
                    
                    db.store_update(
                        round_id, 
                        update_pkg["client_id"],
                        update_pkg["encrypted_data"],
                        update_pkg["nonce"],
                        update_pkg["tag"],
                        update_pkg["signature"]
                    )
                    time.sleep(0.5) # Artificial delay for visual effect in UI
                
                # Server Steps
                self.log("Server: Aggregating & Updating Global Model...")
                server.aggregate_updates(round_id)
                
                # Evaluate
                loss = server.evaluate(test_X, test_y)
                self.log(f"Round {r} Complete. Loss: {loss:.4f}")
                
                # Update Metrics
                simulation_state["metrics"]["rounds"].append(r)
                simulation_state["metrics"]["loss"].append(float(loss)) # float for JSON serialization
                
                time.sleep(1) # Delay between rounds

            self.log("Simulation Completed Successfully.")
            simulation_state["status"] = "COMPLETED"
            db.close()
            
        except Exception as e:
            self.log(f"ERROR: {str(e)}")
            simulation_state["status"] = "ERROR"
            simulation_state["error_details"] = str(e)
            import traceback
            traceback.print_exc()
        finally:
            if 'db' in locals() and db:
                db.close()

    def stop(self):
        self.should_stop = True

# Runner Instance
runner_thread = None

def start_simulation(db_password):
    global runner_thread
    if runner_thread and runner_thread.is_alive():
        return False
    
    runner_thread = SimulationRunner(db_password)
    runner_thread.start()
    return True

def stop_simulation():
    global runner_thread
    if runner_thread:
        runner_thread.stop()
    
    # Force status update so UI doesn't get stuck
    simulation_state["status"] = "IDLE"
    simulation_state["logs"].append("[System] Simulation forced stop.")
