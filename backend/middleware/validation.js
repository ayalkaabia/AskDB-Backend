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

  if (prompt.length > 2000) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Prompt is too long (max 2000 characters)'
    });
  }

  // Check for potentially malicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /exec\s*\(/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(prompt)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Prompt contains potentially malicious content'
      });
    }
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

  // Enhanced SQL validation - allow DDL/DML operations but check for dangerous patterns
  const dangerousPatterns = [
    'GRANT', 'REVOKE', 'EXECUTE', 'EXEC', 'INTO OUTFILE', 
    'INTO DUMPFILE', 'LOAD_FILE', 'BENCHMARK', 'SLEEP',
    'UNION SELECT', '--', '/*', '*/', 'XP_', 'SP_'
  ];
  
  const upperSQL = sql.toUpperCase();
  
  for (const pattern of dangerousPatterns) {
    if (upperSQL.includes(pattern)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `SQL query contains potentially dangerous pattern: ${pattern}`
      });
    }
  }

  // Ensure it's a valid SQL statement
  const validStarters = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 
    'ALTER', 'TRUNCATE', 'SHOW', 'DESCRIBE', 'EXPLAIN'
  ];
  
  const startsWithValid = validStarters.some(starter => 
    upperSQL.startsWith(starter)
  );
  
  if (!startsWithValid) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'SQL query must start with a valid SQL statement'
    });
  }

  next();
};

// Generic Zod validation middleware factory
// Usage: router.post('/auth/register', validateBody(registerSchema), handler)
const validateBody = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    req.validated = parsed.data;
    return next();
  } catch (e) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
};

module.exports = {
  validateQuery,
  validateSQL,
  validateBody
};
