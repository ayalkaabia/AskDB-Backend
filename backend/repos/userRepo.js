const { pool } = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

class UserRepository {
  async createUser(userData) {
    const connection = await pool.getConnection();
    try {
      const id = uuidv4();
      
      await connection.execute(
        'INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          userData.username,
          userData.email,
          userData.password,
          userData.firstName || '',
          userData.lastName || '',
          userData.role || 'user',
          userData.isActive !== undefined ? userData.isActive : true
        ]
      );
      
      return {
        id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: userData.role || 'user',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } finally {
      connection.release();
    }
  }

  async getUserById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  async getUserByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  async getUserByUsername(username) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  async getAllUsers(limit = 50, offset = 0, role = null) {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT * FROM users';
      let params = [];
      
      if (role) {
        query += ' WHERE role = ?';
        params.push(role);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [rows] = await connection.execute(query, params);
      
      return rows;
    } finally {
      connection.release();
    }
  }

  async updateUser(id, updateData) {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];
      
      if (updateData.username !== undefined) {
        fields.push('username = ?');
        values.push(updateData.username);
      }
      
      if (updateData.email !== undefined) {
        fields.push('email = ?');
        values.push(updateData.email);
      }
      
      if (updateData.password !== undefined) {
        fields.push('password = ?');
        values.push(updateData.password);
      }
      
      if (updateData.firstName !== undefined) {
        fields.push('first_name = ?');
        values.push(updateData.firstName);
      }
      
      if (updateData.lastName !== undefined) {
        fields.push('last_name = ?');
        values.push(updateData.lastName);
      }
      
      if (updateData.role !== undefined) {
        fields.push('role = ?');
        values.push(updateData.role);
      }
      
      if (updateData.isActive !== undefined) {
        fields.push('is_active = ?');
        values.push(updateData.isActive);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const [result] = await connection.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async deleteUser(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async getUserStats() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
          COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
          COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
          MAX(created_at) as latest_registration,
          MIN(created_at) as earliest_registration
        FROM users
      `);
      
      return rows[0] || {
        total_users: 0,
        active_users: 0,
        inactive_users: 0,
        admin_users: 0,
        regular_users: 0,
        latest_registration: null,
        earliest_registration: null
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = new UserRepository();
