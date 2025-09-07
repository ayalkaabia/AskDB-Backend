const queryRepo = require('../repos/queryRepo');
const databaseRepo = require('../repos/databaseRepo');
const aiService = require('./aiService');
const schemaService = require('./schemaService');

// AI-powered natural language to SQL conversion
const convertToSQL = async (prompt) => {
  try {
    // Check if we have an active database
    const currentDb = await databaseRepo.getCurrentDatabase();
    if (!currentDb) {
      throw new Error('No active database found. Please upload a database first.');
    }

    // Use AI to convert natural language to SQL
    const sqlQuery = await aiService.convertToSQL(prompt);
    return sqlQuery;
    
  } catch (error) {
    console.error('AI conversion error:', error);
    throw new Error(`AI failed to convert prompt to SQL: ${error.message}`);
  }
};

const executeQuery = async (sqlQuery) => {
  try {
    return await queryRepo.executeQuery(sqlQuery);
  } catch (error) {
    console.error('Query execution error:', error);
    throw new Error(`Query execution failed: ${error.message}`);
  }
};

const getTableSchema = async (tableName) => {
  return await queryRepo.getTableSchema(tableName);
};

const getTableNames = async () => {
  return await queryRepo.getTableNames();
};

const testConnection = async () => {
  return await queryRepo.testConnection();
};

// New methods for AI integration
const getDatabaseSchema = async () => {
  try {
    return await schemaService.getCompleteSchema();
  } catch (error) {
    console.error('Error getting database schema:', error);
    throw new Error(`Failed to get database schema: ${error.message}`);
  }
};

const testAIConnection = async () => {
  try {
    return await aiService.testConnection();
  } catch (error) {
    console.error('Error testing AI connection:', error);
    throw new Error(`AI connection test failed: ${error.message}`);
  }
};

const getAIModelInfo = () => {
  return aiService.getModelInfo();
};

module.exports = {
  convertToSQL,
  executeQuery,
  getTableSchema,
  getTableNames,
  testConnection,
  getDatabaseSchema,
  testAIConnection,
  getAIModelInfo
};
