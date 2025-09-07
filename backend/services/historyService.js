const historyRepo = require('../repos/historyRepo');

const addToHistory = async (queryData) => {
  return await historyRepo.addToHistory(queryData);
};

const getHistory = async (limit = 50, offset = 0) => {
  return await historyRepo.getHistory(limit, offset);
};

const getHistoryById = async (id) => {
  return await historyRepo.getHistoryById(id);
};


const searchHistory = async (query, limit = 50, offset = 0) => {
  return await historyRepo.searchHistory(query, limit, offset);
};

const deleteHistoryById = async (id) => {
  return await historyRepo.deleteHistoryById(id);
};

const updateHistoryById = async (id, updateData) => {
  return await historyRepo.updateHistoryById(id, updateData);
};

const clearHistory = async () => {
  return await historyRepo.clearHistory();
};

const getHistoryStats = async () => {
  return await historyRepo.getHistoryStats();
};

module.exports = {
  addToHistory,
  getHistory,
  getHistoryById,
  searchHistory,
  deleteHistoryById,
  updateHistoryById,
  clearHistory,
  getHistoryStats
};
