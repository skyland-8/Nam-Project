from src.db_manager import DBManager
from src.data_processing import DataProcessor
from src.client import FLClient
from src.server import FLServer
from src.security import KeyManager
import time

def main():
    print("=== Secure Federated Learning Simulation ===")
    
    # 1. Setup Data
    print("\n--- Phase 1: Data Preparation ---")
    processor = DataProcessor("shakespeare.txt", seq_length=40)
    processor.load_data()
    
    # 2. Setup Database
    print("\n--- Phase 2: Database Initialization ---")
    # Change password if you have one set for root
    db = DBManager(password='1234') 
    try:
        db.connect()
    except Exception as e:
        print("CRITICAL: Could not connect to database. Make sure MySQL is running and password is correct.")
        print("For this simulation, please update the DBManager init in main_simulation.py with your credentials.")
        return

    # 3. Setup Security Context (Shared Symmetric Key for Encryption)
    # In a real scenario, this would be negotiated via Diffie-Hellman or similar
    shared_key = KeyManager.generate_shared_key()
    
    # 4. Create Clients
    print("\n--- Phase 3: Client Initialization ---")
    NUM_CLIENTS = 5
    client_partitions = processor.partition_data(NUM_CLIENTS)
    clients = []
    
    for i in range(NUM_CLIENTS):
        c = FLClient(f"client_{i+1}", client_partitions[i], processor, shared_key)
        clients.append(c)
        print(f"Initialized Client {c.client_id}")

    # 5. Initialize Server
    print("\n--- Phase 4: Server Initialization ---")
    server = FLServer(processor.vocab_size, processor.seq_length, db, shared_key)
    server.register_clients(clients) # Register public keys on DB
    
    # Prepare Test Data (Use a small chunk of text from the first client for simple validation)
    test_X_ind, test_y = processor.create_dataset(client_partitions[0][-200:]) # Last 200 chars
    test_X = processor.one_hot_encode(test_X_ind)
    
    # 6. Training Loop
    print("\n--- Phase 5: Federated Training Loop ---")
    NUM_ROUNDS = 3
    
    for r in range(1, NUM_ROUNDS + 1):
        print(f"\n[Round {r}] Starting...")
        round_id = db.start_round()
        
        # Get current global params
        curr_W, curr_b = server.global_model.get_parameters()
        
        # Clients Download -> Train -> Encrypt -> Sign -> Upload
        for client in clients:
            print(f"  > Client {client.client_id} training...")
            update_pkg = client.train_round(curr_W, curr_b)
            
            # Upload to DB ("The Ledger")
            db.store_update(
                round_id, 
                update_pkg["client_id"],
                update_pkg["encrypted_data"],
                update_pkg["nonce"],
                update_pkg["tag"],
                update_pkg["signature"]
            )
            print(f"  > Client {client.client_id} uploaded secure update.")
            
        # Server Aggregates
        print(f"  > Server aggregating updates...")
        server.aggregate_updates(round_id)
        
        # Evaluation
        server.evaluate(test_X, test_y)

    db.close()
    print("\n=== Simulation Complete ===")

if __name__ == "__main__":
    main()
