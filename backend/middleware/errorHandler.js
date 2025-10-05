// Custom error class
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ErrorResponse';

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user.id : 'anonymous'
    });
  } else {
    // In production, log only essential error info
    console.error('Production Error:', {
      name: err.name,
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      statusCode: err.statusCode || 500
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ID format: ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    
    // Extract field name from error for better user experience
    if (err.keyValue) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      
      // Customize message based on field
      switch (field) {
        case 'email':
          message = `An account with email '${value}' already exists`;
          break;
        case 'isbn':
          message = `A book with ISBN '${value}' already exists`;
          break;
        default:
          message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
      }
    }
    
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token. Please login again.';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication token expired. Please login again.';
    error = new ErrorResponse(message, 401);
  }

  // MongoDB connection errors
  if (err.name === 'MongooseServerSelectionError') {
    const message = 'Database connection failed. Please try again later.';
    error = new ErrorResponse(message, 500);
  }

  if (err.name === 'MongoNetworkError') {
    const message = 'Database network error. Please try again later.';
    error = new ErrorResponse(message, 500);
  }

  // Rate limiting errors
  if (err.message && err.message.includes('Too many requests')) {
    error = new ErrorResponse('Too many requests. Please try again later.', 429);
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Please upload a smaller file.';
    error = new ErrorResponse(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file upload error.';
    error = new ErrorResponse(message, 400);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  // Prepare clean error response
  const errorResponse = {
    success: false,
    message
  };

  res.status(statusCode).json(errorResponse);
};

// Async handler wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Handle 404 errors for unmatched routes
const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  const error = new ErrorResponse(message, 404);
  next(error);
};

module.exports = {
  ErrorResponse,
  errorHandler,
  asyncHandler,
  notFound
};
