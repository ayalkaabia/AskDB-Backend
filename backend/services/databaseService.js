const databaseRepo = require('../repos/databaseRepo');

const validateDatabase = async (filePath) => {
  return await databaseRepo.validateDatabaseFile(filePath);
};

const storeDatabaseInfo = async (filePath, fileName) => {
  return await databaseRepo.storeDatabaseInfo(filePath, fileName);
};

const getCurrentDatabase = async () => {
  return await databaseRepo.getCurrentDatabase();
};

const getDatabaseById = async (dbId) => {
  return await databaseRepo.getDatabaseById(dbId);
};

const getAllDatabases = async () => {
  return await databaseRepo.getAllDatabases();
};

const deleteDatabase = async (dbId) => {
  return await databaseRepo.deleteDatabase(dbId);
};

module.exports = {
  validateDatabase,
  storeDatabaseInfo,
  getCurrentDatabase,
  getDatabaseById,
  getAllDatabases,
  deleteDatabase
};
