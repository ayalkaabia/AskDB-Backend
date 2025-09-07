-- AskDB Database Schema
-- This file contains all the tables needed for the expanded system


-- Enhanced query history table
CREATE TABLE IF NOT EXISTS query_history (
    id VARCHAR(36) PRIMARY KEY,
    prompt TEXT NOT NULL,
    sql_query TEXT NOT NULL,
    results JSON,
    result_count INT DEFAULT 0,
    execution_time_ms INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Databases table
CREATE TABLE IF NOT EXISTS databases (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('sqlite', 'mysql', 'postgresql', 'oracle') DEFAULT 'sqlite',
    connection_string TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    FOREIGN KEY (database_id) REFERENCES databases(id) ON DELETE CASCADE
);


-- Create indexes for better performance
CREATE INDEX idx_query_history_timestamp ON query_history(timestamp);
CREATE INDEX idx_query_history_prompt ON query_history(prompt(100));
CREATE INDEX idx_query_history_sql_query ON query_history(sql_query(100));

CREATE INDEX idx_databases_status ON databases(status);
CREATE INDEX idx_databases_type ON databases(type);
CREATE INDEX idx_databases_uploaded_at ON databases(uploaded_at);

