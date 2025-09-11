const queryService = require('../services/queryService');
const historyService = require('../services/historyService');
const databaseService = require('../services/databaseService');

const processQuery = async (req, res) => {
  try {
    const { prompt, database_id } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Prompt is required and must be a non-empty string'
      });
    }

    // Convert natural language to SQL using AI
    const sqlQuery = await queryService.convertToSQL(prompt);

    let results;
    if (database_id) {
      // Execute on specific database
      results = await databaseService.executeQuery(database_id, sqlQuery, [], req.user?.id);
    } else {
      // Execute on default database
      results = await queryService.executeQuery(sqlQuery);
    }

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
      results: results,
      database_id: database_id || null
    });

    res.status(200).json({
      sql: sqlQuery,
      results: results,
      database_id: database_id || null
    });

  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Query execution failed'
    });
  }
};

const runSQL = async (req, res) => {
  try {
    const { sql, database_id, params = [] } = req.body;

    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'SQL query is required and must be a non-empty string'
      });
    }

    let results;
    if (database_id) {
      // Execute on specific database
      results = await databaseService.executeQuery(database_id, sql, params, req.user?.id);
    } else {
      // Execute on default database
      results = await queryService.executeQuery(sql);
    }

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
      results: results,
      database_id: database_id || null
    });

    res.status(200).json({
      results: results,
      database_id: database_id || null
    });

  } catch (error) {
    console.error('SQL execution error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Query execution failed'
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

/**
 * Create database from natural language prompt
 */
const createDatabaseFromPrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Prompt is required and must be a non-empty string'
      });
    }

    // Convert natural language to SQL using AI
    const sqlQuery = await queryService.convertToSQL(prompt);

    // Check if it's a CREATE DATABASE statement
    if (!sqlQuery.toUpperCase().startsWith('CREATE DATABASE')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Prompt must be a database creation request'
      });
    }

    // Extract database name from SQL
    const dbNameMatch = sqlQuery.match(/CREATE DATABASE\s+(?:IF NOT EXISTS\s+)?`?([^`\s]+)`?/i);
    if (!dbNameMatch) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Could not extract database name from SQL'
      });
    }

    const databaseName = dbNameMatch[1];

    // Create the database
    const databaseData = {
      name: databaseName,
      description: `Database created from prompt: ${prompt}`,
      type: 'mysql'
    };

    const newDatabase = await databaseService.createDatabase(databaseData);

    // Store in history
    await historyService.addToHistory({
      prompt: prompt,
      sql: sqlQuery,
      results: { message: 'Database created successfully', database_id: newDatabase.id },
      database_id: newDatabase.id
    });

    res.status(201).json({
      message: 'Database created successfully',
      sql: sqlQuery,
      database: newDatabase
    });

  } catch (error) {
    console.error('Create database from prompt error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to create database from prompt'
    });
  }
};

/**
 * Execute multiple SQL statements
 */
const executeMultipleQueries = async (req, res) => {
  try {
    const { sql_queries, database_id } = req.body;

    if (!sql_queries || !Array.isArray(sql_queries) || sql_queries.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'SQL queries array is required and must not be empty'
      });
    }

    let results;
    if (database_id) {
      // Execute on specific database
      const database = await databaseService.getDatabaseById(database_id, req.user?.id);
      if (!database) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Database not found'
        });
      }

      // Use connection manager for multiple queries
      const databaseConnectionManager = require('../services/databaseConnectionManager');
      results = await databaseConnectionManager.executeMultipleQueries(database.name, sql_queries);
    } else {
      // Execute on default database (one by one)
      results = [];
      for (const sql of sql_queries) {
        const result = await queryService.executeQuery(sql);
        results.push({
          query: sql,
          result: result
        });
      }
    }

    // Store in history
    await historyService.addToHistory({
      prompt: null,
      sql: sql_queries.join('; '),
      results: results,
      database_id: database_id || null
    });

    res.status(200).json({
      results: results,
      database_id: database_id || null
    });

  } catch (error) {
    console.error('Multiple queries execution error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to execute multiple queries'
    });
  }
};

module.exports = {
  processQuery,
  runSQL,
  getDatabaseSchema,
  testAIConnection,
  createDatabaseFromPrompt,
  executeMultipleQueries
};
