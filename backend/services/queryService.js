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
    
    // Fallback to basic pattern matching if AI fails
    console.log('Falling back to pattern matching...');
    return await fallbackConvertToSQL(prompt);
  }
};

// Fallback pattern matching (kept for reliability)
const fallbackConvertToSQL = async (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Basic conversion rules as fallback
  if (lowerPrompt.includes('top') && lowerPrompt.includes('selling') && lowerPrompt.includes('product')) {
    return "SELECT name, SUM(sales) as total_sales FROM products WHERE year=2025 GROUP BY name ORDER BY SUM(sales) DESC LIMIT 5;";
  }
  
  if (lowerPrompt.includes('list') && lowerPrompt.includes('customer')) {
    return "SELECT * FROM customers;";
  }
  
  if (lowerPrompt.includes('count') && lowerPrompt.includes('order')) {
    return "SELECT COUNT(*) as order_count FROM orders;";
  }
  
  if (lowerPrompt.includes('average') && lowerPrompt.includes('price')) {
    return "SELECT AVG(price) as average_price FROM products;";
  }
  
  if (lowerPrompt.includes('total') && lowerPrompt.includes('revenue')) {
    return "SELECT SUM(amount) as total_revenue FROM sales;";
  }
  
  // Default fallback - try to find a table that might match
  const tables = await queryRepo.getTableNames();
  if (tables.length > 0) {
    const firstTable = tables[0];
    return `SELECT * FROM \`${firstTable}\` LIMIT 10;`;
  }
  
  return null;
};

const executeQuery = async (sqlQuery) => {
  try {
    return await queryRepo.executeQuery(sqlQuery);
  } catch (error) {
    console.error('Query execution error:', error);
    return null;
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
    return null;
  }
};

const testAIConnection = async () => {
  try {
    return await aiService.testConnection();
  } catch (error) {
    console.error('Error testing AI connection:', error);
    return false;
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
