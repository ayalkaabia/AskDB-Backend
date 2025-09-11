const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Simple Database Seeding Script for AskDB
 * 
 * This script creates the database and all necessary tables
 * for the AskDB application to work properly.
 * 
 * Usage: npm run seed
 */

async function simpleSeed() {
    let connection;
    let adminConnection;
    
    try {
        console.log('🌱 Starting simple database seeding...\n');

        // Connect to MySQL server
        console.log('📡 Connecting to MySQL server...');
        adminConnection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        const dbName = process.env.DB_NAME || 'askdb';
        console.log(`✅ Connected to MySQL server`);

        // Create database
        console.log(`\n🗄️  Creating database '${dbName}'...`);
        await adminConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Database '${dbName}' is ready`);

        await adminConnection.end();

        // Connect to the database
        console.log(`\n📡 Connecting to database '${dbName}'...`);
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: dbName,
            port: process.env.DB_PORT || 3306
        });
        console.log(`✅ Connected to database '${dbName}'`);

        // Create tables one by one 
        console.log('\n🔨 Creating tables...');

        console.log('  Creating users table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`users\` (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ Created users table');

        // Create databases table
        console.log('  Creating databases table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`databases\` (
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
            )
        `);
        console.log('  ✅ Created databases table');

        // Create conversations table (for chat system)
        console.log('  Creating conversations table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`conversations\` (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                title VARCHAR(255),
                last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ Created conversations table');

        // Create query_history table (updated with user and conversation associations)
        console.log('  Creating query_history table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`query_history\` (
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
                FOREIGN KEY (database_id) REFERENCES \`databases\`(id) ON DELETE SET NULL
            )
        `);
        console.log('  ✅ Created query_history table');

        // Create database_backups table
        console.log('  Creating database_backups table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`database_backups\` (
                id VARCHAR(36) PRIMARY KEY,
                database_id VARCHAR(36) NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                file_path VARCHAR(500),
                file_size BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (database_id) REFERENCES \`databases\`(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ Created database_backups table');

        // Create indexes
        console.log('\n🔍 Creating indexes...');
        const indexes = [
            // Query history indexes
            'CREATE INDEX idx_query_history_timestamp ON `query_history`(timestamp)',
            'CREATE INDEX idx_query_history_database_id ON `query_history`(database_id)',
            'CREATE INDEX idx_query_history_query_type ON `query_history`(query_type)',
            'CREATE INDEX idx_query_history_user_id ON `query_history`(user_id)',
            'CREATE INDEX idx_query_history_conversation_id ON `query_history`(conversation_id)',
            'CREATE INDEX idx_query_history_prompt ON `query_history`(prompt(100))',
            'CREATE INDEX idx_query_history_sql_query ON `query_history`(sql_query(100))',
            
            // Conversations indexes
            'CREATE INDEX idx_conversations_user_id ON `conversations`(user_id)',
            'CREATE INDEX idx_conversations_last_message_at ON `conversations`(last_message_at)',
            'CREATE INDEX idx_conversations_created_at ON `conversations`(created_at)',
            
            // Databases indexes
            'CREATE INDEX idx_databases_user_id ON `databases`(user_id)',
            'CREATE INDEX idx_databases_name ON `databases`(name)',
            'CREATE INDEX idx_databases_status ON `databases`(status)',
            'CREATE INDEX idx_databases_type ON `databases`(type)',
            'CREATE INDEX idx_databases_uploaded_at ON `databases`(uploaded_at)',
            
            // Users indexes
            'CREATE INDEX idx_users_email ON `users`(email)',
            'CREATE INDEX idx_users_created_at ON `users`(created_at)'
        ];

        for (const indexSQL of indexes) {
            try {
                await connection.execute(indexSQL);
                const indexName = indexSQL.match(/idx_\w+/)?.[0];
                console.log(`  ✅ Created index: ${indexName}`);
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    const indexName = indexSQL.match(/idx_\w+/)?.[0];
                    console.log(`  ⚠️  Index already exists: ${indexName}`);
                } else {
                    console.log(`  ⚠️  Could not create index: ${error.message}`);
                }
            }
        }

        // Verify setup
        console.log('\n🔍 Verifying setup...');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`✅ Found ${tables.length} tables:`);
        
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [columns] = await connection.execute(`DESCRIBE \`${tableName}\``);
            console.log(`  - ${tableName}: ${columns.length} columns`);
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('  1. Run: npm start');
        console.log('  2. Test the API endpoints');
        console.log('  3. Register a user account');
        console.log('  4. Test the new chat system!');
        console.log('\n🚀 Your AskDB with chat system is ready to use!');

    } catch (error) {
        console.error('\n❌ Database seeding failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
        if (adminConnection) {
            await adminConnection.end();
        }
    }
}

simpleSeed();
