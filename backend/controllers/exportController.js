const exportService = require('../services/exportService');

const exportResults = async (req, res) => {
  try {
    const { format = 'json', query_id } = req.query;

    // Validate format parameter
    if (!['json', 'csv'].includes(format.toLowerCase())) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Format must be either "json" or "csv"'
      });
    }

    // If query_id is provided, export specific query results
    if (query_id) {
      const results = await exportService.getQueryResults(query_id);
      if (!results) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Query not found'
        });
      }

      const exportedData = await exportService.formatData(results, format);
      
      // Set appropriate headers
      if (format.toLowerCase() === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="query_results_${query_id}.csv"`);
      } else {
        res.setHeader('Content-Type', 'application/json');
      }

      res.status(200).send(exportedData);
      return;
    }

    // If no query_id, export the most recent results (stored in session/memory)
    // This is a simplified implementation - in a real app, you might store recent results in session
    res.status(400).json({
      error: 'Bad Request',
      message: 'query_id parameter is required for export'
    });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Export failed'
    });
  }
};

module.exports = {
  exportResults
};
