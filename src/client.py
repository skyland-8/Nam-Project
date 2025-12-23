import json
import numpy as np
from src.security import KeyManager, CryptoModule
from src.model import LogisticRegressionModel

class FLClient:
    def __init__(self, client_id, text_data, data_processor, shared_key):
        self.client_id = client_id
        self.text_data = text_data
        self.processor = data_processor
        self.shared_key = shared_key
        
        # Security Keys
        self.private_key, self.public_key = KeyManager.generate_client_keys()
        self.public_key_str = KeyManager.serialize_public_key(self.public_key)
        
        # Prepare Data
        self.X_indices, self.y = self.processor.create_dataset(self.text_data)
        # Limit data for performance in simulation
        if len(self.X_indices) > 500:
            self.X_indices = self.X_indices[:500]
            self.y = self.y[:500]
            
        self.X = self.processor.one_hot_encode(self.X_indices)
        
        self.model = LogisticRegressionModel(self.processor.vocab_size, self.processor.seq_length)

    def train_round(self, global_weights, global_bias):
        """Performs local training and returns secured update"""
        
        # Update local model with global parameters
        self.model.set_parameters(global_weights, global_bias)
        
        # Train (Compute Gradients)
        # Check if we have data to train on
        if self.X.shape[0] == 0:
            # No data: return zero updates
            new_W, new_b = self.model.get_parameters() # Unchanged
        else:
            dW, db = self.model.compute_gradients(self.X, self.y)
            
            # We can simulate local steps by updating and computing diff, or just sending gradients.
            # Standard FedSGD sends gradients. FedAvg sends weights.
            # For simplicity in this demo, let's send WEIGHT UPDATE (new weights)
            self.model.update_parameters(dW, db, learning_rate=0.5)
            new_W, new_b = self.model.get_parameters()
        
        # Create Update Package
        update_data = {
            "W": new_W.tolist(),
            "b": new_b.tolist(),
            "client_id": self.client_id
        }
        update_json = json.dumps(update_data)
        
        # SECURITY: Sign the update
        signature = CryptoModule.sign_data(self.private_key, update_json)
        
        # SECURITY: Encrypt the update
        encrypted_data, nonce, tag = CryptoModule.encrypt_update(self.shared_key, update_json)
        
        return {
            "client_id": self.client_id,
            "encrypted_data": encrypted_data,
            "nonce": nonce,
            "tag": tag,
            "signature": signature
        }
