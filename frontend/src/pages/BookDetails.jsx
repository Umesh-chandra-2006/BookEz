import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { booksAPI, reviewsAPI } from '../services/api'
import { 
  BookOpen, Star, User, Clock, ThumbsUp, Edit, Trash2, 
  Calendar, Globe, Hash, MessageSquare, AlertTriangle
} from 'lucide-react'

const BookDetails = () => {
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
  }, [id, isAuthenticated])

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

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const response = await reviewsAPI.getForBook(id, { limit: 10 })
      setReviews(response.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const checkUserReview = async () => {
    try {
      const response = await reviewsAPI.checkUserReview(id)
      if (response.hasReviewed) {
        // Fetch the user's review
        const myReviews = await reviewsAPI.getMy({ limit: 100 })
        const myReviewForThisBook = myReviews.reviews?.find(review => review.book._id === id)
        setUserReview(myReviewForThisBook)
      }
    } catch (error) {
      console.error('Error checking user review:', error)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewSubmitting(true)

    try {
      const reviewData = {
        ...reviewFormData,
        bookId: id
      }

      if (userReview) {
        // Update existing review
        await reviewsAPI.update(userReview._id, {
          rating: reviewFormData.rating,
          comment: reviewFormData.comment,
          hasSpoilers: reviewFormData.hasSpoilers
        })
      } else {
        // Create new review
        await reviewsAPI.create(reviewData)
      }

      // Refresh data
      await Promise.all([
        fetchBookDetails(),
        fetchReviews(),
        checkUserReview()
      ])
      
      setShowReviewForm(false)
      setReviewFormData({ rating: 5, comment: '', hasSpoilers: false })
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!userReview || !window.confirm('Are you sure you want to delete your review?')) {
      return
    }

    try {
      await reviewsAPI.delete(userReview._id)
      setUserReview(null)
      await Promise.all([fetchBookDetails(), fetchReviews()])
    } catch (error) {
      setError('Failed to delete review')
    }
  }

  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated) return

    try {
      await reviewsAPI.markHelpful(reviewId)
      fetchReviews() // Refresh reviews to show updated helpful count
    } catch (error) {
      console.error('Error marking review as helpful:', error)
    }
  }

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={readonly ? "button" : "button"}
            disabled={readonly}
            onClick={() => !readonly && onRatingChange(star)}
            className={`${
              star <= rating
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
            } ${readonly ? 'cursor-default' : 'hover:text-yellow-400 cursor-pointer'}`}
          >
            <Star className="h-5 w-5" />
          </button>
        ))}
      </div>
    )
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Book Not Found</h2>
        <p className="text-gray-600">{error}</p>
        <Link to="/books" className="text-primary-600 hover:underline mt-4 inline-block">
          Browse all books
        </Link>
      </div>
    )
  }

  if (!book) return null

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Book Header */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover Placeholder */}
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
              <BookOpen className="h-24 w-24 text-primary-600" />
            </div>
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <StarRating rating={Math.round(book.averageRating || 0)} readonly />
                  <span className="ml-2 text-lg font-medium text-gray-800">
                    {book.averageRating ? book.averageRating.toFixed(1) : 'No ratings'}
                  </span>
                </div>
                <span className="text-gray-500">
                  ({book.totalReviews || 0} review{book.totalReviews !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Genre and Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-4 py-2 bg-primary-600 text-white rounded-full font-medium">
                  {book.genre}
                </span>
                {book.tags?.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Book Details */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                {book.pages && (
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {book.pages} pages
                  </div>
                )}
                {book.publishedYear && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {book.publishedYear}
                  </div>
                )}
                {book.language && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    {book.language}
                  </div>
                )}
                {book.isbn && (
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    {book.isbn}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
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
                          comment: userReview.comment,
                          hasSpoilers: userReview.hasSpoilers
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <StarRating
                rating={reviewFormData.rating}
                onRatingChange={(rating) => setReviewFormData(prev => ({...prev, rating}))}
              />
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="comment"
                rows={5}
                value={reviewFormData.comment}
                onChange={(e) => setReviewFormData(prev => ({...prev, comment: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="hasSpoilers" className="ml-2 text-sm text-gray-700 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                This review contains spoilers
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">
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
              <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.user.name}</p>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} readonly />
                        <span className="text-sm text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.hasSpoilers && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                    <div className="flex items-center text-yellow-800">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Spoiler Warning</span>
                    </div>
                  </div>
                )}

                <p className="text-gray-700 mb-3">{review.comment}</p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    disabled={!isAuthenticated}
                    className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-colors disabled:cursor-not-allowed"
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
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-400">Be the first to share your thoughts about this book!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookDetails
