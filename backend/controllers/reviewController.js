const Review = require('../models/Review');
const Book = require('../models/Book');
const User = require('../models/User');
const { ErrorResponse, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all reviews for a book
// @route   GET /api/reviews/book/:bookId
// @access  Public
exports.getReviewsForBook = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = req.pagination;
  const { sort } = req.query;

  // Check if book exists and is active
  const book = await Book.findOne({ _id: req.params.bookId, isActive: true });
  if (!book) {
    return next(new ErrorResponse(`Book not found with ID of ${req.params.bookId}`, 404));
  }

  // Build sort option
  let sortOption = { createdAt: -1 }; // Default: newest first
  if (sort === 'helpful') {
    sortOption = { isHelpful: -1, createdAt: -1 };
  } else if (sort === 'rating-high') {
    sortOption = { rating: -1, createdAt: -1 };
  } else if (sort === 'rating-low') {
    sortOption = { rating: 1, createdAt: -1 };
  } else if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  }

  const reviews = await Review.find({ 
    bookId: req.params.bookId, 
    isActive: true 
  })
    .populate('userId', 'name createdAt reviewsCount')
    .populate('bookId', 'title author')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ 
    bookId: req.params.bookId, 
    isActive: true 
  });
  const totalPages = Math.ceil(total / limit);

  // Get rating statistics
  const ratingStats = await Review.getRatingStats(req.params.bookId);

  res.status(200).json({
    success: true,
    count: reviews.length,
    pagination: {
      page,
      limit,
      totalPages,
      total
    },
    data: {
      reviews,
      book: {
        id: book._id,
        title: book.title,
        author: book.author,
        averageRating: book.averageRating,
        totalReviews: book.totalReviews
      },
      ratingStats
    }
  });
});

