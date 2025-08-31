const { pool } = require('../utils/database');
const databaseRepo = require('./databaseRepo');

class QueryRepository {
  async executeQuery(sqlQuery) {
    const currentDb = await databaseRepo.getCurrentDatabase();
    
    if (!currentDb) {
      throw new Error('No database loaded');
    }

    // For now, we'll use the main database connection
    // In a more sophisticated setup, you might want to create separate connections for uploaded databases
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(sqlQuery);
      return rows;
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getTableSchema(tableName) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'DESCRIBE ??',
        [tableName]
      );
      return rows;
    } catch (error) {
      console.error('Schema query error:', error);
      return null;
    } finally {
      connection.release();
    }
  }

  async getTableNames() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SHOW TABLES');
      return rows.map(row => Object.values(row)[0]);
    } catch (error) {
      console.error('Table names query error:', error);
      return [];
    } finally {
      connection.release();
    }
  }

  async testConnection() {
    const connection = await pool.getConnection();
    try {
      await connection.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    } finally {
      connection.release();
    }
  }
}

module.exports = new QueryRepository();
