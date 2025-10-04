const express = require('express');
const { body } = require('express-validator');
const {
  getReviewsForBook,
  getReviewsByUser,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getAverageRating,
  getMyReviews,
  checkUserReview,
  markHelpful,
  getHelpfulReviews
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');
const {
  validateReview,
  validateReviewUpdate,
  handleValidationErrors,
  validatePagination,
  validateObjectId
} = require('../utils/validators');

const router = express.Router();

// Public routes
router.get('/book/:bookId', validateObjectId('bookId'), handleValidationErrors, validatePagination, getReviewsForBook);
router.get('/user/:userId', validateObjectId('userId'), handleValidationErrors, validatePagination, getReviewsByUser);
router.get('/average/:bookId', validateObjectId('bookId'), handleValidationErrors, getAverageRating);
router.get('/helpful/:bookId', validateObjectId('bookId'), handleValidationErrors, getHelpfulReviews);
router.get('/:id', validateObjectId('id'), handleValidationErrors, getReview);

// Protected routes - All routes after this middleware are protected
router.use(protect);

router.get('/my/reviews', validatePagination, getMyReviews);
router.get('/check/:bookId', validateObjectId('bookId'), handleValidationErrors, checkUserReview);
router.post('/', [
  ...validateReview,
  body('bookId').isMongoId().withMessage('Valid book ID is required')
], handleValidationErrors, createReview);
router.put('/:id', validateObjectId('id'), validateReviewUpdate, handleValidationErrors, updateReview);
router.delete('/:id', validateObjectId('id'), handleValidationErrors, deleteReview);
router.post('/:id/helpful', validateObjectId('id'), handleValidationErrors, markHelpful);

module.exports = router;
