const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

class DatabaseConnectionManager {
  constructor() {
    this.connections = new Map(); // Store active connections
    this.baseConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    };
  }

  /**
   * Create a new MySQL database
   */
  async createDatabase(databaseName, options = {}) {
    try {
      // Validate database name
      if (!this.isValidDatabaseName(databaseName)) {
        throw new Error('Invalid database name. Use only alphanumeric characters and underscores.');
      }

      // Connect to MySQL server (without specifying database)
      const connection = await mysql.createConnection({
        ...this.baseConfig,
        multipleStatements: true
      });

      // Create the database
      const createQuery = `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` ${options.charset ? `CHARACTER SET ${options.charset}` : ''} ${options.collation ? `COLLATE ${options.collation}` : ''}`;
      
      await connection.execute(createQuery);
      await connection.end();

      // Store database info
      const dbInfo = {
        id: uuidv4(),
        name: databaseName,
        type: 'mysql',
        status: 'active',
        created_at: new Date().toISOString(),
        options: options
      };

      return dbInfo;

    } catch (error) {
      console.error('Error creating database:', error);
      throw new Error(`Failed to create database: ${error.message}`);
    }
  }

  /**
   * Get connection to a specific database
   */
  async getConnection(databaseName) {
    try {
      // Check if we already have a connection for this database
      if (this.connections.has(databaseName)) {
        return this.connections.get(databaseName);
      }

      // Create new connection
      const connection = await mysql.createConnection({
        ...this.baseConfig,
        database: databaseName,
        multipleStatements: true
      });

      // Store connection
      this.connections.set(databaseName, connection);

      return connection;

    } catch (error) {
      console.error(`Error connecting to database ${databaseName}:`, error);
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  }

  /**
   * Get connection pool for a specific database
   */
  async getConnectionPool(databaseName) {
    try {
      const pool = mysql.createPool({
        ...this.baseConfig,
        database: databaseName,
        multipleStatements: true
      });

      return pool;

    } catch (error) {
      console.error(`Error creating connection pool for ${databaseName}:`, error);
      throw new Error(`Failed to create connection pool: ${error.message}`);
    }
  }

  /**
   * Execute SQL query on a specific database
   */
  async executeQuery(databaseName, sqlQuery, params = []) {
    let connection;
    try {
      connection = await this.getConnection(databaseName);
      
      // Execute the query
      const [rows, fields] = await connection.execute(sqlQuery, params);
      
      return {
        rows: rows,
        fields: fields,
        affectedRows: rows.affectedRows || 0,
        insertId: rows.insertId || null
      };

    } catch (error) {
      console.error(`Error executing query on ${databaseName}:`, error);
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  /**
   * Execute multiple SQL statements
   */
  async executeMultipleQueries(databaseName, sqlQueries) {
    let connection;
    try {
      connection = await this.getConnection(databaseName);
      
      const results = [];
      for (const query of sqlQueries) {
        const [rows, fields] = await connection.execute(query);
        results.push({
          query: query,
          rows: rows,
          fields: fields,
          affectedRows: rows.affectedRows || 0,
          insertId: rows.insertId || null
        });
      }
      
      return results;

    } catch (error) {
      console.error(`Error executing multiple queries on ${databaseName}:`, error);
      throw new Error(`Multiple query execution failed: ${error.message}`);
    }
  }

  /**
   * Get database schema information
   */
  async getDatabaseSchema(databaseName) {
    try {
      const connection = await this.getConnection(databaseName);
      
      // Get all tables
      const [tables] = await connection.execute('SHOW TABLES');
      
      const schema = {
        database_name: databaseName,
        tables: []
      };

      // Get detailed information for each table
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE \`${tableName}\``);
        
        // Get table indexes
        const [indexes] = await connection.execute(`SHOW INDEX FROM \`${tableName}\``);
        
        // Get table creation statement
        const [createTable] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
        
        schema.tables.push({
          name: tableName,
          columns: columns,
          indexes: indexes,
          create_statement: createTable[0]['Create Table']
        });
      }

      return schema;

    } catch (error) {
      console.error(`Error getting schema for ${databaseName}:`, error);
      throw new Error(`Failed to get database schema: ${error.message}`);
    }
  }

  /**
   * List all databases on the server
   */
  async listDatabases() {
    try {
      const connection = await mysql.createConnection({
        ...this.baseConfig,
        multipleStatements: true
      });

      const [rows] = await connection.execute('SHOW DATABASES');
      await connection.end();

      return rows.map(row => Object.values(row)[0]);

    } catch (error) {
      console.error('Error listing databases:', error);
      throw new Error(`Failed to list databases: ${error.message}`);
    }
  }

  /**
   * Drop a database
   */
  async dropDatabase(databaseName) {
    try {
      // Validate database name
      if (!this.isValidDatabaseName(databaseName)) {
        throw new Error('Invalid database name');
      }

      // Close any existing connections to this database
      if (this.connections.has(databaseName)) {
        const connection = this.connections.get(databaseName);
        await connection.end();
        this.connections.delete(databaseName);
      }

      // Connect to MySQL server (without specifying database)
      const connection = await mysql.createConnection({
        ...this.baseConfig,
        multipleStatements: true
      });

      // Drop the database
      await connection.execute(`DROP DATABASE IF EXISTS \`${databaseName}\``);
      await connection.end();

      return true;

    } catch (error) {
      console.error('Error dropping database:', error);
      throw new Error(`Failed to drop database: ${error.message}`);
    }
  }

  /**
   * Import SQL file into a database
   */
  async importSQLFile(databaseName, sqlContent) {
    try {
      const connection = await this.getConnection(databaseName);
      
      // Split SQL content into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      const results = [];
      for (const statement of statements) {
        if (statement.trim()) {
          const [rows, fields] = await connection.execute(statement);
          results.push({
            statement: statement,
            rows: rows,
            affectedRows: rows.affectedRows || 0,
            insertId: rows.insertId || null
          });
        }
      }

      return results;

    } catch (error) {
      console.error(`Error importing SQL file to ${databaseName}:`, error);
      throw new Error(`Failed to import SQL file: ${error.message}`);
    }
  }

  /**
   * Close all connections
   */
  async closeAllConnections() {
    try {
      for (const [databaseName, connection] of this.connections) {
        await connection.end();
      }
      this.connections.clear();
    } catch (error) {
      console.error('Error closing connections:', error);
    }
  }

  /**
   * Close connection to specific database
   */
  async closeConnection(databaseName) {
    try {
      if (this.connections.has(databaseName)) {
        const connection = this.connections.get(databaseName);
        await connection.end();
        this.connections.delete(databaseName);
      }
    } catch (error) {
      console.error(`Error closing connection to ${databaseName}:`, error);
    }
  }

  /**
   * Validate database name
   */
  isValidDatabaseName(name) {
    // MySQL database names can contain letters, digits, underscores, and dollar signs
    // Must start with a letter or underscore
    const regex = /^[a-zA-Z_][a-zA-Z0-9_$]*$/;
    return regex.test(name) && name.length <= 64;
  }

  /**
   * Test connection to a database
   */
  async testConnection(databaseName) {
    try {
      const connection = await this.getConnection(databaseName);
      await connection.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error(`Connection test failed for ${databaseName}:`, error);
      return false;
    }
  }

  /**
   * Get database size and statistics
   */
  async getDatabaseStats(databaseName) {
    try {
      const connection = await this.getConnection(databaseName);
      
      // Get database size
      const [sizeResult] = await connection.execute(`
        SELECT 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [databaseName]);

      // Get table count
      const [tableCount] = await connection.execute(`
        SELECT COUNT(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [databaseName]);

      return {
        database_name: databaseName,
        size_mb: sizeResult[0].size_mb || 0,
        table_count: tableCount[0].table_count,
        last_checked: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error getting stats for ${databaseName}:`, error);
      throw new Error(`Failed to get database statistics: ${error.message}`);
    }
  }
}

module.exports = new DatabaseConnectionManager();
