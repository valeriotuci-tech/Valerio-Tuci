-- Global Real Estate Blockchain Transfer Platform
-- Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS blockchain_records CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller', 'agent', 'admin')),
    kyc_document TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    blockchain_hash VARCHAR(255),
    token_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'completed', 'rejected')),
    blockchain_tx_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blockchain records table
CREATE TABLE blockchain_records (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    blockchain_address VARCHAR(255) NOT NULL,
    token_id VARCHAR(255) NOT NULL,
    previous_owner INTEGER REFERENCES users(id) ON DELETE SET NULL,
    new_owner INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) NOT NULL,
    block_number BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_verified ON properties(is_verified);
CREATE INDEX idx_transactions_property ON transactions(property_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_agent ON transactions(agent_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_blockchain_property ON blockchain_records(property_id);
CREATE INDEX idx_blockchain_tx_hash ON blockchain_records(tx_hash);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
-- Note: In production, change this password immediately!
INSERT INTO users (name, email, password_hash, role, is_verified) VALUES
('Admin User', 'admin@blockestate.com', '$2a$10$XQZ9Z9Z9Z9Z9Z9Z9Z9Z9Z.Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'admin', TRUE);

-- Insert sample verification agent (password: agent123)
INSERT INTO users (name, email, password_hash, role, is_verified) VALUES
('Verification Agent', 'agent@blockestate.com', '$2a$10$XQZ9Z9Z9Z9Z9Z9Z9Z9Z9Z.Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'agent', TRUE);

COMMENT ON TABLE users IS 'Stores user information including buyers, sellers, agents, and admins';
COMMENT ON TABLE properties IS 'Stores property listings with blockchain verification';
COMMENT ON TABLE transactions IS 'Tracks property purchase transactions and their status';
COMMENT ON TABLE blockchain_records IS 'Immutable record of all blockchain ownership transfers';
