const { pool } = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

class HistoryRepository {
  async addToHistory(queryData) {
    const connection = await pool.getConnection();
    try {
      const id = uuidv4();
      const resultCount = Array.isArray(queryData.results) ? queryData.results.length : 0;
      
      // Determine query type from SQL
      const queryType = this.determineQueryType(queryData.sql);
      
      await connection.execute(
        'INSERT INTO `query_history` (id, prompt, sql_query, results, result_count, database_id, query_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          queryData.prompt,
          queryData.sql,
          JSON.stringify(queryData.results),
          resultCount,
          queryData.database_id || null,
          queryType
        ]
      );
      
      return {
        id,
        prompt: queryData.prompt,
        sql: queryData.sql,
        results: queryData.results,
        database_id: queryData.database_id || null,
        query_type: queryType,
        timestamp: new Date().toISOString(),
        resultCount
      };
    } finally {
      connection.release();
    }
  }

  determineQueryType(sql) {
    if (!sql) return 'OTHER';
    
    const upperSQL = sql.toUpperCase().trim();
    if (upperSQL.startsWith('SELECT')) return 'SELECT';
    if (upperSQL.startsWith('INSERT')) return 'INSERT';
    if (upperSQL.startsWith('UPDATE')) return 'UPDATE';
    if (upperSQL.startsWith('DELETE')) return 'DELETE';
    if (upperSQL.startsWith('CREATE')) return 'CREATE';
    if (upperSQL.startsWith('DROP')) return 'DROP';
    if (upperSQL.startsWith('ALTER')) return 'ALTER';
    
    return 'OTHER';
  }

  async getHistory(limit = 50, offset = 0) {
    const connection = await pool.getConnection();
    try {
      // Ensure integers (protects against SQL injection)
      limit = parseInt(limit, 10) || 50;
      offset = parseInt(offset, 10) || 0;
  
      const [rows] = await connection.query(
        `SELECT * FROM \`query_history\` ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}`
      );
      
      return rows.map(row => ({
        ...row,
        results: (typeof row.results === 'string')
          ? JSON.parse(row.results)
          : row.results
      }));
      
    } finally {
      connection.release();
    }
  }
  

  async getHistoryById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM `query_history` WHERE id = ?',
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


  async searchHistory(query, limit = 50, offset = 0) {
    const connection = await pool.getConnection();
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await connection.execute(
        'SELECT * FROM `query_history` WHERE prompt LIKE ? OR sql_query LIKE ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
        [searchTerm, searchTerm, limit, offset]
      );
      
      return rows.map(row => ({
        ...row,
        results: row.results ? JSON.parse(row.results) : null
      }));
    } finally {
      connection.release();
    }
  }

  async deleteHistoryById(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM `query_history` WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async updateHistoryById(id, updateData) {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];
      
      if (updateData.prompt !== undefined) {
        fields.push('prompt = ?');
        values.push(updateData.prompt);
      }
      
      if (updateData.sql_query !== undefined) {
        fields.push('sql_query = ?');
        values.push(updateData.sql_query);
      }
      
      if (updateData.results !== undefined) {
        fields.push('results = ?');
        values.push(JSON.stringify(updateData.results));
      }
      
      if (updateData.result_count !== undefined) {
        fields.push('result_count = ?');
        values.push(updateData.result_count);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      values.push(id);
      
      const [result] = await connection.execute(
        `UPDATE \`query_history\` SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async clearHistory() {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM `query_history`');
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
          AVG(result_count) as average_results_per_query,
          MAX(timestamp) as last_query_time,
          MIN(timestamp) as first_query_time
        FROM \`query_history\`
      `);
      
      return rows[0] || {
        total_queries: 0,
        total_results: 0,
        average_results_per_query: 0,
        last_query_time: null,
        first_query_time: null
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = new HistoryRepository();
