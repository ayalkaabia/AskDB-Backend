const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import controllers
const chatController = require('../controllers/chatController');

// Import middleware
const auth = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/octet-stream' || 
        file.originalname.endsWith('.sql') || 
        file.originalname.endsWith('.db')) {
      cb(null, true);
    } else {
      cb(new Error('Only .sql and .db files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// =============================================================================
// CHAT ROUTES (Require Authentication)
// =============================================================================

// POST /chat - Main chat endpoint
router.post('/', auth, upload.single('file'), chatController.processChat);

// GET /chat/history/:conversation_id - Get conversation history
router.get('/history/:conversation_id', auth, chatController.getConversationHistory);

// GET /chat/conversations - List user's conversations
router.get('/conversations', auth, chatController.listConversations);

module.exports = router;
