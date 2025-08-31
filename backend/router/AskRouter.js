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
        file.originalname.endsWith('.db') ||
        file.originalname.endsWith('.sqlite') ||
        file.originalname.endsWith('.sqlite3')) {
      cb(null, true);
    } else {
      cb(new Error('Only .db, .sqlite, and .sqlite3 files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// API Routes

// POST /upload-db - Upload a database file
router.post('/upload-db', upload.single('file'), databaseController.uploadDatabase);

// POST /query - Submit natural language prompt
router.post('/query', validateQuery, queryController.processQuery);

// POST /run-sql - Execute raw SQL query
router.post('/run-sql', validateSQL, queryController.runSQL);

// GET /history - Get query history
router.get('/history', historyController.getHistory);

// GET /export - Export query results
router.get('/export', exportController.exportResults);

module.exports = router;


