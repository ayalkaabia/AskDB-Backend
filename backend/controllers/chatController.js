const aiService = require('../services/aiService');
const historyService = require('../services/historyService');
const databaseService = require('../services/databaseService');
const { v4: uuidv4 } = require('uuid');

/**
 * Unified Chat Controller
 * 
 * Handles all user interactions through a single chat endpoint.
 * Supports natural language queries, database creation, and file uploads.
 */
const processChat = async (req, res) => {
  try {
    const { message, conversation_id } = req.body;
    const file = req.file; // From multer middleware

    // Validate input
    if (!message && !file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either a message or a file is required'
      });
    }

    const chatId = conversation_id || uuidv4();
    
    const chatRequest = {
      message: message || (file ? `Create a database from this file: ${file.originalname}` : ''),
      file: file,
      conversation_id: chatId
    };

    const aiResponse = await aiService.processChatRequest(chatRequest);
    
    if (!aiResponse) {
      return res.status(500).json({
        error: 'AI Processing Failed',
        message: 'Unable to process your request. Please try again.'
      });
    }

    await historyService.addToHistory({
      prompt: chatRequest.message,
      sql: aiResponse.sql || null,
      results: aiResponse.results || null,
      database_id: aiResponse.database_id || null,
      query_type: aiResponse.query_type || 'OTHER'
    });
    res.status(200).json({
      conversation_id: chatId,
      message: aiResponse.message,
      data: {
        sql: aiResponse.sql || null,
        results: aiResponse.results || null,
        database_id: aiResponse.database_id || null,
        action_type: aiResponse.action_type || 'chat'
      },
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process your request',
      details: error.message
    });
  }
};

const getConversationHistory = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    
    if (!conversation_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Conversation ID is required'
      });
    }

    const history = await historyService.getHistoryByConversation(conversation_id);
    
    res.status(200).json({
      conversation_id,
      messages: history,
      success: true
    });

  } catch (error) {
    console.error('Get conversation history error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve conversation history'
    });
  }
};

const listConversations = async (req, res) => {
  try {
    const conversations = await historyService.getAllConversations();
    
    res.status(200).json({
      conversations,
      success: true
    });

  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve conversations'
    });
  }
};

module.exports = {
  processChat,
  getConversationHistory,
  listConversations
};
