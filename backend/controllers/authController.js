const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');
const { sendTokenResponse, clearTokenCookie } = require('../utils/generateToken');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User with this email already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  // Send token response
  sendTokenResponse(user, 201, res, 'User registered successfully! Welcome to Logiksutra Book Review Platform.');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email, isActive: true }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  // Send token response
  sendTokenResponse(user, 200, res, `Welcome back, ${user.name}!`);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {};

  // Only update fields that are provided
  if (req.body.name) fieldsToUpdate.name = req.body.name;
  if (req.body.email) fieldsToUpdate.email = req.body.email;

  // Check if email is being changed and if it already exists
  if (req.body.email && req.body.email !== req.user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  clearTokenCookie(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get user statistics
// @route   GET /api/auth/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res, next) => {
  const Book = require('../models/Book');
  const Review = require('../models/Review');

  // Get user's books count
  const booksCount = await Book.countDocuments({ 
    addedBy: req.user.id, 
    isActive: true 
  });

  // Get user's reviews count
  const reviewsCount = await Review.countDocuments({ 
    userId: req.user.id, 
    isActive: true 
  });

  // Get average rating given by user
  const userRatingStats = await Review.aggregate([
    { $match: { userId: req.user._id, isActive: true } },
    {
      $group: {
        _id: null,
        averageRatingGiven: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: { $push: '$rating' }
      }
    }
  ]);

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let averageRatingGiven = 0;

  if (userRatingStats.length > 0) {
    averageRatingGiven = Math.round(userRatingStats[0].averageRatingGiven * 10) / 10;
    userRatingStats[0].ratingDistribution.forEach(rating => {
      ratingDistribution[rating]++;
    });
  }

  // Update user's cached counts
  await User.findByIdAndUpdate(req.user.id, {
    booksCount,
    reviewsCount
  });

  res.status(200).json({
    success: true,
    stats: {
      books: booksCount,
      reviews: reviewsCount,
      averageRating: averageRatingGiven,
      memberSince: req.user.createdAt
    }
  });
});
