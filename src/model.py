import numpy as np

class LogisticRegressionModel:
    def __init__(self, vocab_size, seq_length):
        self.vocab_size = vocab_size
        self.seq_length = seq_length
        # Initialize weights and bias
        # Input features: One-hot encoded characters flattened = seq_length * vocab_size
        # Output classes: vocab_size (next character prediction)
        self.input_dim = seq_length * vocab_size
        self.output_dim = vocab_size
        
        # Initialize weights with small random values
        self.W = np.random.randn(self.input_dim, self.output_dim) * 0.01
        self.b = np.zeros(self.output_dim)

    def softmax(self, z):
        exp_z = np.exp(z - np.max(z, axis=1, keepdims=True)) # numeric stability
        return exp_z / np.sum(exp_z, axis=1, keepdims=True)

    def forward(self, X):
        # X shape: (batch_size, input_dim)
        z = np.dot(X, self.W) + self.b
        return self.softmax(z)

    def compute_loss(self, X, y_true_indices):
        """Cross Entropy Loss"""
        y_pred = self.forward(X)
        m = X.shape[0]
        # Get probabilities for the correct classes
        log_likelihood = -np.log(y_pred[range(m), y_true_indices] + 1e-9)
        loss = np.sum(log_likelihood) / m
        return loss

    def compute_gradients(self, X, y_true_indices):
        m = X.shape[0]
        y_pred = self.forward(X)
        
        # Create one-hot for true labels to compute gradient
        y_true_onehot = np.zeros_like(y_pred)
        y_true_onehot[range(m), y_true_indices] = 1
        
        # Gradient of Softmax + Cross Entropy is (pred - true)
        dz = y_pred - y_true_onehot
        
        dW = np.dot(X.T, dz) / m
        db = np.sum(dz, axis=0) / m
        
        return dW, db

    def update_parameters(self, dW, db, learning_rate=0.1):
        self.W -= learning_rate * dW
        self.b -= learning_rate * db

    def get_parameters(self):
        return self.W, self.b

    def set_parameters(self, W, b):
        self.W = W
        self.b = b

    def to_json(self):
        import json
        return json.dumps({
            "W": self.W.tolist(),
            "b": self.b.tolist()
        })
    
    @staticmethod
    def from_json(json_str):
        import json
        data = json.loads(json_str)
        model = LogisticRegressionModel(1, 1) # dummy init
        model.W = np.array(data["W"])
        model.b = np.array(data["b"])
        model.input_dim = model.W.shape[0]
        model.output_dim = model.W.shape[1]
        model.vocab_size = model.output_dim
        # simplistic reconstruction of dims
        return model
