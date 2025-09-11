const conversationRepo = require('../repos/conversationRepo');

const MAX_CONVERSATIONS_PER_USER = 50;
const MAX_MESSAGES_PER_CONVERSATION = 1000;

const createConversation = async (userId, title = null) => {
  const conversationCount = await conversationRepo.getUserConversationCount(userId);
  
  if (conversationCount >= MAX_CONVERSATIONS_PER_USER) {
    const error = new Error('Maximum number of conversations reached');
    error.status = 400;
    throw error;
  }
  
  return await conversationRepo.createConversation(userId, title);
};

const getConversation = async (conversationId, userId) => {
  const conversation = await conversationRepo.getConversationById(conversationId, userId);
  
  if (!conversation) {
    const error = new Error('Conversation not found');
    error.status = 404;
    throw error;
  }
  
  return conversation;
};

const getUserConversations = async (userId, limit = 50, offset = 0) => {
  return await conversationRepo.getUserConversations(userId, limit, offset);
};

const updateConversationTitle = async (conversationId, userId, title) => {
  const success = await conversationRepo.updateConversationTitle(conversationId, userId, title);
  
  if (!success) {
    const error = new Error('Conversation not found or update failed');
    error.status = 404;
    throw error;
  }
  
  return { success: true };
};

const deleteConversation = async (conversationId, userId) => {
  const success = await conversationRepo.deleteConversation(conversationId, userId);
  
  if (!success) {
    const error = new Error('Conversation not found or delete failed');
    error.status = 404;
    throw error;
  }
  
  return { success: true };
};

const updateLastMessageTime = async (conversationId) => {
  await conversationRepo.updateLastMessageTime(conversationId);
};

const generateTitleFromMessage = async (message) => {
  return await conversationRepo.generateConversationTitle(message);
};

const checkConversationLimits = async (conversationId) => {
  const messageCount = await conversationRepo.getConversationMessageCount(conversationId);
  
  if (messageCount >= MAX_MESSAGES_PER_CONVERSATION) {
    const error = new Error('Maximum number of messages reached for this conversation');
    error.status = 400;
    throw error;
  }
  
  return true;
};

module.exports = {
  createConversation,
  getConversation,
  getUserConversations,
  updateConversationTitle,
  deleteConversation,
  updateLastMessageTime,
  generateTitleFromMessage,
  checkConversationLimits,
  MAX_CONVERSATIONS_PER_USER,
  MAX_MESSAGES_PER_CONVERSATION
};
