const { pool } = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

class PermissionRepository {
  async getAllPermissions(limit = 50, offset = 0, resource_type = null) {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT * FROM permissions';
      let params = [];
      
      if (resource_type) {
        query += ' WHERE resource_type = ?';
        params.push(resource_type);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [rows] = await connection.execute(query, params);
      
      return rows;
    } finally {
      connection.release();
    }
  }

  async createPermission(permissionData) {
    const connection = await pool.getConnection();
    try {
      const id = uuidv4();
      
      await connection.execute(
        'INSERT INTO permissions (id, name, description, resource_type, action, conditions, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          permissionData.name,
          permissionData.description,
          permissionData.resource_type,
          permissionData.action,
          permissionData.conditions ? JSON.stringify(permissionData.conditions) : null,
          permissionData.is_active !== undefined ? permissionData.is_active : true
        ]
      );
      
      return {
        id,
        name: permissionData.name,
        description: permissionData.description,
        resource_type: permissionData.resource_type,
        action: permissionData.action,
        conditions: permissionData.conditions,
        is_active: permissionData.is_active !== undefined ? permissionData.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } finally {
      connection.release();
    }
  }

  async getPermissionById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM permissions WHERE id = ?',
        [id]
      );
      
      if (rows.length > 0) {
        const row = rows[0];
        return {
          ...row,
          conditions: row.conditions ? JSON.parse(row.conditions) : null
        };
      }
      return null;
    } finally {
      connection.release();
    }
  }

  async getPermissionByName(name) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM permissions WHERE name = ?',
        [name]
      );
      
      if (rows.length > 0) {
        const row = rows[0];
        return {
          ...row,
          conditions: row.conditions ? JSON.parse(row.conditions) : null
        };
      }
      return null;
    } finally {
      connection.release();
    }
  }

  async updatePermission(id, updateData) {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];
      
      if (updateData.name !== undefined) {
        fields.push('name = ?');
        values.push(updateData.name);
      }
      
      if (updateData.description !== undefined) {
        fields.push('description = ?');
        values.push(updateData.description);
      }
      
      if (updateData.resource_type !== undefined) {
        fields.push('resource_type = ?');
        values.push(updateData.resource_type);
      }
      
      if (updateData.action !== undefined) {
        fields.push('action = ?');
        values.push(updateData.action);
      }
      
      if (updateData.conditions !== undefined) {
        fields.push('conditions = ?');
        values.push(updateData.conditions ? JSON.stringify(updateData.conditions) : null);
      }
      
      if (updateData.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(updateData.is_active);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      const [result] = await connection.execute(
        `UPDATE permissions SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async deletePermission(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM permissions WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async getUserPermissions(userId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT p.*, up.assigned_at
        FROM permissions p
        INNER JOIN user_permissions up ON p.id = up.permission_id
        WHERE up.user_id = ? AND p.is_active = 1
        ORDER BY p.resource_type, p.action
      `, [userId]);
      
      return rows.map(row => ({
        ...row,
        conditions: row.conditions ? JSON.parse(row.conditions) : null
      }));
    } finally {
      connection.release();
    }
  }

  async getUserPermissionAssignment(userId, permissionId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM user_permissions WHERE user_id = ? AND permission_id = ?',
        [userId, permissionId]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  async assignPermissionToUser(userId, permissionId) {
    const connection = await pool.getConnection();
    try {
      const id = uuidv4();
      
      await connection.execute(
        'INSERT INTO user_permissions (id, user_id, permission_id, assigned_at) VALUES (?, ?, ?, NOW())',
        [id, userId, permissionId]
      );
      
      return {
        id,
        user_id: userId,
        permission_id: permissionId,
        assigned_at: new Date().toISOString()
      };
    } finally {
      connection.release();
    }
  }

  async removePermissionFromUser(userId, permissionId) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM user_permissions WHERE user_id = ? AND permission_id = ?',
        [userId, permissionId]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async getPermissionStats() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          COUNT(*) as total_permissions,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_permissions,
          COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_permissions,
          COUNT(DISTINCT resource_type) as unique_resource_types,
          COUNT(DISTINCT action) as unique_actions,
          MAX(created_at) as latest_permission,
          MIN(created_at) as earliest_permission
        FROM permissions
      `);
      
      return rows[0] || {
        total_permissions: 0,
        active_permissions: 0,
        inactive_permissions: 0,
        unique_resource_types: 0,
        unique_actions: 0,
        latest_permission: null,
        earliest_permission: null
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = new PermissionRepository();
