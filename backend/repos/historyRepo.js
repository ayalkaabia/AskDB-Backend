const { pool } = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

class HistoryRepository {
  async addToHistory(queryData) {
    const connection = await pool.getConnection();
    try {
      const id = uuidv4();
      const resultCount = Array.isArray(queryData.results) ? queryData.results.length : 0;
      
      await connection.execute(
        'INSERT INTO query_history (id, prompt, sql_query, results, result_count) VALUES (?, ?, ?, ?, ?)',
        [
          id,
          queryData.prompt,
          queryData.sql,
          JSON.stringify(queryData.results),
          resultCount
        ]
      );
      
      return {
        id,
        prompt: queryData.prompt,
        sql: queryData.sql,
        results: queryData.results,
        timestamp: new Date().toISOString(),
        resultCount
      };
    } finally {
      connection.release();
    }
  }

  async getHistory(limit = 50, offset = 0) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM query_history ORDER BY timestamp DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      return rows.map(row => ({
        ...row,
        results: row.results ? JSON.parse(row.results) : null
      }));
    } finally {
      connection.release();
    }
  }

  async getHistoryById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM query_history WHERE id = ?',
        [id]
      );
      
      if (rows.length > 0) {
        const row = rows[0];
        return {
          ...row,
          results: row.results ? JSON.parse(row.results) : null
        };
      }
      return null;
    } finally {
      connection.release();
    }
  }

  async clearHistory() {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM query_history');
      return true;
    } finally {
      connection.release();
    }
  }

  async getHistoryStats() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          COUNT(*) as total_queries,
          SUM(result_count) as total_results,
          AVG(result_count) as average_results_per_query
        FROM query_history
      `);
      
      return rows[0] || {
        total_queries: 0,
        total_results: 0,
        average_results_per_query: 0
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = new HistoryRepository();
