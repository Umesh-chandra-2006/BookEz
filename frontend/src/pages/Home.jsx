import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { booksAPI } from '../services/api'
import { ArrowRight, Star, TrendingUp, BookOpen, Users, Award, Sparkles, Heart, MessageCircle } from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()
  const { theme } = useTheme()
  const [popularBooks, setPopularBooks] = useState([])
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalReviews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const response = await booksAPI.getPopular(6)
        setPopularBooks(response.books || [])
      } catch (error) {
        console.error('Error fetching popular books:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularBooks()
  }, [])

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : theme.isDark ? 'text-gray-600' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      {/* Hero Section */}
      <div className={`relative overflow-hidden ${theme.isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900'
      }`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 ${theme.isDark ? 'bg-purple-500' : 'bg-blue-500'} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${theme.isDark ? 'bg-pink-500' : 'bg-purple-500'} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000`}></div>
          <div className={`absolute top-40 left-40 w-80 h-80 ${theme.isDark ? 'bg-blue-500' : 'bg-pink-500'} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000`}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-white/90 font-medium">Join 10,000+ Book Lovers</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">
              Discover Your Next
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-gradient">
                Literary Adventure
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-white/80 max-w-4xl mx-auto leading-relaxed">
              Connect with passionate readers, share honest reviews, and uncover hidden gems in our vibrant literary community
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/books"
                className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25 inline-flex items-center justify-center"
              >
                <BookOpen className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Explore Books
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center justify-center"
                >
                  <Users className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Join Community
                </Link>
              )}
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  10,000+
                </div>
                <div className="text-white/70 font-medium">Books</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  5,000+
                </div>
                <div className="text-white/70 font-medium">Readers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  25,000+
                </div>
                <div className="text-white/70 font-medium">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-20 ${theme.bg.secondary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${theme.text.primary} mb-6`}>
              Why BookEz Stands Out
            </h2>
            <p className={`text-xl ${theme.text.secondary} max-w-3xl mx-auto leading-relaxed`}>
              Experience the perfect blend of discovery, community, and personalized recommendations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`${theme.card.bg} p-8 rounded-2xl ${theme.border.primary} border-2 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-2xl`}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>
                Curated Library
              </h3>
              <p className={`${theme.text.secondary} leading-relaxed`}>
                Explore our handpicked collection of exceptional books across all genres, with detailed insights and community ratings
              </p>
            </div>
            
            <div className={`${theme.card.bg} p-8 rounded-2xl ${theme.border.primary} border-2 hover:border-purple-500/50 transition-all duration-300 group hover:shadow-2xl`}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>
                Authentic Reviews
              </h3>
              <p className={`${theme.text.secondary} leading-relaxed`}>
                Read genuine, thoughtful reviews from passionate readers and share your own literary experiences
              </p>
            </div>
            
            <div className={`${theme.card.bg} p-8 rounded-2xl ${theme.border.primary} border-2 hover:border-green-500/50 transition-all duration-300 group hover:shadow-2xl`}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>
                Vibrant Community
              </h3>
              <p className={`${theme.text.secondary} leading-relaxed`}>
                Connect with like-minded readers, join discussions, and discover your next favorite through community recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Books Section */}
      <div className={`py-20 ${theme.bg.primary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className={`text-4xl font-bold ${theme.text.primary} mb-4`}>
                Trending Reads
              </h2>
              <p className={`text-lg ${theme.text.secondary}`}>
                Discover what the community is loving right now
              </p>
            </div>
            <Link
              to="/books"
              className={`${theme.accent.primary} hover:text-blue-600 font-bold text-lg inline-flex items-center group`}
            >
              View all books
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className={`${theme.card.bg} rounded-2xl ${theme.border.primary} border-2 overflow-hidden animate-pulse`}>
                  <div className="h-64 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularBooks.length > 0 ? (
                popularBooks.map((book) => (
                  <Link
                    key={book._id}
                    to={`/books/${book._id}`}
                    className={`group ${theme.card.bg} rounded-2xl ${theme.border.primary} border-2 overflow-hidden hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2`}
                  >
                    <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-6">
                      <h3 className={`text-xl font-bold ${theme.text.primary} mb-2 group-hover:text-blue-500 transition-colors line-clamp-2`}>
                        {book.title}
                      </h3>
                      <p className={`${theme.text.secondary} mb-4 font-medium`}>by {book.author}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {renderStars(book.averageRating || 0)}
                          <span className={`text-sm ${theme.text.secondary} ml-2`}>
                            ({book.totalReviews || 0} reviews)
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-orange-500 font-medium">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Trending
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <BookOpen className={`h-20 w-20 ${theme.text.secondary} mx-auto mb-6`} />
                  <h3 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>No books found</h3>
                  <p className={`${theme.text.secondary} text-lg mb-6`}>Be the first to add a book to the collection!</p>
                  <Link
                    to="/add-book"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Add First Book
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className={`relative overflow-hidden ${theme.isDark 
          ? 'bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700'
        } py-20`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Begin Your Literary Journey?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of passionate readers and discover your next obsession in our thriving community
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="group bg-white text-purple-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center justify-center"
              >
                <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Start Reading Free
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/books"
                className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center justify-center"
              >
                <BookOpen className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Browse Library
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
