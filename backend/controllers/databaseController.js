const path = require('path');
const fs = require('fs');
const databaseService = require('../services/databaseService');

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

    // Validate that the file is a valid SQLite database
    const isValidDatabase = await databaseService.validateDatabase(filePath);
    if (!isValidDatabase) {
      // Clean up invalid file
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Invalid database file format' 
      });
    }

    // Store database information
    const dbInfo = await databaseService.storeDatabaseInfo(filePath, fileName);

    res.status(200).json({
      message: 'Database uploaded successfully',
      db_name: fileName,
      db_id: dbInfo.id
    });

  } catch (error) {
    console.error('Database upload error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Upload failed' 
    });
  }
};

module.exports = {
  uploadDatabase
};
