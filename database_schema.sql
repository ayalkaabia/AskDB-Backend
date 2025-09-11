-- AskDB Database Schema
-- This file contains all the tables needed for the expanded system

-- Users table for authentication (created first since other tables reference it)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Databases table
CREATE TABLE IF NOT EXISTS `databases` (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('mysql', 'postgresql', 'oracle') DEFAULT 'mysql',
    connection_string TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    charset VARCHAR(50) DEFAULT 'utf8mb4',
    collation VARCHAR(50) DEFAULT 'utf8mb4_unicode_ci',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_database_name (user_id, name)
);

-- Conversations table for user-specific chats
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255),
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhanced query history table with user and conversation associations
CREATE TABLE IF NOT EXISTS query_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    conversation_id VARCHAR(36),
    prompt TEXT,
    sql_query TEXT NOT NULL,
    results JSON,
    result_count INT DEFAULT 0,
    execution_time_ms INT,
    database_id VARCHAR(36),
    query_type ENUM('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'OTHER') DEFAULT 'SELECT',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (database_id) REFERENCES `databases`(id) ON DELETE SET NULL
);

-- Database backups table
CREATE TABLE IF NOT EXISTS database_backups (
    id VARCHAR(36) PRIMARY KEY,
    database_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (database_id) REFERENCES `databases`(id) ON DELETE CASCADE
);


-- Create indexes for better performance
CREATE INDEX idx_query_history_timestamp ON query_history(timestamp);
CREATE INDEX idx_query_history_prompt ON query_history(prompt(100));
CREATE INDEX idx_query_history_sql_query ON query_history(sql_query(100));
CREATE INDEX idx_query_history_database_id ON query_history(database_id);
CREATE INDEX idx_query_history_query_type ON query_history(query_type);
CREATE INDEX idx_query_history_user_id ON query_history(user_id);
CREATE INDEX idx_query_history_conversation_id ON query_history(conversation_id);

-- Conversations table indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

CREATE INDEX idx_databases_user_id ON databases(user_id);
CREATE INDEX idx_databases_status ON databases(status);
CREATE INDEX idx_databases_type ON databases(type);
CREATE INDEX idx_databases_uploaded_at ON databases(uploaded_at);
CREATE INDEX idx_databases_name ON databases(name);

-- Users table indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

