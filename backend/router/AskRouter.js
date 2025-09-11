const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import controllers
const databaseController = require('../controllers/databaseController');
const exportController = require('../controllers/exportController');


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
    // Sanitize filename to prevent path traversal
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = path.extname(sanitizedName);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Enhanced file validation
    const allowedExtensions = ['.sql', '.db'];
    const allowedMimeTypes = ['application/octet-stream', 'application/sql', 'application/x-sqlite3'];
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isValidExtension = allowedExtensions.includes(fileExtension);
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype) || 
                           file.mimetype === 'application/octet-stream';
    
    // Check for path traversal attempts
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      return cb(new Error('Invalid filename: path traversal not allowed'), false);
    }
    
    if (isValidExtension && isValidMimeType) {
      cb(null, true);
    } else {
      cb(new Error('Only .sql and .db files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1 // Only allow one file at a time
  }
});


// =============================================================================
// API ROUTES
// =============================================================================

// GET / - API root endpoint (lists key endpoints for discoverability)
router.get('/', (req, res) => {
  res.json({
    message: 'AskDB API is running',
    version: '2.0.0',
    endpoints: {
      // Chat Interface (Requires Authentication)
      'POST /chat': 'Main chat interface - handles everything',
      'GET /chat/history/:id': 'Get conversation history',
      'GET /chat/conversations': 'List user conversations',
      
      // Conversation Management (Requires Authentication)
      'POST /conversations': 'Create new conversation',
      'GET /conversations': 'Get user conversations',
      'GET /conversations/:id': 'Get specific conversation',
      'PUT /conversations/:id': 'Update conversation title',
      'DELETE /conversations/:id': 'Delete conversation',
      
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
      'POST /users/auth/register': 'Register new user',
      'POST /users/auth/login': 'Login user',
      'GET /users/me': 'Get current user profile',
      'PUT /users/me': 'Update current user profile',

      
    }
  });
});

// =============================================================================
// DATABASE MANAGEMENT ROUTES
// =============================================================================

// POST /upload-db - Upload a database file (requires authentication)
router.post('/upload-db', auth, upload.single('file'), databaseController.uploadDatabase);

// GET /databases - Get user's databases (requires authentication)
router.get('/databases', auth, databaseController.getAllDatabases);

// POST /databases - Create a new database (requires authentication)
router.post('/databases', auth, databaseController.createDatabase);

// GET /databases/:id - Get specific database by ID (requires authentication)
router.get('/databases/:id', auth, databaseController.getDatabaseById);

// DELETE /databases/:id - Delete specific database (requires authentication)
router.delete('/databases/:id', auth, databaseController.deleteDatabase);

// GET /databases/:id/schema - Get database schema
router.get('/databases/:id/schema', auth, databaseController.getDatabaseSchema);

// GET /databases/stats - Get database statistics
router.get('/databases/stats', auth, databaseController.getDatabaseStats);

// GET /databases/:id/stats - Get specific database statistics
router.get('/databases/:id/stats', auth, databaseController.getDatabaseStatistics);

// POST /databases/:id/execute - Execute SQL query on specific database
router.post('/databases/:id/execute', auth, databaseController.executeQuery);

// POST /databases/:id/import - Import SQL file into specific database
router.post('/databases/:id/import', auth, databaseController.importSQLFile);

// GET /databases/:id/test - Test database connection
router.get('/databases/:id/test', auth, databaseController.testDatabaseConnection);

// GET /databases/server/list - List all databases on MySQL server
router.get('/databases/server/list', auth, databaseController.listServerDatabases);

// POST /databases/:id/backup - Create backup of specific database
router.post('/databases/:id/backup', auth, databaseController.createBackup);



// =============================================================================
// EXPORT ROUTES
// =============================================================================

// GET /export - Export query results
router.get('/export', exportController.exportResults);


// 


module.exports = router;


