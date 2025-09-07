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


// Import middleware
const { validateQuery, validateSQL } = require('../middleware/validation');
const { uploadMiddleware } = require('../middleware/upload');

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
        file.originalname.endsWith('.sql')) {
      cb(null, true);
    } else {
      cb(new Error('Only .sql files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// API Routes

// GET / - API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'AskDB API is running',
    version: '1.0.0',
    endpoints: {
      'POST /upload-db': 'Upload a database file',
      'POST /query': 'Submit natural language query',
      'POST /run-sql': 'Execute raw SQL query',
      'GET /schema': 'Get current database schema',
      'GET /test-ai': 'Test AI connection',
      'GET /history': 'Get query history',
      'GET /export': 'Export query results'
    }
  });
});

// POST /upload-db - Upload a database file
router.post('/upload-db', upload.single('file'), databaseController.uploadDatabase);

// GET /databases - Get all databases
router.get('/databases', databaseController.getAllDatabases);

// POST /databases - Create a new database
router.post('/databases', databaseController.createDatabase);

// GET /databases/:id - Get specific database by ID
router.get('/databases/:id', databaseController.getDatabaseById);

// GET /databases/:id/schema - Get database schema
router.get('/databases/:id/schema', databaseController.getDatabaseSchema);

// DELETE /databases/:id - Delete specific database
router.delete('/databases/:id', databaseController.deleteDatabase);

// POST /databases/:id/backup - Create backup of specific database
router.post('/databases/:id/backup', databaseController.createBackup);

// GET /databases/stats - Get database statistics
router.get('/databases/stats', databaseController.getDatabaseStats);

// POST /query - Submit natural language prompt
router.post('/query', validateQuery, queryController.processQuery);

// POST /run-sql - Execute raw SQL query
router.post('/run-sql', validateSQL, queryController.runSQL);

// GET /schema - Get current database schema
router.get('/schema', queryController.getDatabaseSchema);

// GET /test-ai - Test AI connection
router.get('/test-ai', queryController.testAIConnection);

// GET /history - Get query history
router.get('/history', historyController.getHistory);

// GET /history/:id - Get specific history item by ID
router.get('/history/:id', historyController.getHistoryById);


// GET /history/search - Search history by keyword
router.get('/history/search', historyController.searchHistory);

// DELETE /history/:id - Delete specific history item
router.delete('/history/:id', historyController.deleteHistoryById);

// PUT /history/:id - Update specific history item
router.put('/history/:id', historyController.updateHistoryById);

// GET /history/stats - Get history statistics
router.get('/history/stats', historyController.getHistoryStats);

// GET /export - Export query results
router.get('/export', exportController.exportResults);


module.exports = router;


