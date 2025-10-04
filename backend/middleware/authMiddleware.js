const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ErrorResponse } = require('./errorHandler');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies (if using cookie authentication)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return next(new ErrorResponse('Access denied. No token provided. Please login to access this resource.', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database and check if user is active
      const user = await User.findById(decoded.id).select('+isActive');

      if (!user) {
        return next(new ErrorResponse('User not found. Please login again.', 401));
      }

      if (!user.isActive) {
        return next(new ErrorResponse('Account deactivated. Please contact support.', 401));
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new ErrorResponse('Token expired. Please login again.', 401));
      } else if (error.name === 'JsonWebTokenError') {
        return next(new ErrorResponse('Invalid token. Please login again.', 401));
      } else {
        return next(new ErrorResponse('Token verification failed. Please login again.', 401));
      }
    }
  } catch (error) {
    return next(new ErrorResponse('Server error in authentication middleware', 500));
  }
};

// Optional authentication - doesn't block if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.id).select('+isActive');

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Invalid token, but don't block the request
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    // Don't throw error, just continue without authentication
    next();
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Access denied. Please login first.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role '${req.user.role}' is not authorized to access this resource`, 403));
    }

    next();
  };
};

// Check if user owns the resource
exports.checkOwnership = (Model, resourceIdParam = 'id', ownerField = 'addedBy') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return next(new ErrorResponse(`Resource not found with ID of ${resourceId}`, 404));
      }

      // Check if user is owner or admin
      if (resource[ownerField].toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Access denied. You can only access your own resources.', 403));
      }

      // Attach resource to request for use in controller
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting for specific actions
exports.createRateLimit = (windowMs = 15 * 60 * 1000, max = 5, message = 'Too many requests') => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for admin users
      return req.user && req.user.role === 'admin';
    }
  });
};

// Middleware to log API usage
exports.logApiUsage = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user ? req.user.id : 'anonymous',
      timestamp: new Date().toISOString()
    };
    
    // Only log in development or if specifically enabled
    if (process.env.NODE_ENV === 'development' || process.env.LOG_API_USAGE === 'true') {
      console.log('API Usage:', logData);
    }
  });
  
  next();
};
