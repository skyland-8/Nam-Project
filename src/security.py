import os
from cryptography.hazmat.primitives.asymmetric import rsa, ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import padding
import base64

class SecurityParams:
    # Using NIST P-256 curve for ECDSA as it's standard and efficient
    CURVE = ec.SECP256R1()
    # AES-256
    AES_KEY_SIZE = 32

class KeyManager:
    @staticmethod
    def generate_client_keys():
        """Generates ECDSA key pair for a client (Signing/Verification)"""
        private_key = ec.generate_private_key(SecurityParams.CURVE)
        public_key = private_key.public_key()
        return private_key, public_key

    @staticmethod
    def serialize_public_key(public_key):
        return public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')

    @staticmethod
    def load_public_key(pem_string):
        return serialization.load_pem_public_key(pem_string.encode('utf-8'))

    @staticmethod
    def generate_shared_key():
        """Generates a symmetric key for the session/round (AES-GCM)"""
        return AESGCM.generate_key(bit_length=SecurityParams.AES_KEY_SIZE * 8)


class CryptoModule:
    @staticmethod
    def sign_data(private_key, data):
        """Sign data using ECDSA"""
        if isinstance(data, str):
            data = data.encode('utf-8')
        
        signature = private_key.sign(
            data,
            ec.ECDSA(hashes.SHA256())
        )
        return base64.b64encode(signature).decode('utf-8')

    @staticmethod
    def verify_signature(public_key, data, signature_b64):
        """Verify ECDSA signature"""
        try:
            if isinstance(data, str):
                data = data.encode('utf-8')
            
            signature = base64.b64decode(signature_b64)
            public_key.verify(
                signature,
                data,
                ec.ECDSA(hashes.SHA256())
            )
            return True
        except Exception as e:
            print(f"Signature verification failed: {e}")
            return False

    @staticmethod
    def encrypt_update(key, plaintext_data):
        """Encrypt data using AES-GCM"""
        if isinstance(plaintext_data, str):
            plaintext_data = plaintext_data.encode('utf-8')
            
        aesgcm = AESGCM(key)
        nonce = os.urandom(12) # Recommended nonce size for GCM
        ciphertext = aesgcm.encrypt(nonce, plaintext_data, None)
        
        # We need to send nonce and ciphertext (which includes auth tag at the end in some impls, 
        # but Python cryptography library includes tag in ciphertext for AESGCM? 
        # Wait, Python's aesgcm.encrypt returns ciphertext + tag appended.
        # But to be explicit for the database schema which has 'tag' column, 
        # we might want to split it if we were doing it manually. 
        # For simplicity with the library, we'll store the full output in 'encrypted_data' 
        # or split the last 16 bytes as tag.
        
        # cryptography doc: "The ciphertext follows the nonce and is followed by the authentication tag."
        # Actually encrypt returns ciphertext + tag.
        
        tag = ciphertext[-16:]
        actual_ciphertext = ciphertext[:-16]
        
        return (
            base64.b64encode(actual_ciphertext).decode('utf-8'),
            base64.b64encode(nonce).decode('utf-8'),
            base64.b64encode(tag).decode('utf-8')
        )

    @staticmethod
    def decrypt_update(key, ciphertext_b64, nonce_b64, tag_b64):
        """Decrypt data using AES-GCM"""
        # Reconstruct the format AESGCM expects (ciphertext + tag)
        ciphertext = base64.b64decode(ciphertext_b64)
        tag = base64.b64decode(tag_b64)
        nonce = base64.b64decode(nonce_b64)
        
        full_ciphertext = ciphertext + tag
        
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(nonce, full_ciphertext, None)
        return plaintext.decode('utf-8')
