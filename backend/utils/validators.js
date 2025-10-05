const { body, query, param, validationResult } = require('express-validator');

// Enhanced validation rules for user registration
exports.validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
    .escape(), // Sanitize HTML

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address too long'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Enhanced validation rules for user login
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address too long'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password too long')
];

// Enhanced validation rules for book creation/update
exports.validateBook = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Book title must be between 1 and 200 characters')
    .escape(),

  body('author')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author name must be between 1 and 100 characters')
    .escape(),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .escape(),

  body('genre')
    .isIn([
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
      'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
      'Thriller', 'Horror', 'Children', 'Young Adult', 'Poetry',
      'Philosophy', 'Psychology', 'Health', 'Travel', 'Cooking',
      'Art', 'Religion', 'Politics', 'Technology', 'Education', 'Other'
    ])
    .withMessage('Please select a valid genre'),

  body('publishedYear')
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(`Published year must be between 1000 and ${new Date().getFullYear()}`),

  body('isbn')
    .optional()
    .matches(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/)
    .withMessage('Please provide a valid ISBN format'),

  body('pages')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Pages must be between 1 and 10,000'),

  body('language')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Language cannot exceed 50 characters')
    .escape(),

  body('publisher')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Publisher name cannot exceed 100 characters')
    .escape(),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
    .escape()
];

// Enhanced validation rules for review creation
exports.validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('reviewText')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review text must be between 10 and 1000 characters')
    .escape(),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Review title cannot exceed 100 characters')
    .escape(),

  body('bookId')
    .optional()
    .isMongoId()
    .withMessage('Invalid book ID format'),

  body('readingStatus')
    .optional()
    .isIn(['completed', 'reading', 'want-to-read'])
    .withMessage('Reading status must be completed, reading, or want-to-read'),

  body('spoilerAlert')
    .optional()
    .isBoolean()
    .withMessage('Spoiler alert must be true or false')
];

// Validation rules for review update (without bookId requirement)
exports.validateReviewUpdate = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('reviewText')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review text must be between 10 and 1000 characters')
    .escape(),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Review title cannot exceed 100 characters')
    .escape(),

  body('readingStatus')
    .optional()
    .isIn(['completed', 'reading', 'want-to-read'])
    .withMessage('Reading status must be completed, reading, or want-to-read'),

  body('spoilerAlert')
    .optional()
    .isBoolean()
    .withMessage('Spoiler alert must be true or false')
];

// Validation for user profile update
exports.validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
    .escape(),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address too long')
];

// Validation for password update
exports.validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters'),

  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    })
];

// Enhanced pagination validation
exports.validatePagination = (req, res, next) => {
  const { page = 1, limit = 5, sort, search, genre } = req.query;

  // Validate page
  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive integer'
    });
  }

  // Validate limit
  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be a positive integer between 1 and 50'
    });
  }

  // Validate sort options
  const validSorts = ['title', 'author', 'year', 'rating', 'created', 'updated', 'oldest', 'newest'];
  if (sort && !validSorts.includes(sort)) {
    return res.status(400).json({
      success: false,
      message: `Sort must be one of: ${validSorts.join(', ')}`
    });
  }

  // Validate search length
  if (search && (search.length < 2 || search.length > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be between 2 and 100 characters'
    });
  }

  // Validate genre
  const validGenres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
    'Thriller', 'Horror', 'Children', 'Young Adult', 'Poetry',
    'Philosophy', 'Psychology', 'Health', 'Travel', 'Cooking',
    'Art', 'Religion', 'Politics', 'Technology', 'Education', 'Other'
  ];
  if (genre && genre !== 'all' && !validGenres.includes(genre)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid genre specified'
    });
  }

  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  };

  next();
};

// Validation for MongoDB ObjectId parameters
exports.validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`)
];

// Search validation
exports.validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .escape()
];

// Middleware to handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
      errorCount: errorMessages.length
    });
  }

  next();
};

// Utility function to sanitize user input (enhanced)
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

// Advanced input sanitization for rich text (if needed in future)
exports.sanitizeRichText = (input) => {
  if (typeof input !== 'string') return input;

  // Remove script tags and their content
  input = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  input = input.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
  input = input.replace(/on\w+\s*=\s*'[^']*'/gi, '');
  
  // Remove javascript: protocol
  input = input.replace(/javascript:/gi, '');
  
  return input.trim();
};

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      success: false,
      message: errorMessages.join('. ')
    });
  }
  next();
};

// Rate limiting validation
exports.validateRateLimit = (req, res, next) => {
  // Custom rate limiting logic can be added here
  // For now, just pass through
  next();
};
