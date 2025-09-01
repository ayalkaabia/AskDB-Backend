const historyService = require('../services/historyService');

const getHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // Validate query parameters
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Limit must be a number between 1 and 100'
      });
    }
    
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Offset must be a non-negative number'
      });
    }

    const history = await historyService.getHistory(limitNum, offsetNum);
    
    res.status(200).json(history);

  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve history'
    });
  }
};

const getHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'History ID is required'
      });
    }

    const historyItem = await historyService.getHistoryById(id);
    
    if (!historyItem) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'History item not found'
      });
    }

    res.status(200).json(historyItem);

  } catch (error) {
    console.error('History retrieval by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve history item'
    });
  }
};

const getHistoryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User ID is required'
      });
    }

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Limit must be a number between 1 and 100'
      });
    }
    
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Offset must be a non-negative number'
      });
    }

    const history = await historyService.getHistoryByUserId(userId, limitNum, offsetNum);
    
    res.status(200).json(history);

  } catch (error) {
    console.error('History retrieval by user ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user history'
    });
  }
};

const searchHistory = async (req, res) => {
  try {
    const { q: query, limit = 50, offset = 0 } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Search query is required'
      });
    }

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Limit must be a number between 1 and 100'
      });
    }
    
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Offset must be a non-negative number'
      });
    }

    const results = await historyService.searchHistory(query.trim(), limitNum, offsetNum);
    
    res.status(200).json(results);

  } catch (error) {
    console.error('History search error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search history'
    });
  }
};

const deleteHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'History ID is required'
      });
    }

    const deleted = await historyService.deleteHistoryById(id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'History item not found'
      });
    }

    res.status(200).json({
      message: 'History item deleted successfully',
      id: id
    });

  } catch (error) {
    console.error('History deletion error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete history item'
    });
  }
};

const updateHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, sql_query, results, result_count } = req.body;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'History ID is required'
      });
    }

    if (!prompt && !sql_query && !results && result_count === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'At least one field to update is required'
      });
    }

    const updateData = {};
    if (prompt !== undefined) updateData.prompt = prompt;
    if (sql_query !== undefined) updateData.sql_query = sql_query;
    if (results !== undefined) updateData.results = results;
    if (result_count !== undefined) updateData.result_count = result_count;

    const updated = await historyService.updateHistoryById(id, updateData);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'History item not found'
      });
    }

    res.status(200).json({
      message: 'History item updated successfully',
      id: id,
      updated: updateData
    });

  } catch (error) {
    console.error('History update error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update history item'
    });
  }
};

const getHistoryStats = async (req, res) => {
  try {
    const stats = await historyService.getHistoryStats();
    
    res.status(200).json(stats);

  } catch (error) {
    console.error('History stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve history statistics'
    });
  }
};

module.exports = {
  getHistory,
  getHistoryById,
  getHistoryByUserId,
  searchHistory,
  deleteHistoryById,
  updateHistoryById,
  getHistoryStats
};
