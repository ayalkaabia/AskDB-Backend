const { pool } = require('../utils/database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

class DatabaseRepository {
  async storeDatabaseInfo(filePath, fileName) {
    const connection = await pool.getConnection();
    try {
      const id = uuidv4();
      const fileSize = fs.statSync(filePath).size;
      
      await connection.execute(
        'INSERT INTO `databases` (id, name, file_path, file_size, status, uploaded_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [id, fileName, filePath, fileSize, 'active']
      );
      
      return {
        id,
        name: fileName,
        file_path: filePath,
        file_size: fileSize,
        status: 'active',
        uploaded_at: new Date().toISOString()
      };
    } finally {
      connection.release();
    }
  }

  async updateDatabasePath(id, newPath) {
    const connection = await pool.getConnection();
    try {
      const fileSize = fs.statSync(newPath).size;
      
      await connection.execute(
        'UPDATE `databases` SET file_path = ?, file_size = ? WHERE id = ?',
        [newPath, fileSize, id]
      );
      
      return true;
    } finally {
      connection.release();
    }
  }

  async getAllDatabases(limit = 50, offset = 0, status = null) {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT * FROM `databases`';
      let params = [];
      
      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY uploaded_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [rows] = await connection.execute(query, params);
      
      return rows;
    } finally {
      connection.release();
    }
  }

  async createDatabase(databaseData) {
    const connection = await pool.getConnection();
    try {
      const id = databaseData.id || uuidv4();
      
      await connection.execute(
        'INSERT INTO `databases` (id, name, description, type, connection_string, file_path, file_size, status, charset, collation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [
          id,
          databaseData.name,
          databaseData.description,
          databaseData.type,
          databaseData.connection_string,
          databaseData.file_path,
          databaseData.file_size,
          databaseData.status || 'active',
          databaseData.charset || 'utf8mb4',
          databaseData.collation || 'utf8mb4_unicode_ci'
        ]
      );
      
      return {
        id,
        name: databaseData.name,
        description: databaseData.description,
        type: databaseData.type,
        connection_string: databaseData.connection_string,
        file_path: databaseData.file_path,
        file_size: databaseData.file_size,
        status: databaseData.status || 'active',
        charset: databaseData.charset || 'utf8mb4',
        collation: databaseData.collation || 'utf8mb4_unicode_ci',
        created_at: new Date().toISOString()
      };
    } finally {
      connection.release();
    }
  }

  async getDatabaseById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM `databases` WHERE id = ?',
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  async deleteDatabase(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM `databases` WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async createBackup(backupData) {
    const connection = await pool.getConnection();
    try {
      const id = uuidv4();
      
      await connection.execute(
        'INSERT INTO `database_backups` (id, database_id, name, description, file_path, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [
          id,
          backupData.database_id,
          backupData.name,
          backupData.description,
          backupData.file_path,
          backupData.file_size
        ]
      );
      
      return {
        id,
        database_id: backupData.database_id,
        name: backupData.name,
        description: backupData.description,
        file_path: backupData.file_path,
        file_size: backupData.file_size,
        created_at: backupData.created_at
      };
    } finally {
      connection.release();
    }
  }

  async getDatabaseStats() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          COUNT(*) as total_databases,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_databases,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_databases,
          SUM(file_size) as total_size,
          AVG(file_size) as average_size,
          MAX(uploaded_at) as latest_upload,
          MIN(uploaded_at) as earliest_upload
        FROM \`databases\`
      `);
      
      return rows[0] || {
        total_databases: 0,
        active_databases: 0,
        inactive_databases: 0,
        total_size: 0,
        average_size: 0,
        latest_upload: null,
        earliest_upload: null
      };
    } finally {
      connection.release();
    }
  }

  async validateDatabaseFile(filePath) {
    // Basic validation - check if file exists and has content
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }
      
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCurrentDatabase() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM `databases` WHERE status = "active" ORDER BY uploaded_at DESC LIMIT 1'
      );
      
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }
}

module.exports = new DatabaseRepository();
