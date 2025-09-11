const aiService = require('../services/aiService');
const historyService = require('../services/historyService');
const databaseService = require('../services/databaseService');
const conversationService = require('../services/conversationService');
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
    const userId = req.user.id; // From auth middleware

    // Validate input
    if (!message && !file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either a message or a file is required'
      });
    }

    let chatId = conversation_id;
    let isNewConversation = false;

    // If no conversation_id provided, create a new conversation
    if (!chatId) {
      const newConversation = await conversationService.createConversation(userId);
      chatId = newConversation.id;
      isNewConversation = true;
    } else {
      // Verify the conversation belongs to the user
      await conversationService.getConversation(chatId, userId);
    }

    // Check conversation message limits
    await conversationService.checkConversationLimits(chatId);
    
    // Load conversation history for AI context
    const conversationHistory = await historyService.getHistoryByConversation(chatId);
    
    const chatRequest = {
      message: message || (file ? `Create a database from this file: ${file.originalname}` : ''),
      file: file,
      conversation_id: chatId,
      user_id: userId,
      conversation_history: conversationHistory
    };
    

    const aiResponse = await aiService.processChatRequest(chatRequest);
    
    if (!aiResponse) {
      return res.status(500).json({
        error: 'AI Processing Failed',
        message: 'Unable to process your request. Please try again.'
      });
    }

    // Store in history with user and conversation associations
    await historyService.addToHistory({
      user_id: userId,
      conversation_id: chatId,
      prompt: chatRequest.message || 'File upload',
      sql: aiResponse.sql || '',
      results: aiResponse.results || null,
      database_id: aiResponse.database_id || null,
      query_type: aiResponse.query_type || 'OTHER'
    });

    // Update conversation's last message time
    await conversationService.updateLastMessageTime(chatId);

    // If this is a new conversation, generate title from first message
    if (isNewConversation && chatRequest.message) {
      const title = await conversationService.generateTitleFromMessage(chatRequest.message);
      await conversationService.updateConversationTitle(chatId, userId, title);
    }

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
    
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message
      });
    }
    
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
    const userId = req.user.id;
    
    if (!conversation_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Conversation ID is required'
      });
    }

    // Verify the conversation belongs to the user
    await conversationService.getConversation(conversation_id, userId);

    const history = await historyService.getHistoryByConversation(conversation_id);
    
    res.status(200).json({
      conversation_id,
      messages: history,
      success: true
    });

  } catch (error) {
    console.error('Get conversation history error:', error);
    
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve conversation history'
    });
  }
};

const listConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const conversations = await conversationService.getUserConversations(userId, limit, offset);
    
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
