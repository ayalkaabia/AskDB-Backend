const { pool } = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

class ConversationRepository {
  async createConversation(userId, title = null) {
    const connection = await pool.getConnection();
    try {
      const id = uuidv4();
      
      await connection.execute(
        'INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)',
        [id, userId, title]
      );
      
      return {
        id,
        user_id: userId,
        title,
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      };
    } finally {
      connection.release();
    }
  }

  async getConversationById(conversationId, userId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
        [conversationId, userId]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  async getUserConversations(userId, limit = 50, offset = 0) {
    const connection = await pool.getConnection();
    try {
      const limitInt = parseInt(limit, 10) || 50;
      const offsetInt = parseInt(offset, 10) || 0;

      const [rows] = await connection.execute(
        `SELECT * FROM conversations 
         WHERE user_id = ? 
         ORDER BY last_message_at DESC 
         LIMIT ${limitInt} OFFSET ${offsetInt}`,
        [userId]
      );
      
      return rows;
    } finally {
      connection.release();
    }
  }

  async updateConversationTitle(conversationId, userId, title) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [title, conversationId, userId]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async updateLastMessageTime(conversationId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [conversationId]
      );
    } finally {
      connection.release();
    }
  }

  async deleteConversation(conversationId, userId) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM conversations WHERE id = ? AND user_id = ?',
        [conversationId, userId]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async getUserConversationCount(userId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM conversations WHERE user_id = ?',
        [userId]
      );
      
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async getConversationMessageCount(conversationId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM query_history WHERE conversation_id = ?',
        [conversationId]
      );
      
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async generateConversationTitle(firstMessage) {
    if (!firstMessage || firstMessage.length === 0) {
      return 'New Chat';
    }
    
    const maxLength = 50;
    const title = firstMessage.trim();
    
    if (title.length <= maxLength) {
      return title;
    }
    
    return title.substring(0, maxLength - 3) + '...';
  }
}

module.exports = new ConversationRepository();
