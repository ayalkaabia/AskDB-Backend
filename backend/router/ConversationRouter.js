const express = require('express');
const router = express.Router();

// Import controllers
const conversationController = require('../controllers/conversationController');

// Import middleware
const auth = require('../middleware/auth');

// =============================================================================
// CONVERSATION MANAGEMENT ROUTES (Require Authentication)
// =============================================================================

// POST /conversations - Create new conversation
router.post('/', auth, conversationController.createConversation);

// GET /conversations - Get user's conversations
router.get('/', auth, conversationController.getUserConversations);

// GET /conversations/:id - Get specific conversation
router.get('/:id', auth, conversationController.getConversation);

// PUT /conversations/:id - Update conversation title
router.put('/:id', auth, conversationController.updateConversationTitle);

// DELETE /conversations/:id - Delete conversation
router.delete('/:id', auth, conversationController.deleteConversation);

module.exports = router;
