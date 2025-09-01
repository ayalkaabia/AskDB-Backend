const databaseRepo = require('../repos/databaseRepo');
const fs = require('fs');
const path = require('path');

const uploadDatabase = async (filePath, fileName) => {
  try {
    // Store database information
    const dbInfo = await databaseRepo.storeDatabaseInfo(filePath, fileName);
    
    // Move file to permanent location
    const uploadsDir = path.join(__dirname, '../../uploads');
    const permanentPath = path.join(uploadsDir, `${dbInfo.id}_${fileName}`);
    
    fs.renameSync(filePath, permanentPath);
    
    // Update database record with permanent path
    await databaseRepo.updateDatabasePath(dbInfo.id, permanentPath);
    
    return dbInfo;
  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

const getAllDatabases = async (limit = 50, offset = 0, status = null) => {
  return await databaseRepo.getAllDatabases(limit, offset, status);
};

const createDatabase = async (databaseData) => {
  return await databaseRepo.createDatabase(databaseData);
};

const getDatabaseById = async (id) => {
  return await databaseRepo.getDatabaseById(id);
};

const getDatabaseSchema = async (id) => {
  const database = await databaseRepo.getDatabaseById(id);
  if (!database) {
    return null;
  }
  
  // This would typically connect to the actual database and extract schema
  // For now, we'll return a mock schema structure
  return {
    database_id: id,
    database_name: database.name,
    tables: [
      {
        name: 'example_table',
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false, primary_key: true },
          { name: 'name', type: 'VARCHAR(255)', nullable: true },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false }
        ]
      }
    ],
    extracted_at: new Date().toISOString()
  };
};

const deleteDatabase = async (id) => {
  const database = await databaseRepo.getDatabaseById(id);
  if (!database) {
    return false;
  }
  
  // Delete physical file if it exists
  if (database.file_path && fs.existsSync(database.file_path)) {
    try {
      fs.unlinkSync(database.file_path);
    } catch (error) {
      console.error('Failed to delete database file:', error);
    }
  }
  
  return await databaseRepo.deleteDatabase(id);
};

const createBackup = async (backupData) => {
  const database = await databaseRepo.getDatabaseById(backupData.database_id);
  if (!database) {
    throw new Error('Database not found');
  }
  
  // Create backup file
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupFileName = `${backupData.name}_${Date.now()}.sql`;
  const backupPath = path.join(backupDir, backupFileName);
  
  // For now, we'll create a simple backup file
  // In a real implementation, this would dump the actual database
  const backupContent = `-- Backup of database: ${database.name}\n-- Created: ${new Date().toISOString()}\n-- Description: ${backupData.description}\n\n`;
  fs.writeFileSync(backupPath, backupContent);
  
  // Store backup information
  const backupInfo = {
    ...backupData,
    file_path: backupPath,
    file_size: fs.statSync(backupPath).size,
    created_at: new Date().toISOString()
  };
  
  return await databaseRepo.createBackup(backupInfo);
};

const getDatabaseStats = async () => {
  return await databaseRepo.getDatabaseStats();
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
