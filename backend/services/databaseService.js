const databaseRepo = require('../repos/databaseRepo');
const databaseConnectionManager = require('./databaseConnectionManager');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
  try {
    // If it's a new database creation request
    if (databaseData.name && !databaseData.file_path) {
      // Create the actual MySQL database
      const dbInfo = await databaseConnectionManager.createDatabase(
        databaseData.name, 
        {
          charset: databaseData.charset || 'utf8mb4',
          collation: databaseData.collation || 'utf8mb4_unicode_ci'
        }
      );

      // Store database info in our metadata table
      const storedDbInfo = await databaseRepo.createDatabase({
        id: dbInfo.id,
        name: dbInfo.name,
        description: databaseData.description || '',
        type: 'mysql',
        status: 'active',
        connection_string: null,
        file_path: null,
        file_size: null
      });

      return storedDbInfo;
    } else {
      // Handle file-based database creation
      return await databaseRepo.createDatabase(databaseData);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
};

const getDatabaseById = async (id) => {
  return await databaseRepo.getDatabaseById(id);
};

const getDatabaseSchema = async (id) => {
  try {
    const database = await databaseRepo.getDatabaseById(id);
    if (!database) {
      return null;
    }
    
    // If it's a MySQL database, get real schema
    if (database.type === 'mysql') {
      const schema = await databaseConnectionManager.getDatabaseSchema(database.name);
      return {
        database_id: id,
        database_name: database.name,
        ...schema,
        extracted_at: new Date().toISOString()
      };
    }
    
    // For other database types, return basic info
    return {
      database_id: id,
      database_name: database.name,
      type: database.type,
      status: database.status,
      extracted_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting database schema:', error);
    throw error;
  }
};

const deleteDatabase = async (id) => {
  try {
    const database = await databaseRepo.getDatabaseById(id);
    if (!database) {
      return false;
    }
    
    // If it's a MySQL database, drop it from MySQL server
    if (database.type === 'mysql') {
      await databaseConnectionManager.dropDatabase(database.name);
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
  } catch (error) {
    console.error('Error deleting database:', error);
    throw error;
  }
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

/**
 * Execute SQL query on a specific database
 */
const executeQuery = async (databaseId, sqlQuery, params = []) => {
  try {
    const database = await databaseRepo.getDatabaseById(databaseId);
    if (!database) {
      throw new Error('Database not found');
    }

    if (database.type === 'mysql') {
      return await databaseConnectionManager.executeQuery(database.name, sqlQuery, params);
    } else {
      throw new Error('Query execution not supported for this database type');
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

/**
 * Import SQL file into a database
 */
const importSQLFile = async (databaseId, sqlContent) => {
  try {
    const database = await databaseRepo.getDatabaseById(databaseId);
    if (!database) {
      throw new Error('Database not found');
    }

    if (database.type === 'mysql') {
      return await databaseConnectionManager.importSQLFile(database.name, sqlContent);
    } else {
      throw new Error('SQL import not supported for this database type');
    }
  } catch (error) {
    console.error('Error importing SQL file:', error);
    throw error;
  }
};

/**
 * Get database statistics
 */
const getDatabaseStatistics = async (databaseId) => {
  try {
    const database = await databaseRepo.getDatabaseById(databaseId);
    if (!database) {
      throw new Error('Database not found');
    }

    if (database.type === 'mysql') {
      return await databaseConnectionManager.getDatabaseStats(database.name);
    } else {
      return {
        database_name: database.name,
        type: database.type,
        status: database.status,
        last_checked: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Error getting database statistics:', error);
    throw error;
  }
};

/**
 * Test database connection
 */
const testDatabaseConnection = async (databaseId) => {
  try {
    const database = await databaseRepo.getDatabaseById(databaseId);
    if (!database) {
      throw new Error('Database not found');
    }

    if (database.type === 'mysql') {
      return await databaseConnectionManager.testConnection(database.name);
    } else {
      return true; // Assume file-based databases are always accessible
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
    return false;
  }
};

/**
 * List all databases on the MySQL server
 */
const listServerDatabases = async () => {
  try {
    return await databaseConnectionManager.listDatabases();
  } catch (error) {
    console.error('Error listing server databases:', error);
    throw error;
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
