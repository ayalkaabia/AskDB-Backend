const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import logging and error handling
const { addRequestId, requestLogger } = require('./backend/utils/logger');
const { errorHandler } = require('./backend/middleware/errorHandler');

const askRouter = require('./backend/router/AskRouter');
const chatRouter = require('./backend/router/ChatRouter');
const userRouter = require('./backend/router/UserRouter');
const conversationRouter = require('./backend/router/ConversationRouter');
const historyRouter = require('./backend/router/HistoryRouter');
const { testConnection, initializeDatabase } = require('./backend/utils/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Request ID and logging middleware
app.use(addRequestId);
app.use(requestLogger);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/', askRouter);
app.use('/chat', chatRouter);
app.use('/users', userRouter);
app.use('/conversations', conversationRouter);
app.use('/history', historyRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'AskDB API is running' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your database configuration.');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ AskDB API server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
