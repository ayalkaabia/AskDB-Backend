const { pool } = require('../utils/database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

class DatabaseRepository {
  async storeDatabaseInfo(filePath, fileName) {
    const connection = await pool.getConnection();
    try {
      // Deactivate all other databases
      await connection.execute('UPDATE uploaded_databases SET is_active = FALSE');
      
      // Insert new database
      const dbId = uuidv4();
      await connection.execute(
        'INSERT INTO uploaded_databases (id, name, file_path, is_active) VALUES (?, ?, ?, ?)',
        [dbId, fileName, filePath, true]
      );
      
      return { id: dbId, name: fileName, path: filePath };
    } finally {
      connection.release();
    }
  }

  async getCurrentDatabase() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM uploaded_databases WHERE is_active = TRUE LIMIT 1'
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  async getAllDatabases() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM uploaded_databases ORDER BY uploaded_at DESC'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  async getDatabaseById(dbId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM uploaded_databases WHERE id = ?',
        [dbId]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  async deleteDatabase(dbId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT file_path FROM uploaded_databases WHERE id = ?',
        [dbId]
      );
      
      if (rows.length > 0) {
        const filePath = rows[0].file_path;
        
        // Delete file from filesystem
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        // Delete from database
        await connection.execute('DELETE FROM uploaded_databases WHERE id = ?', [dbId]);
        return true;
      }
      return false;
    } finally {
      connection.release();
    }
  }

  async validateDatabaseFile(filePath) {
    // This is a basic validation - in production, you might want more sophisticated validation
    return new Promise((resolve) => {
      try {
        // Check if file exists and is readable
        if (!fs.existsSync(filePath)) {
          resolve(false);
          return;
        }
        
        // Check file size (basic validation)
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          resolve(false);
          return;
        }
        
        resolve(true);
      } catch (error) {
        console.error('File validation error:', error);
        resolve(false);
      }
    });
  }
}

module.exports = new DatabaseRepository();