// @desc    Get all reviews by a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getReviewsByUser = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = req.pagination;

  // Verify user exists and is active
  const user = await User.findOne({ _id: req.params.userId, isActive: true });
  if (!user) {
    return next(new ErrorResponse(`User not found with ID of ${req.params.userId}`, 404));
  }

  const reviews = await Review.find({ 
    userId: req.params.userId, 
    isActive: true 
  })
    .populate('userId', 'name createdAt')
    .populate('bookId', 'title author averageRating')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ 
    userId: req.params.userId, 
    isActive: true 
  });
  const totalPages = Math.ceil(total / limit);

  // Get user's rating statistics
  const userRatingStats = await Review.aggregate([
    { $match: { userId: user._id, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: { $push: '$rating' }
      }
    }
  ]);

  let avgRating = 0;
  let ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (userRatingStats.length > 0) {
    avgRating = Math.round(userRatingStats[0].averageRating * 10) / 10;
    userRatingStats[0].ratingDistribution.forEach(rating => {
      ratingDist[rating]++;
    });
  }

  res.status(200).json({
    success: true,
    count: reviews.length,
    pagination: {
      page,
      limit,
      totalPages,
      total
    },
    data: {
      reviews,
      user: {
        id: user._id,
        name: user.name,
        reviewsCount: user.reviewsCount,
        averageRatingGiven: avgRating,
        ratingDistribution: ratingDist,
        joinedDate: user.createdAt
      }
    }
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({ 
    _id: req.params.id, 
    isActive: true 
  })
    .populate('userId', 'name email createdAt reviewsCount')
    .populate('bookId', 'title author description averageRating totalReviews');

  if (!review) {
    return next(new ErrorResponse(`Review not found with ID of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: {
      review
    }
  });
});

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const { bookId, rating, reviewText, title, readingStatus, spoilerAlert } = req.body;

  // Check if book exists and is active
  const book = await Book.findOne({ _id: bookId, isActive: true });
  if (!book) {
    return next(new ErrorResponse(`Book not found with ID of ${bookId}`, 404));
  }

  // Check if user already reviewed this book
  const existingReview = await Review.findOne({
    bookId,
    userId: req.user.id,
    isActive: true
  });

  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this book. You can update your existing review instead.', 400));
  }

  // Create review
  const review = await Review.create({
    bookId,
    userId: req.user.id,
    rating,
    reviewText,
    title,
    readingStatus: readingStatus || 'completed',
    spoilerAlert: spoilerAlert || false
  });

  // Populate the created review
  await review.populate([
    { path: 'userId', select: 'name' },
    { path: 'bookId', select: 'title author' }
  ]);

  // Update user's review count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { reviewsCount: 1 }
  });

  res.status(201).json({
    success: true,
    message: 'Review created successfully! Thank you for sharing your thoughts.',
    data: {
      review
    }
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findOne({ 
    _id: req.params.id, 
    isActive: true 
  });

  if (!review) {
    return next(new ErrorResponse(`Review not found with ID of ${req.params.id}`, 404));
  }

  // Make sure user is review owner or admin
  if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this review', 403));
  }

  // Update allowed fields
  const allowedFields = ['rating', 'reviewText', 'title', 'readingStatus', 'spoilerAlert'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  review = await Review.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'userId', select: 'name' },
    { path: 'bookId', select: 'title author' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: {
      review
    }
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({ 
    _id: req.params.id, 
    isActive: true 
  });

  if (!review) {
    return next(new ErrorResponse(`Review not found with ID of ${req.params.id}`, 404));
  }

  // Make sure user is review owner or admin
  if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 403));
  }

  // Soft delete: mark as inactive
  await Review.findByIdAndUpdate(req.params.id, { isActive: false });

  // Update user's review count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { reviewsCount: -1 }
  });

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
    data: {}
  });
});

// @desc    Get average rating for a book
// @route   GET /api/reviews/average/:bookId
// @access  Public
exports.getAverageRating = asyncHandler(async (req, res, next) => {
  // Check if book exists and is active
  const book = await Book.findOne({ _id: req.params.bookId, isActive: true });
  if (!book) {
    return next(new ErrorResponse(`Book not found with ID of ${req.params.bookId}`, 404));
  }

  const stats = await Review.getRatingStats(req.params.bookId);

  res.status(200).json({
    success: true,
    data: {
      bookId: req.params.bookId,
      ...stats
    }
  });
});

// @desc    Get my reviews
// @route   GET /api/reviews/my
// @access  Private
exports.getMyReviews = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = req.pagination;
  const { sort } = req.query;

  let sortOption = { createdAt: -1 };
  if (sort === 'rating-high') {
    sortOption = { rating: -1, createdAt: -1 };
  } else if (sort === 'rating-low') {
    sortOption = { rating: 1, createdAt: -1 };
  } else if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  }

  const reviews = await Review.find({ 
    userId: req.user.id, 
    isActive: true 
  })
    .populate('bookId', 'title author description averageRating totalReviews')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ 
    userId: req.user.id, 
    isActive: true 
  });
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    count: reviews.length,
    pagination: {
      page,
      limit,
      totalPages,
      total
    },
    data: {
      reviews
    }
  });
});

// @desc    Check if user has reviewed a book
// @route   GET /api/reviews/check/:bookId
// @access  Private
exports.checkUserReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({
    bookId: req.params.bookId,
    userId: req.user.id,
    isActive: true
  }).populate('bookId', 'title author');

  res.status(200).json({
    success: true,
    data: {
      hasReviewed: !!review,
      review: review || null
    }
  });
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({ 
    _id: req.params.id, 
    isActive: true 
  });

  if (!review) {
    return next(new ErrorResponse(`Review not found with ID of ${req.params.id}`, 404));
  }

  // Users can't mark their own reviews as helpful
  if (review.userId.toString() === req.user.id) {
    return next(new ErrorResponse('You cannot mark your own review as helpful', 400));
  }

  await review.markHelpful();

  res.status(200).json({
    success: true,
    message: 'Review marked as helpful',
    data: {
      helpfulVotes: review.isHelpful
    }
  });
});

// @desc    Get helpful reviews for a book
// @route   GET /api/reviews/helpful/:bookId
// @access  Public
exports.getHelpfulReviews = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;

  const reviews = await Review.findHelpful(req.params.bookId, limit);

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: {
      reviews
    }
  });
});
