const Book = require('../models/Book');
const Review = require('../models/Review');
const User = require('../models/User');
const { ErrorResponse, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all books with pagination and filters
// @route   GET /api/books
// @access  Public
exports.getBooks = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = req.pagination;
  const { search, genre, sort } = req.query;

  // Build query object
  let query = { isActive: true };

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Genre filter
  if (genre && genre !== 'all') {
    query.genre = genre;
  }

  // Build sort object
  let sortOption = { createdAt: -1 }; // Default: newest first

  if (sort) {
    switch (sort) {
      case 'title':
        sortOption = { title: 1 };
        break;
      case 'author':
        sortOption = { author: 1 };
        break;
      case 'year':
      case 'newest':
        sortOption = { publishedYear: -1 };
        break;
      case 'oldest':
        sortOption = { publishedYear: 1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1, totalReviews: -1 };
        break;
      case 'created':
        sortOption = { createdAt: -1 };
        break;
      case 'updated':
        sortOption = { updatedAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
  }

  // Execute query with pagination
  const books = await Book.find(query)
    .populate('addedBy', 'name email createdAt')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Book.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    books,
    total,
    totalPages,
    page,
    limit
  });
});

// @desc    Get single book with reviews
// @route   GET /api/books/:id
// @access  Public
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findOne({ _id: req.params.id, isActive: true })
    .populate('addedBy', 'name email createdAt booksCount reviewsCount');

  if (!book) {
    return next(new ErrorResponse(`Book not found with ID of ${req.params.id}`, 404));
  }

  // Get recent reviews for this book
  const recentReviews = await Review.find({ 
    bookId: req.params.id, 
    isActive: true 
  })
    .populate('userId', 'name createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get rating statistics
  const ratingStats = await Review.getRatingStats(req.params.id);

  res.status(200).json({
    success: true,
    book: {
      _id: book._id,
      title: book.title,
      author: book.author,
      description: book.description,
      genre: book.genre,
      publishedYear: book.publishedYear,
      pages: book.pages,
      isbn: book.isbn,
      language: book.language,
      publisher: book.publisher,
      averageRating: book.averageRating,
      totalReviews: book.totalReviews,
      addedBy: book.addedBy && book.addedBy.name ? book.addedBy.name : book.addedBy,
      createdAt: book.createdAt,
      tags: book.tags || []
    }
  });
});

// @desc    Create new book
// @route   POST /api/books
// @access  Private
exports.createBook = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.addedBy = req.user.id;

  const book = await Book.create(req.body);

  // Populate the addedBy field
  await book.populate('addedBy', 'name email');

  // Update user's book count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { booksCount: 1 }
  });

  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    book: {
      id: book._id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      publishedYear: book.publishedYear
    }
  });
});

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
exports.updateBook = asyncHandler(async (req, res, next) => {
  let book = await Book.findOne({ _id: req.params.id, isActive: true });

  if (!book) {
    return next(new ErrorResponse(`Book not found with ID of ${req.params.id}`, 404));
  }

  // Make sure user is book owner or admin
  if (book.addedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this book', 403));
  }

  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('addedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Book updated successfully',
    data: {
      book
    }
  });
});

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findOne({ _id: req.params.id, isActive: true });

  if (!book) {
    return next(new ErrorResponse(`Book not found with ID of ${req.params.id}`, 404));
  }

  // Make sure user is book owner or admin
  if (book.addedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this book', 403));
  }

  // Soft delete: mark as inactive instead of permanently deleting
  await Book.findByIdAndUpdate(req.params.id, { isActive: false });

  // Also soft delete all reviews for this book
  await Review.updateMany(
    { bookId: req.params.id }, 
    { isActive: false }
  );

  // Update user's book count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { booksCount: -1 }
  });

  res.status(200).json({
    success: true,
    message: 'Book and associated reviews deleted successfully',
    data: {}
  });
});

// @desc    Get books by user
// @route   GET /api/books/user/:userId
// @access  Public
exports.getBooksByUser = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = req.pagination;

  // Verify user exists
  const user = await User.findOne({ _id: req.params.userId, isActive: true });
  if (!user) {
    return next(new ErrorResponse(`User not found with ID of ${req.params.userId}`, 404));
  }

  const books = await Book.find({ 
    addedBy: req.params.userId, 
    isActive: true 
  })
    .populate('addedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Book.countDocuments({ 
    addedBy: req.params.userId, 
    isActive: true 
  });
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    count: books.length,
    pagination: {
      page,
      limit,
      totalPages,
      total
    },
    data: {
      books,
      user: {
        id: user._id,
        name: user.name,
        booksCount: user.booksCount,
        reviewsCount: user.reviewsCount,
        joinedDate: user.createdAt
      }
    }
  });
});

// @desc    Get book genres with counts
// @route   GET /api/books/genres
// @access  Public
exports.getGenres = asyncHandler(async (req, res, next) => {
  const allGenres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
    'Thriller', 'Horror', 'Children', 'Young Adult', 'Poetry',
    'Philosophy', 'Psychology', 'Health', 'Travel', 'Cooking',
    'Art', 'Religion', 'Politics', 'Technology', 'Education', 'Other'
  ];

  // Get genre counts from active books
  const genreCounts = await Book.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const genresWithCounts = allGenres.map(genre => {
    const found = genreCounts.find(g => g._id === genre);
    return {
      name: genre,
      count: found ? found.count : 0
    };
  }).sort((a, b) => b.count - a.count);

  const totalBooks = genresWithCounts.reduce((sum, genre) => sum + genre.count, 0);

  res.status(200).json({
    success: true,
    data: {
      genres: genresWithCounts,
      totalBooks
    }
  });
});

// @desc    Get popular books
// @route   GET /api/books/popular
// @access  Public
exports.getPopularBooks = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const books = await Book.findPopular(limit);

  res.status(200).json({
    success: true,
    count: books.length,
    data: {
      books
    }
  });
});

// @desc    Get recent books
// @route   GET /api/books/recent
// @access  Public
exports.getRecentBooks = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const books = await Book.findRecent(limit);

  res.status(200).json({
    success: true,
    count: books.length,
    data: {
      books
    }
  });
});

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
exports.searchBooks = asyncHandler(async (req, res, next) => {
  const { q: query, genre, minRating, maxYear, minYear } = req.query;
  const { page, limit, skip } = req.pagination;

  if (!query || query.length < 1) {
    return next(new ErrorResponse('Search query must be at least 1 character long', 400));
  }

  // Build search query
  let searchQuery = {
    isActive: true,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { author: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  };

  // Additional filters
  if (genre && genre !== 'all') {
    searchQuery.genre = genre;
  }

  if (minRating) {
    searchQuery.averageRating = { $gte: parseFloat(minRating) };
  }

  if (minYear || maxYear) {
    searchQuery.publishedYear = {};
    if (minYear) searchQuery.publishedYear.$gte = parseInt(minYear);
    if (maxYear) searchQuery.publishedYear.$lte = parseInt(maxYear);
  }

  const books = await Book.find(searchQuery)
    .populate('addedBy', 'name')
    .sort({ averageRating: -1, totalReviews: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Book.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    books,
    total,
    totalPages,
    page,
    limit
  });
});
