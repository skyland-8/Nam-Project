import json
import numpy as np
from src.security import CryptoModule, KeyManager
from src.model import LogisticRegressionModel

class FLServer:
    def __init__(self, vocab_size, seq_length, db_manager, shared_key):
        self.db_manager = db_manager
        self.shared_key = shared_key
        
        # Initialize Global Model
        self.global_model = LogisticRegressionModel(vocab_size, seq_length)
        
        self.vocab_size = vocab_size
        self.seq_length = seq_length

    def register_clients(self, clients):
        """Registers clients in DB"""
        for client in clients:
            self.db_manager.register_client(client.client_id, client.public_key_str)

    def aggregate_updates(self, round_id):
        """Fetches updates from DB, verifies, decrypts, and aggregates"""
        
        updates_rows = self.db_manager.get_updates_for_round(round_id)
        print(f"Server: Found {len(updates_rows)} updates for Round {round_id}")
        
        valid_updates_W = []
        valid_updates_b = []
        
        for row in updates_rows:
            client_id, enc_data, nonce, tag, signature = row
            
            # 1. Fetch Client's Public Key
            pem_key = self.db_manager.get_client_public_key(client_id)
            if not pem_key:
                print(f"Unknown client {client_id}, skipping.")
                continue
                
            public_key = KeyManager.load_public_key(pem_key)
            
            # 2. Decrypt
            try:
                decrypted_json = CryptoModule.decrypt_update(self.shared_key, enc_data, nonce, tag)
            except Exception as e:
                print(f"Decryption failed for {client_id}: {e}")
                continue
            
            # 3. Verify Signature
            if not CryptoModule.verify_signature(public_key, decrypted_json, signature):
                print(f"Invalid signature from {client_id}! Possible tampering.")
                continue
                
            # 4. Parse Data
            update_data = json.loads(decrypted_json)
            valid_updates_W.append(np.array(update_data["W"]))
            valid_updates_b.append(np.array(update_data["b"]))
            
        if not valid_updates_W:
            print("No valid updates received.")
            return

        # 5. FedAvg (Simple Averaging)
        avg_W = np.mean(valid_updates_W, axis=0)
        avg_b = np.mean(valid_updates_b, axis=0)
        
        # Update Global Model
        self.global_model.set_parameters(avg_W, avg_b)
        print(f"Server: Global model updated for Round {round_id}.")
        
        # Save Global Model Checkpoint to DB
        self.db_manager.store_global_model(
            round_id, 
            self.global_model.to_json(), 
            0.0 # Placeholder for accuracy evaluation
        )

    def evaluate(self, test_X, test_y):
        loss = self.global_model.compute_loss(test_X, test_y)
        print(f"Global Model Loss: {loss:.4f}")
        return loss
