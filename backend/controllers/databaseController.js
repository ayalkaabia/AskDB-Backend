const databaseService = require('../services/databaseService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDatabase = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const userId = req.user.id; // From auth middleware
    
    // Validate file type
    if (!fileName.endsWith('.sql') && !fileName.endsWith('.db')) {
      // Delete uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Only .sql and .db files are allowed'
      });
    }

    const result = await databaseService.uploadDatabase(filePath, fileName, userId);
    
    res.status(200).json({
      message: 'Database uploaded successfully',
      db_name: fileName,
      db_id: result.id,
      file_size: req.file.size,
      upload_time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to upload database'
    });
  }
};

const getAllDatabases = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.id; // From auth middleware
    
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

    const databases = await databaseService.getUserDatabases(userId, limitNum, offsetNum);
    
    res.status(200).json(databases);

  } catch (error) {
    console.error('Get all databases error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve databases'
    });
  }
};

const createDatabase = async (req, res) => {
  try {
    const { name, description, type = 'mysql', charset, collation } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database name is required'
      });
    }

    // Validate database name
    if (!/^[a-zA-Z_][a-zA-Z0-9_$]*$/.test(name)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database name must start with a letter or underscore and contain only alphanumeric characters, underscores, and dollar signs'
      });
    }

    const databaseData = {
      name,
      description: description || '',
      type,
      charset: charset || 'utf8mb4',
      collation: collation || 'utf8mb4_unicode_ci'
    };

    const newDatabase = await databaseService.createDatabase(databaseData);
    
    res.status(201).json({
      message: 'Database created successfully',
      database: newDatabase
    });

  } catch (error) {
    console.error('Create database error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to create database'
    });
  }
};

const getDatabaseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database ID is required'
      });
    }

    const database = await databaseService.getDatabaseById(id);
    
    if (!database) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Database not found'
      });
    }

    res.status(200).json(database);

  } catch (error) {
    console.error('Get database by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve database'
    });
  }
};

const getDatabaseSchema = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database ID is required'
      });
    }

    const schema = await databaseService.getDatabaseSchema(id);
    
    if (!schema) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Database not found or schema could not be retrieved'
      });
    }

    res.status(200).json(schema);

  } catch (error) {
    console.error('Get database schema error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve database schema'
    });
  }
};

const deleteDatabase = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database ID is required'
      });
    }

    // Check if database exists
    const existingDatabase = await databaseService.getDatabaseById(id);
    if (!existingDatabase) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Database not found'
      });
    }

    const deleted = await databaseService.deleteDatabase(id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Database not found'
      });
    }

    res.status(200).json({
      message: 'Database deleted successfully',
      id: id
    });

  } catch (error) {
    console.error('Delete database error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete database'
    });
  }
};

const createBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const { backup_name, description } = req.body;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database ID is required'
      });
    }

    // Check if database exists
    const existingDatabase = await databaseService.getDatabaseById(id);
    if (!existingDatabase) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Database not found'
      });
    }

    const backupData = {
      database_id: id,
      name: backup_name || `backup_${Date.now()}`,
      description: description || ''
    };

    const backup = await databaseService.createBackup(backupData);
    
    res.status(201).json({
      message: 'Backup created successfully',
      backup: backup
    });

  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create backup'
    });
  }
};

const getDatabaseStats = async (req, res) => {
  try {
    const stats = await databaseService.getDatabaseStats();
    
    res.status(200).json(stats);

  } catch (error) {
    console.error('Get database stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve database statistics'
    });
  }
};

/**
 * Execute SQL query on a specific database
 */
const executeQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { sql_query, params = [] } = req.body;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database ID is required'
      });
    }

    if (!sql_query) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'SQL query is required'
      });
    }

    const result = await databaseService.executeQuery(id, sql_query, params);
    
    res.status(200).json({
      message: 'Query executed successfully',
      result: result
    });

  } catch (error) {
    console.error('Execute query error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to execute query'
    });
  }
};

/**
 * Import SQL file into a database
 */
const importSQLFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { sql_content } = req.body;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database ID is required'
      });
    }

    if (!sql_content) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'SQL content is required'
      });
    }

    const result = await databaseService.importSQLFile(id, sql_content);
    
    res.status(200).json({
      message: 'SQL file imported successfully',
      result: result
    });

  } catch (error) {
    console.error('Import SQL file error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to import SQL file'
    });
  }
};

/**
 * Get database statistics
 */
const getDatabaseStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database ID is required'
      });
    }

    const stats = await databaseService.getDatabaseStatistics(id);
    
    res.status(200).json(stats);

  } catch (error) {
    console.error('Get database statistics error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to retrieve database statistics'
    });
  }
};

/**
 * Test database connection
 */
const testDatabaseConnection = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database ID is required'
      });
    }

    const isConnected = await databaseService.testDatabaseConnection(id);
    
    res.status(200).json({
      message: isConnected ? 'Database connection successful' : 'Database connection failed',
      connected: isConnected
    });

  } catch (error) {
    console.error('Test database connection error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to test database connection'
    });
  }
};

/**
 * List all databases on the MySQL server
 */
const listServerDatabases = async (req, res) => {
  try {
    const databases = await databaseService.listServerDatabases();
    
    res.status(200).json({
      message: 'Server databases retrieved successfully',
      databases: databases
    });

  } catch (error) {
    console.error('List server databases error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to list server databases'
    });
  }
};

module.exports = {
  uploadDatabase,
  getAllDatabases,
  createDatabase,
  getDatabaseById,
  getDatabaseSchema,
  deleteDatabase,
  createBackup,
  getDatabaseStats,
  executeQuery,
  importSQLFile,
  getDatabaseStatistics,
  testDatabaseConnection,
  listServerDatabases
};
