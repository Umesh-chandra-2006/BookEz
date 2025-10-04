import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { booksAPI, reviewsAPI, authAPI } from '../services/api'
import { BookOpen, Star, TrendingUp, Clock, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [myBooks, setMyBooks] = useState([])
  const [myReviews, setMyReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, myBooksRes, myReviewsRes] = await Promise.all([
          authAPI.getStats(),
          booksAPI.getByUser(user._id, { limit: 5 }),
          reviewsAPI.getMy({ limit: 5 })
        ])

        setStats(statsRes)
        setMyBooks(myBooksRes.books || [])
        setMyReviews(myReviewsRes.reviews || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's your reading activity and book collection overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BookOpen className="h-12 w-12 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-800">{stats.booksCount || 0}</h3>
              <p className="text-gray-600">Books Added</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Star className="h-12 w-12 text-yellow-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-800">{stats.reviewsCount || 0}</h3>
              <p className="text-gray-600">Reviews Written</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <TrendingUp className="h-12 w-12 text-green-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
              </h3>
              <p className="text-gray-600">Avg Rating Given</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Books */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <BookOpen className="h-6 w-6 text-primary-600 mr-2" />
            My Recent Books
          </h2>
          <Link
            to="/add-book"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Link>
        </div>

        {myBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBooks.map((book) => (
              <Link
                key={book._id}
                to={`/books/${book._id}`}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                <p className="text-gray-500 text-sm">{book.genre}</p>
                {book.averageRating > 0 && (
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {book.averageRating.toFixed(1)} ({book.totalReviews})
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven't added any books yet</p>
            <Link
              to="/add-book"
              className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Book
            </Link>
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Star className="h-6 w-6 text-primary-600 mr-2" />
          My Recent Reviews
        </h2>

        {myReviews.length > 0 ? (
          <div className="space-y-4">
            {myReviews.map((review) => (
              <div key={review._id} className="border-l-4 border-primary-600 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/books/${review.book._id}`}
                    className="font-semibold text-gray-800 hover:text-primary-600"
                  >
                    {review.book.title}
                  </Link>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{review.comment}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven't written any reviews yet</p>
            <Link
              to="/books"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Browse books to review
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
