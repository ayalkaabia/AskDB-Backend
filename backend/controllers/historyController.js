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

module.exports = {
  getHistory
};
