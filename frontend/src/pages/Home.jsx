import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { booksAPI } from '../services/api'
import { BookOpen, Star, Users, TrendingUp, ArrowRight } from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()
  const [popularBooks, setPopularBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const response = await booksAPI.getPopular(5)
        setPopularBooks(response.books || [])
      } catch (error) {
        console.error('Error fetching popular books:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularBooks()
  }, [])

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            Discover Your Next Great Read
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of book lovers sharing reviews, discovering new books, 
            and building their reading journey together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/books"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Books
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Join Community
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <BookOpen className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">10,000+</h3>
          <p className="text-gray-600">Books in Collection</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">5,000+</h3>
          <p className="text-gray-600">Active Readers</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Star className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">25,000+</h3>
          <p className="text-gray-600">Reviews Shared</p>
        </div>
      </section>

      {/* Popular Books Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
            Popular Books
          </h2>
          <Link
            to="/books"
            className="text-primary-600 hover:text-primary-700 font-semibold flex items-center"
          >
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularBooks.length > 0 ? (
              popularBooks.map((book) => (
                <Link
                  key={book._id}
                  to={`/books/${book._id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 mb-2">by {book.author}</p>
                  <p className="text-sm text-gray-500 mb-3">{book.genre}</p>
                  {book.averageRating > 0 && (
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-500 mr-2">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-sm text-gray-600">
                          {book.averageRating.toFixed(1)} ({book.totalReviews} reviews)
                        </span>
                      </div>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No books found</p>
                <p className="text-gray-400">Be the first to add a book to the collection!</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-gray-600 mb-6">
            Join our community of book lovers and start sharing your thoughts on your favorite reads.
          </p>
          <Link
            to="/register"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center"
          >
            Sign Up Free <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </section>
      )}
    </div>
  )
}

export default Home
