import mysql.connector
from mysql.connector import Error
import json
import os

class DBManager:
    def __init__(self, host=None, user=None, password=None, database='secure_fl_db', port=None):
        self.config = {
            'host': host or os.getenv('DB_HOST', 'localhost'),
            'user': user or os.getenv('DB_USER', 'root'),
            'password': password or os.getenv('DB_PASSWORD', ''),
            'port': port or int(os.getenv('DB_PORT', 3306))
        }
        self.database = database
        self.conn = None
        self.cursor = None

    def connect(self):
        try:
            # First connect without database to create it if needed
            self.conn = mysql.connector.connect(**self.config)
            self.cursor = self.conn.cursor()
            
            self.cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database}")
            self.cursor.execute(f"USE {self.database}")
            
            self._create_tables()
            print("Successfully connected to the database and initialized tables.")
            
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            raise e

    def _create_tables(self):
        # Table for Registered Clients
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS clients (
            client_id VARCHAR(255) PRIMARY KEY,
            public_key TEXT NOT NULL,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Table for FL Rounds
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS rounds (
            round_id INT AUTO_INCREMENT PRIMARY KEY,
            status VARCHAR(50) DEFAULT 'IN_PROGRESS',
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Table for Model Updates (The Ledger)
        # encrypted_update: The actual gradients/weights encrypted
        # signature: Digital signature of the update
        self.cursor.execute("""
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
        )
        """)
        
        # Table for Global Model Checkpoints
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS global_models (
            model_id INT AUTO_INCREMENT PRIMARY KEY,
            round_id INT,
            model_data LONGTEXT,
            accuracy FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (round_id) REFERENCES rounds(round_id)
        )
        """)
        self.conn.commit()

    def register_client(self, client_id, public_key_pem):
        try:
            sql = "INSERT IGNORE INTO clients (client_id, public_key) VALUES (%s, %s)"
            self.cursor.execute(sql, (client_id, public_key_pem))
            self.conn.commit()
        except Error as e:
            print(f"Error registering client: {e}")

    def start_round(self):
        try:
            sql = "INSERT INTO rounds (status) VALUES ('IN_PROGRESS')"
            self.cursor.execute(sql)
            self.conn.commit()
            return self.cursor.lastrowid
        except Error as e:
            print(f"Error starting round: {e}")
            return None

    def store_update(self, round_id, client_id, encrypted_data, nonce, tag, signature):
        try:
            sql = """
            INSERT INTO updates (round_id, client_id, encrypted_data, nonce, tag, signature)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            self.cursor.execute(sql, (round_id, client_id, encrypted_data, nonce, tag, signature))
            self.conn.commit()
        except Error as e:
            print(f"Error storing update: {e}")

    def get_updates_for_round(self, round_id):
        try:
            sql = "SELECT client_id, encrypted_data, nonce, tag, signature FROM updates WHERE round_id = %s"
            self.cursor.execute(sql, (round_id,))
            return self.cursor.fetchall()
        except Error as e:
            print(f"Error fetching updates: {e}")
            return []

    def get_client_public_key(self, client_id):
        try:
            sql = "SELECT public_key FROM clients WHERE client_id = %s"
            self.cursor.execute(sql, (client_id,))
            result = self.cursor.fetchone()
            if result:
                return result[0]
            return None
        except Error as e:
            print(f"Error fetching public key: {e}")
            return None

    def store_global_model(self, round_id, model_data_json, accuracy):
        try:
            sql = "INSERT INTO global_models (round_id, model_data, accuracy) VALUES (%s, %s, %s)"
            self.cursor.execute(sql, (round_id, model_data_json, accuracy))
            self.conn.commit()
        except Error as e:
            print(f"Error storing global model: {e}")

    def close(self):
        if self.conn and self.conn.is_connected():
            self.cursor.close()
            self.conn.close()
