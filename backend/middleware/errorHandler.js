const { logError } = require('../utils/logger');

// Standardized error response format
const createErrorResponse = (error, req) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = {
    error: error.name || 'Error',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };
  
  // Include stack trace in development
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }
  
  // Include additional details for specific error types
  if (error.code) {
    response.code = error.code;
  }
  
  if (error.details) {
    response.details = error.details;
  }
  
  return response;
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logError(err, {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    ip: req.ip || req.connection.remoteAddress
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json(createErrorResponse(err, req));
  }
  
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json(createErrorResponse(err, req));
  }
  
  if (err.name === 'ForbiddenError') {
    return res.status(403).json(createErrorResponse(err, req));
  }
  
  if (err.name === 'NotFoundError') {
    return res.status(404).json(createErrorResponse(err, req));
  }
  
  if (err.name === 'ConflictError') {
    return res.status(409).json(createErrorResponse(err, req));
  }
  
  if (err.name === 'TooManyRequestsError') {
    return res.status(429).json(createErrorResponse(err, req));
  }
  
  // Handle database errors
  if (err.code && err.code.startsWith('ER_')) {
    const dbError = {
      name: 'DatabaseError',
      message: 'Database operation failed',
      code: err.code
    };
    return res.status(500).json(createErrorResponse(dbError, req));
  }
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const fileError = {
      name: 'FileSizeError',
      message: 'File too large',
      code: err.code
    };
    return res.status(413).json(createErrorResponse(fileError, req));
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    const fileError = {
      name: 'FileCountError',
      message: 'Too many files',
      code: err.code
    };
    return res.status(413).json(createErrorResponse(fileError, req));
  }
  
  // Default to 500 server error
  const serverError = {
    name: 'InternalServerError',
    message: isDevelopment ? err.message : 'Internal server error'
  };
  
  res.status(500).json(createErrorResponse(serverError, req));
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError
};
