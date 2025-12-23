import numpy as np

class DataProcessor:
    def __init__(self, file_path, seq_length=50):
        self.file_path = file_path
        self.seq_length = seq_length
        self.text = ""
        self.chars = []
        self.char_to_ix = {}
        self.ix_to_char = {}
        self.vocab_size = 0
        
    def load_data(self):
        with open(self.file_path, 'r', encoding='utf-8') as f:
            self.text = f.read()
        
        self.chars = sorted(list(set(self.text)))
        self.vocab_size = len(self.chars)
        self.char_to_ix = {ch:i for i,ch in enumerate(self.chars)}
        self.ix_to_char = {i:ch for i,ch in enumerate(self.chars)}
        
        print(f"Data loaded. Length: {len(self.text)} chars. Vocab size: {self.vocab_size}")

    def create_dataset(self, text_chunk):
        """Creates X, y data for a given text chunk"""
        inputs = []
        targets = []
        
        for i in range(0, len(text_chunk) - self.seq_length, 3): # Step 3 to reduce data size for demo
            inputs.append([self.char_to_ix[ch] for ch in text_chunk[i:i+self.seq_length]])
            targets.append(self.char_to_ix[text_chunk[i+self.seq_length]])
            
        return np.array(inputs), np.array(targets)
    
    def one_hot_encode(self, inputs):
        """Flattened one-hot encoding for Logistic Regression"""
        # inputs shape: (batch_size, seq_length)
        # output shape: (batch_size, seq_length * vocab_size)
        batch_size = inputs.shape[0]
        one_hot = np.zeros((batch_size, self.seq_length * self.vocab_size))
        
        for i in range(batch_size):
            for t in range(self.seq_length):
                char_idx = inputs[i, t]
                one_hot[i, t * self.vocab_size + char_idx] = 1
                
        return one_hot

    def partition_data(self, num_clients):
        """Splits data among clients"""
        # Just creating simple partitions for simulation
        chunk_size = len(self.text) // num_clients
        partitions = []
        
        for i in range(num_clients):
            start = i * chunk_size
            end = start + chunk_size
            partitions.append(self.text[start:end])
            
        return partitions
