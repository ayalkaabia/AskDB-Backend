const queryService = require('../services/queryService');
const historyService = require('../services/historyService');

const processQuery = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Prompt is required and must be a non-empty string'
      });
    }

    // Convert natural language to SQL
    const sqlQuery = await queryService.convertToSQL(prompt);
    if (!sqlQuery) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot convert prompt to SQL'
      });
    }

    // Execute the SQL query
    const results = await queryService.executeQuery(sqlQuery);
    if (!results) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Query execution failed'
      });
    }

    // Store in history
    await historyService.addToHistory({
      prompt: prompt,
      sql: sqlQuery,
      results: results
    });

    res.status(200).json({
      sql: sqlQuery,
      results: results
    });

  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Query execution failed'
    });
  }
};

const runSQL = async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'SQL query is required and must be a non-empty string'
      });
    }

    // Execute the raw SQL query
    const results = await queryService.executeQuery(sql);
    if (!results) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Query execution failed'
      });
    }

    // Store in history
    await historyService.addToHistory({
      prompt: null,
      sql: sql,
      results: results
    });

    res.status(200).json({
      results: results
    });

  } catch (error) {
    console.error('SQL execution error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Query execution failed'
    });
  }
};

// New AI-related controller methods
const getDatabaseSchema = async (req, res) => {
  try {
    const schema = await queryService.getDatabaseSchema();
    if (!schema) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No database schema found. Please upload a database first.'
      });
    }

    res.status(200).json({
      schema: schema
    });

  } catch (error) {
    console.error('Schema retrieval error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve database schema'
    });
  }
};

const testAIConnection = async (req, res) => {
  try {
    const isConnected = await queryService.testAIConnection();
    const modelInfo = queryService.getAIModelInfo();

    res.status(200).json({
      ai_connected: isConnected,
      model_info: modelInfo
    });

  } catch (error) {
    console.error('AI connection test error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to test AI connection'
    });
  }
};

module.exports = {
  processQuery,
  runSQL,
  getDatabaseSchema,
  testAIConnection
};
