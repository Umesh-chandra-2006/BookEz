import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { booksAPI, reviewsAPI } from '../services/api'
import { 
  BookOpen, Star, User, Clock, ThumbsUp, Edit, Trash2, 
  Calendar, Globe, Hash, MessageSquare, AlertTriangle
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import StarRating from '../components/UI/StarRating'

const BookDetails = () => {
  // Handle review form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setError("");
    try {
      const reviewPayload = {
        bookId: id,
        rating: reviewFormData.rating,
        reviewText: reviewFormData.comment,
        spoilerAlert: reviewFormData.hasSpoilers,
      };
      let response;
      if (userReview) {
        // Update existing review
        response = await reviewsAPI.update(userReview._id, reviewPayload);
      } else {
        // Create new review
        response = await reviewsAPI.create(reviewPayload);
      }
      setShowReviewForm(false);
      setReviewFormData({ rating: 5, comment: '', hasSpoilers: false });
      fetchReviews();
      checkUserReview();
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };
  // Fetch the current user's review for this book
  const checkUserReview = async () => {
    try {
      const response = await reviewsAPI.checkUserReview(id)
      if (response.review) {
        setUserReview(response.review)
      } else {
        setUserReview(null)
      }
    } catch (error) {
      // Optionally handle error, but don't block page
      setUserReview(null)
    }
  }
  const { theme } = useTheme()
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [userReview, setUserReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: '',
    hasSpoilers: false
  })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)


  useEffect(() => {
    if (id) {
      fetchBookDetails()
      fetchReviews()
      if (isAuthenticated) {
        checkUserReview()
      }
    }
    // eslint-disable-next-line
  }, [id, isAuthenticated])

  // Fetch reviews for the current book
  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const response = await reviewsAPI.getForBook(id)
      // The backend returns { success, count, pagination, data: { reviews, ... } }
      const reviewsArr = (response.data && response.data.reviews) || [];
      console.log('Fetched reviews:', reviewsArr);
      setReviews(reviewsArr)
    } catch (error) {
      setError('Failed to fetch reviews')
      setReviews([])
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchBookDetails = async () => {
  try {
    const response = await booksAPI.getById(id)
    setBook(response.book)
  } catch (error) {
    setError('Failed to fetch book details')
    console.error('Error fetching book:', error)
  } finally {
    setLoading(false)
  }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && !book) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>Book Not Found</h2>
        <p className={`${theme.text.secondary}`}>{error}</p>
        <Link to="/books" className="text-primary-600 hover:underline mt-4 inline-block">
          Browse all books
        </Link>
      </div>
    )
  }

  if (!book) return null

  return (
    <div className={`max-w-6xl mx-auto space-y-8 ${theme.bg.primary}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Book Header */}
      <div className={`${theme.bg.secondary} rounded-lg shadow-md p-8`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover Placeholder */}
          <div className="lg:col-span-1">
            <div className={`aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-200 ${theme.bg.accent} rounded-lg flex items-center justify-center`}>
              <BookOpen className={`h-24 w-24 ${theme.text.accent}`} />
            </div>
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className={`text-4xl font-bold ${theme.text.primary} mb-2`}>{book.title}</h1>
              <p className={`${theme.text.secondary} text-xl mb-4`}>by {book.author}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <StarRating rating={Math.round(book.averageRating || 0)} readonly />
                  <span className={`ml-2 text-lg font-medium ${theme.text.primary}`}>
                    {book.averageRating ? book.averageRating.toFixed(1) : 'No ratings'}
                  </span>
                </div>
                <span className={`${theme.text.tertiary}`}>
                  ({book.totalReviews || 0} review{book.totalReviews !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Genre and Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-4 py-2 bg-primary-600 text-white rounded-full font-medium">
                  {book.genre}
                </span>
                {book.tags?.map((tag, index) => (
                  <span key={index} className={`px-3 py-1 ${theme.bg.input} ${theme.text.secondary} rounded-full text-sm`}>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Book Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {book.pages && (
                  <div className={`flex items-center ${theme.text.secondary}`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    {book.pages} pages
                  </div>
                )}
                {book.publishedYear && (
                  <div className={`flex items-center ${theme.text.secondary}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {book.publishedYear}
                  </div>
                )}
                {book.language && (
                  <div className={`flex items-center ${theme.text.secondary}`}>
                    <Globe className="h-4 w-4 mr-2" />
                    {book.language}
                  </div>
                )}
                {book.isbn && (
                  <div className={`flex items-center ${theme.text.secondary}`}>
                    <Hash className="h-4 w-4 mr-2" />
                    {book.isbn}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>Description</h3>
              <p className={`${theme.text.secondary} leading-relaxed`}>{book.description}</p>
            </div>

            {/* Action Buttons */}
            {isAuthenticated && (
              <div className="flex space-x-4 pt-4">
                {userReview ? (
                  <>
                    <button
                      onClick={() => {
                        setReviewFormData({
                          rating: userReview.rating,
                          comment: userReview.reviewText,
                          hasSpoilers: userReview.spoilerAlert
                        })
                        setShowReviewForm(true)
                      }}
                      className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit My Review
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Review
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Write a Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className={`${theme.bg.secondary} rounded-lg shadow-md p-6`}>
          <h3 className={`text-xl font-semibold ${theme.text.primary} mb-4`}>
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Rating
              </label>
              <StarRating
                rating={reviewFormData.rating}
                onRatingChange={(rating) => setReviewFormData(prev => ({...prev, rating}))}
              />
            </div>

            <div>
              <label htmlFor="comment" className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Your Review
              </label>
              <textarea
                id="comment"
                rows={5}
                value={reviewFormData.comment}
                onChange={(e) => setReviewFormData(prev => ({...prev, comment: e.target.value}))}
                className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
                placeholder="Share your thoughts about this book..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="hasSpoilers"
                type="checkbox"
                checked={reviewFormData.hasSpoilers}
                onChange={(e) => setReviewFormData(prev => ({...prev, hasSpoilers: e.target.checked}))}
                className={`h-4 w-4 text-primary-600 focus:ring-primary-500 ${theme.border.input} rounded`}
              />
              <label htmlFor="hasSpoilers" className={`ml-2 text-sm ${theme.text.secondary} flex items-center`}>
                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                This review contains spoilers
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className={`px-4 py-2 border ${theme.border.input} ${theme.text.secondary} rounded-md hover:${theme.bg.input} transition-colors`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {reviewSubmitting ? 'Submitting...' : (userReview ? 'Update Review' : 'Submit Review')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews Section */}
      <div className={`${theme.bg.secondary} rounded-lg shadow-md p-6`}>
        <h3 className={`text-2xl font-semibold ${theme.text.primary} mb-6`}>
          Reviews ({book.totalReviews || 0})
        </h3>

        {reviewsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse border-b border-gray-200 pb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className={`border-b border-gray-200 pb-6 last:border-b-0`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`bg-primary-100 rounded-full p-2`}>
                      <User className={`h-5 w-5 ${theme.text.accent}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${theme.text.primary}`}>
                        {review.user && review.user.name ? review.user.name : 'Unknown User'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} readonly />
                        <span className={`text-sm ${theme.text.secondary}`}>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>


                {review.spoilerAlert && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                    <div className="flex items-center text-yellow-800">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Spoiler Warning</span>
                    </div>
                  </div>
                )}

                <p className={`${theme.text.primary} mb-3`}>{review.reviewText}</p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    disabled={!isAuthenticated}
                    className={`flex items-center space-x-2 ${theme.text.secondary} hover:${theme.text.accent} transition-colors disabled:cursor-not-allowed`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm">
                      Helpful ({review.helpfulCount || 0})
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className={`h-16 w-16 ${theme.text.secondary} mx-auto mb-4`} />
            <p className={`${theme.text.secondary} text-lg`}>No reviews yet</p>
            <p className={`${theme.text.tertiary}`}>Be the first to share your thoughts about this book!</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default BookDetails
