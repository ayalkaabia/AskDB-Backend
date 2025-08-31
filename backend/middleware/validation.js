const validateQuery = (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Prompt is required'
    });
  }

  if (typeof prompt !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Prompt must be a string'
    });
  }

  if (prompt.trim().length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Prompt cannot be empty'
    });
  }

  if (prompt.length > 1000) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Prompt is too long (max 1000 characters)'
    });
  }

  next();
};

const validateSQL = (req, res, next) => {
  const { sql } = req.body;

  if (!sql) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'SQL query is required'
    });
  }

  if (typeof sql !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'SQL query must be a string'
    });
  }

  if (sql.trim().length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'SQL query cannot be empty'
    });
  }

  if (sql.length > 5000) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'SQL query is too long (max 5000 characters)'
    });
  }

  // Basic SQL injection prevention (very basic - in production, use proper SQL parsing)
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
  const upperSQL = sql.toUpperCase();
  
  for (const keyword of dangerousKeywords) {
    if (upperSQL.includes(keyword)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `SQL query contains forbidden keyword: ${keyword}`
      });
    }
  }

  next();
};

module.exports = {
  validateQuery,
  validateSQL
};
