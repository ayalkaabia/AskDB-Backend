const historyRepo = require('../repos/historyRepo');

const getQueryResults = async (queryId) => {
  const historyEntry = await historyRepo.getHistoryById(queryId);
  return historyEntry ? historyEntry.results : null;
};

const formatData = async (data, format) => {
  if (format.toLowerCase() === 'csv') {
    return convertToCSV(data);
  } else {
    return JSON.stringify(data, null, 2);
  }
};

const convertToCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
};

const exportToFile = async (data, format, filename) => {
  const formattedData = await formatData(data, format);
  
  // In a real implementation, you might save to a file and return a download link
  // For now, we'll just return the formatted data
  return {
    data: formattedData,
    filename: filename,
    format: format,
    size: formattedData.length
  };
};

module.exports = {
  getQueryResults,
  formatData,
  convertToCSV,
  exportToFile
};
