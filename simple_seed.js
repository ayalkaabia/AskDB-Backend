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

        // Create databases table
        console.log('  Creating databases table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`databases\` (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ Created databases table');

        // Create query_history table
        console.log('  Creating query_history table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`query_history\` (
                id VARCHAR(36) PRIMARY KEY,
                prompt TEXT,
                sql_query TEXT NOT NULL,
                results JSON,
                result_count INT DEFAULT 0,
                execution_time_ms INT,
                database_id VARCHAR(36),
                conversation_id VARCHAR(36),
                query_type ENUM('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'OTHER') DEFAULT 'SELECT',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ Created database_backups table');

        // Create users table
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

        // Create indexes
        console.log('\n🔍 Creating indexes...');
        const indexes = [
            'CREATE INDEX idx_query_history_timestamp ON `query_history`(timestamp)',
            'CREATE INDEX idx_query_history_database_id ON `query_history`(database_id)',
            'CREATE INDEX idx_query_history_query_type ON `query_history`(query_type)',
            'CREATE INDEX idx_databases_name ON `databases`(name)',
            'CREATE INDEX idx_databases_status ON `databases`(status)',
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
        console.log('\n🚀 Your AskDB is ready to use!');

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
