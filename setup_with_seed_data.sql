-- Database Setup Script with Seed Data
-- Run this in your MySQL client (e.g., phpMyAdmin)

-- 1. Select the Database
USE `nam-project-313937c3b4`;

-- 2. Create Tables (if they don't exist)

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    client_id VARCHAR(255) PRIMARY KEY,
    public_key TEXT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rounds Table
CREATE TABLE IF NOT EXISTS rounds (
    round_id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Updates Table (The Ledger)
CREATE TABLE IF NOT EXISTS updates (
    update_id INT AUTO_INCREMENT PRIMARY KEY,
    round_id INT,
    client_id VARCHAR(255),
    encrypted_data LONGTEXT,
    nonce TEXT,
    tag TEXT,
    signature TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(round_id),
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

-- Global Models Table
CREATE TABLE IF NOT EXISTS global_models (
    model_id INT AUTO_INCREMENT PRIMARY KEY,
    round_id INT,
    model_data LONGTEXT,
    accuracy FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(round_id)
);

-- 3. Insert Sample Data (Seed Values)

-- Insert Sample Clients
INSERT IGNORE INTO clients (client_id, public_key) VALUES
('client_001', '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----'),
('client_002', '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----');

-- Insert an Initial Round
INSERT INTO rounds (round_id, status) VALUES
(1, 'IN_PROGRESS');

-- Insert a Sample Update from Client 001 for Round 1
INSERT INTO updates (round_id, client_id, encrypted_data, nonce, tag, signature) VALUES
(1, 'client_001', '{"weights": [0.1, 0.2, 0.3], "bias": 0.01}', 'nonce_value_123', 'tag_value_456', 'signature_xyz_789');

-- Insert a Global Model (e.g., from Round 0 or initialization)
-- Note: 'round_id' is 1 here assuming it was generated AFTER round 1 completion, or NULL if initial.
-- Let's assume this is the result of a completed previous round or initial state.
-- If referencing round 1, it usually means round 1 produced this model.
INSERT INTO global_models (round_id, model_data, accuracy) VALUES
(1, '{"weights": [0.15, 0.25, 0.35], "bias": 0.02}', 0.75);
