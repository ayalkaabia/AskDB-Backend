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
    
    // Validate file type
    if (!fileName.endsWith('.sql') && !fileName.endsWith('.db')) {
      // Delete uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Only .sql and .db files are allowed'
      });
    }

    const result = await databaseService.uploadDatabase(filePath, fileName);
    
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
    const { limit = 50, offset = 0, status } = req.query;
    
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

    const databases = await databaseService.getAllDatabases(limitNum, offsetNum, status);
    
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
    const { name, description, type = 'sqlite', connection_string } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Database name is required'
      });
    }

    const databaseData = {
      name,
      description: description || '',
      type,
      connection_string: connection_string || null
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
      message: 'Failed to create database'
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

module.exports = {
  uploadDatabase,
  getAllDatabases,
  createDatabase,
  getDatabaseById,
  getDatabaseSchema,
  deleteDatabase,
  createBackup,
  getDatabaseStats
};
