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
        from datetime import datetime
        import pytz
        tz = pytz.timezone('Asia/Kolkata')
        timestamp = datetime.now(tz).strftime("%H:%M:%S")
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
            data_file_path = os.path.join(project_root, "shakespeare.txt")
            
            # DEBUGGING: Log current path info
            self.log(f"CWD: {os.getcwd()}")
            self.log(f"Project Root: {project_root}")
            self.log(f"Looking for data at: {data_file_path}")
            
            if not os.path.exists(data_file_path):
                self.log(f"CRITICAL ERROR: File not found at {data_file_path}")
                # List root contents to help debug
                try:
                    self.log(f"Root contents: {os.listdir(project_root)}")
                except:
                    pass
                raise FileNotFoundError(f"Dataset file missing at {data_file_path}")

            processor = DataProcessor(data_file_path, seq_length=40)
            processor.load_data()
            
            # 2. DB
            self.log("Connecting to Database...")
            db = DBManager(password=self.db_password)
            db.connect()
            
            # 3. Security
            shared_key = KeyManager.generate_shared_key()
            
            # 4. Clients
            # 4. Clients
            self.log(f"Setting up {self.num_clients} Clients...")
            try:
                client_partitions = processor.partition_data(self.num_clients)
                self.log(f"Data partitioned into {len(client_partitions)} chunks.")
            except Exception as e:
                self.log(f"Error partitioning data: {e}")
                raise e
            
            # Ensure datasets dir exists
            datasets_dir = os.path.join(current_dir, "datasets")
            os.makedirs(datasets_dir, exist_ok=True)
            self.log(f"Datasets dir at: {datasets_dir}")
            
            clients = []
            for i in range(self.num_clients):
                self.log(f"Initializing Client {i+1}...")
                try:
                    c = FLClient(f"client_{i+1}", client_partitions[i], processor, shared_key)
                    clients.append(c)
                    
                    # SAVE DATASET FOR WEB APP PREVIEW
                    # client_partitions[i] is ALREADY text string from partition_data
                    client_text = client_partitions[i] 
                    
                    client_file_path = os.path.join(datasets_dir, f"client_{i+1}.txt")
                    with open(client_file_path, "w", encoding="utf-8") as f:
                        f.write(client_text)
                    self.log(f"Saved dataset for Client {i+1}")
                except Exception as e:
                    self.log(f"Error initializing client {i+1}: {e}")
                    raise e
            
            # Save Global Test Set too
            self.log("Creating Global Test Set...")
            try:
                # create_dataset returns indices, but partitions are text strings. 
                # We need input text for create_dataset.
                test_X_ind, test_y = processor.create_dataset(client_partitions[0][-200:])
                
                # Save a snippet of original text as "global.txt"
                # Processor.text contains the full text
                with open(os.path.join(datasets_dir, "global_shakespeare.txt"), "w", encoding="utf-8") as f:
                    f.write(processor.text[:5000]) # First 5000 chars of actual text
                self.log("Global Test Set created.")
            except Exception as e:
                self.log(f"Error creating global test set: {e}")
                raise e
            
            # 5. Server
            self.log("Initializing Server...")
            server = FLServer(processor.vocab_size, processor.seq_length, db, shared_key)
            server.register_clients(clients)
            self.log("Server initialized.")
            
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
            error_msg = str(e)
            self.log(f"ERROR: {error_msg}")
            
            # Print full stack trace to backend logs
            import traceback
            traceback.print_exc()
            
            simulation_state["status"] = "ERROR"
            # Sanitize error for frontend display if needed, but usually str(e) is fine.
            # If it's very long, maybe truncate?
            simulation_state["error_details"] = error_msg if len(error_msg) < 200 else error_msg[:200] + "..."
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
