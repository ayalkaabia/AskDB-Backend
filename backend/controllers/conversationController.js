const conversationService = require('../services/conversationService');

const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    
    const conversation = await conversationService.createConversation(userId, title);
    
    res.status(201).json({
      conversation,
      success: true
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create conversation'
    });
  }
};

const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const conversation = await conversationService.getConversation(id, userId);
    
    res.status(200).json({
      conversation,
      success: true
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve conversation'
    });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const conversations = await conversationService.getUserConversations(userId, limit, offset);
    
    res.status(200).json({
      conversations,
      success: true
    });
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve conversations'
    });
  }
};

const updateConversationTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title is required and must be a non-empty string'
      });
    }
    
    const result = await conversationService.updateConversationTitle(id, userId, title.trim());
    
    res.status(200).json({
      success: true,
      message: 'Conversation title updated successfully'
    });
  } catch (error) {
    console.error('Update conversation title error:', error);
    
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update conversation title'
    });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await conversationService.deleteConversation(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete conversation'
    });
  }
};

module.exports = {
  createConversation,
  getConversation,
  getUserConversations,
  updateConversationTitle,
  deleteConversation
};
