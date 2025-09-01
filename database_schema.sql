-- AskDB Database Schema
-- This file contains all the tables needed for the expanded system

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('admin', 'user', 'moderator') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Enhanced query history table
CREATE TABLE IF NOT EXISTS query_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    prompt TEXT NOT NULL,
    sql_query TEXT NOT NULL,
    results JSON,
    result_count INT DEFAULT 0,
    execution_time_ms INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL,
    action ENUM('create', 'read', 'update', 'delete', 'execute') NOT NULL,
    conditions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User permissions junction table
CREATE TABLE IF NOT EXISTS user_permissions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_permission (user_id, permission_id)
);

-- Create indexes for better performance
CREATE INDEX idx_query_history_user_id ON query_history(user_id);
CREATE INDEX idx_query_history_timestamp ON query_history(timestamp);
CREATE INDEX idx_query_history_prompt ON query_history(prompt(100));
CREATE INDEX idx_query_history_sql_query ON query_history(sql_query(100));

CREATE INDEX idx_databases_status ON databases(status);
CREATE INDEX idx_databases_type ON databases(type);
CREATE INDEX idx_databases_uploaded_at ON databases(uploaded_at);

CREATE INDEX idx_permissions_resource_type ON permissions(resource_type);
CREATE INDEX idx_permissions_action ON permissions(action);
CREATE INDEX idx_permissions_is_active ON permissions(is_active);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission_id ON user_permissions(permission_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, username, email, password, first_name, last_name, role) VALUES 
('admin-001', 'admin', 'admin@askdb.com', '$2a$10$rQZ9K8mN2pL3vX7yQ1wE4uI6oA9sB2cD5fG8hJ1kL4mN7pQ0rS3tU6vW9xY2z', 'System', 'Administrator', 'admin');

-- Insert default permissions
INSERT INTO permissions (id, name, description, resource_type, action) VALUES
('perm-001', 'database_read', 'Read database information', 'database', 'read'),
('perm-002', 'database_create', 'Create new databases', 'database', 'create'),
('perm-003', 'database_update', 'Update database information', 'database', 'update'),
('perm-004', 'database_delete', 'Delete databases', 'database', 'delete'),
('perm-005', 'query_execute', 'Execute SQL queries', 'query', 'execute'),
('perm-006', 'history_read', 'Read query history', 'history', 'read'),
('perm-007', 'history_delete', 'Delete query history', 'history', 'delete'),
('perm-008', 'user_manage', 'Manage users', 'user', 'create'),
('perm-009', 'permission_manage', 'Manage permissions', 'permission', 'create');

-- Assign all permissions to admin user
INSERT INTO user_permissions (id, user_id, permission_id) VALUES
('up-001', 'admin-001', 'perm-001'),
('up-002', 'admin-001', 'perm-002'),
('up-003', 'admin-001', 'perm-003'),
('up-004', 'admin-001', 'perm-004'),
('up-005', 'admin-001', 'perm-005'),
('up-006', 'admin-001', 'perm-006'),
('up-007', 'admin-001', 'perm-007'),
('up-008', 'admin-001', 'perm-008'),
('up-009', 'admin-001', 'perm-009');
