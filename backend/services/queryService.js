const queryRepo = require('../repos/queryRepo');
const databaseRepo = require('../repos/databaseRepo');

// Simple natural language to SQL conversion (in production, use AI/ML models)
const convertToSQL = async (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Very basic conversion rules - in production, use proper NLP/AI
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
    return `SELECT * FROM ${firstTable} LIMIT 10;`;
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

module.exports = {
  convertToSQL,
  executeQuery,
  getTableSchema,
  getTableNames,
  testConnection
};
