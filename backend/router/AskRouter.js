const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import controllers
const databaseController = require('../controllers/databaseController');
const queryController = require('../controllers/queryController');
const historyController = require('../controllers/historyController');
const exportController = require('../controllers/exportController');
const chatController = require('../controllers/chatController');
const userController = require('../controllers/userController');


// Import middleware
const { validateQuery, validateSQL, validateBody } = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../middleware/schemas');
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
// CHAT ROUTES
// =============================================================================

// POST /chat - Main chat endpoint
router.post('/chat', upload.single('file'), chatController.processChat);

// GET /chat/history/:conversation_id - Get conversation history
router.get('/chat/history/:conversation_id', chatController.getConversationHistory);

// GET /chat/conversations - List all conversations
router.get('/chat/conversations', chatController.listConversations);

// =============================================================================
// API ROUTES
// =============================================================================

// GET / - API root endpoint (lists key endpoints for discoverability)
router.get('/', (req, res) => {
  res.json({
    message: 'AskDB API is running',
    version: '2.0.0',
    endpoints: {
      // Chat Interface
      'POST /chat': 'Main chat interface - handles everything',
      'GET /chat/history/:id': 'Get conversation history',
      'GET /chat/conversations': 'List all conversations',
      
      // Database Management
      'POST /upload-db': 'Upload a database file',
      'GET /databases': 'Get all databases',
      'POST /databases': 'Create a new database',
      'GET /databases/:id': 'Get specific database by ID',
      'GET /databases/:id/schema': 'Get database schema',
      'DELETE /databases/:id': 'Delete specific database',
      'POST /databases/:id/backup': 'Create backup of specific database',
      'GET /databases/stats': 'Get database statistics',
      'POST /databases/:id/execute': 'Execute SQL query on specific database',
      'POST /databases/:id/import': 'Import SQL file into specific database',
      'GET /databases/:id/stats': 'Get specific database statistics',
      'GET /databases/:id/test': 'Test database connection',
      'GET /databases/server/list': 'List all databases on MySQL server',
      
      // Query Operations
      'POST /query': 'Submit natural language query',
      'POST /run-sql': 'Execute raw SQL query',
      'POST /create-database': 'Create database from natural language prompt',
      'POST /execute-multiple': 'Execute multiple SQL queries',
      'GET /schema': 'Get current database schema',
      'GET /test-ai': 'Test AI connection',
      
      // History Management
      'GET /history': 'Get query history',
      'GET /history/:id': 'Get specific history item by ID',
      'GET /history/search': 'Search history by keyword',
      'DELETE /history/:id': 'Delete specific history item',
      'PUT /history/:id': 'Update specific history item',
      'GET /history/stats': 'Get history statistics',
      
      // Export
      'GET /export': 'Export query results',

      // Auth & User (JWT-based)
      'POST /auth/register': 'Register new user',
      'POST /auth/login': 'Login user',
      'GET /users/me': 'Get current user profile',
      'PUT /users/me': 'Update current user profile',

      
    }
  });
});

// =============================================================================
// DATABASE MANAGEMENT ROUTES
// =============================================================================

// POST /upload-db - Upload a database file
router.post('/upload-db', upload.single('file'), databaseController.uploadDatabase);

// GET /databases - Get all databases
router.get('/databases', databaseController.getAllDatabases);

// POST /databases - Create a new database
router.post('/databases', databaseController.createDatabase);

// GET /databases/:id - Get specific database by ID
router.get('/databases/:id', databaseController.getDatabaseById);

// DELETE /databases/:id - Delete specific database
router.delete('/databases/:id', databaseController.deleteDatabase);

// GET /databases/:id/schema - Get database schema
router.get('/databases/:id/schema', databaseController.getDatabaseSchema);

// GET /databases/stats - Get database statistics
router.get('/databases/stats', databaseController.getDatabaseStats);

// GET /databases/:id/stats - Get specific database statistics
router.get('/databases/:id/stats', databaseController.getDatabaseStatistics);

// POST /databases/:id/execute - Execute SQL query on specific database
router.post('/databases/:id/execute', databaseController.executeQuery);

// POST /databases/:id/import - Import SQL file into specific database
router.post('/databases/:id/import', databaseController.importSQLFile);

// GET /databases/:id/test - Test database connection
router.get('/databases/:id/test', databaseController.testDatabaseConnection);

// GET /databases/server/list - List all databases on MySQL server
router.get('/databases/server/list', databaseController.listServerDatabases);

// POST /databases/:id/backup - Create backup of specific database
router.post('/databases/:id/backup', databaseController.createBackup);

// =============================================================================
// QUERY OPERATIONS ROUTES
// =============================================================================

// POST /query - Submit natural language prompt
router.post('/query', validateQuery, queryController.processQuery);

// POST /create-database - Create database from natural language prompt
router.post('/create-database', validateQuery, queryController.createDatabaseFromPrompt);

// POST /run-sql - Execute raw SQL query
router.post('/run-sql', validateSQL, queryController.runSQL);

// POST /execute-multiple - Execute multiple SQL queries
router.post('/execute-multiple', queryController.executeMultipleQueries);

// GET /schema - Get current database schema
router.get('/schema', queryController.getDatabaseSchema);

// GET /test-ai - Test AI connection
router.get('/test-ai', queryController.testAIConnection);

// =============================================================================
// HISTORY MANAGEMENT ROUTES
// =============================================================================

// GET /history - Get query history
router.get('/history', historyController.getHistory);

// GET /history/:id - Get specific history item by ID
router.get('/history/:id', historyController.getHistoryById);

// GET /history/search - Search history by keyword
router.get('/history/search', historyController.searchHistory);

// GET /history/stats - Get history statistics
router.get('/history/stats', historyController.getHistoryStats);

// DELETE /history/:id - Delete specific history item
router.delete('/history/:id', historyController.deleteHistoryById);

// PUT /history/:id - Update specific history item
router.put('/history/:id', historyController.updateHistoryById);

// =============================================================================
// EXPORT ROUTES
// =============================================================================

// GET /export - Export query results
router.get('/export', exportController.exportResults);

// =============================================================================
// AUTH & USER ROUTES
// =============================================================================

router.post('/auth/register', validateBody(registerSchema), userController.register);
router.post('/auth/login', validateBody(loginSchema), userController.login);
router.get('/users/me', auth, userController.me);
router.put('/users/me', auth, userController.updateMe);

// 


module.exports = router;


