const express = require('express');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getBooksByUser,
  getGenres,
  getPopularBooks,
  getRecentBooks,
  searchBooks
} = require('../controllers/bookController');

const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
  validateBook,
  handleValidationErrors,
  validatePagination,
  validateObjectId,
  validateSearch
} = require('../utils/validators');

const router = express.Router();

// Public routes
router.get('/', validatePagination, getBooks);
router.get('/genres', getGenres);
router.get('/popular', getPopularBooks);
router.get('/recent', getRecentBooks);
router.get('/search', validatePagination, validateSearch, handleValidationErrors, searchBooks);
router.get('/user/:userId', validateObjectId('userId'), handleValidationErrors, validatePagination, getBooksByUser);
router.get('/:id', validateObjectId('id'), handleValidationErrors, optionalAuth, getBook);

// Protected routes - All routes after this middleware are protected
router.use(protect);

router.post('/', validateBook, handleValidationErrors, createBook);
router.put('/:id', validateObjectId('id'), validateBook, handleValidationErrors, updateBook);
router.delete('/:id', validateObjectId('id'), handleValidationErrors, deleteBook);

module.exports = router;
