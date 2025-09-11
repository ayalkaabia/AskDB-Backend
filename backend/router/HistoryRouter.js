const express = require('express');
const router = express.Router();

// Import controllers
const historyController = require('../controllers/historyController');

// =============================================================================
// HISTORY MANAGEMENT ROUTES
// =============================================================================

// GET /history - Get query history
router.get('/', historyController.getHistory);

// GET /history/:id - Get specific history item by ID
router.get('/:id', historyController.getHistoryById);

// GET /history/search - Search history by keyword
router.get('/search', historyController.searchHistory);

// GET /history/stats - Get history statistics
router.get('/stats', historyController.getHistoryStats);

// DELETE /history/:id - Delete specific history item
router.delete('/:id', historyController.deleteHistoryById);

// PUT /history/:id - Update specific history item
router.put('/:id', historyController.updateHistoryById);

module.exports = router;
