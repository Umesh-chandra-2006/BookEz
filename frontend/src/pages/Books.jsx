import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { booksAPI } from '../services/api'
import { Search, Filter, BookOpen, Star, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const Books = () => {
  const { theme } = useTheme()
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)
  const booksPerPage = 5 // Assignment requirement: 5 books per page


  useEffect(() => {
    fetchGenres()
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [currentPage, selectedGenre, sortBy, searchQuery])


  const fetchGenres = async () => {
    try {
      const response = await booksAPI.getGenres()
      // Support both { genres: [...] } and { data: { genres: [...] } }
      setGenres((response.data && response.data.genres) || response.genres || [])
    } catch (error) {
      console.error('Error fetching genres:', error)
    }
  }


  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: booksPerPage,
        sort: sortBy
      }

      if (selectedGenre) {
        params.genre = selectedGenre
      }

      let response;
      if (searchQuery.trim().length > 0) {
        response = await booksAPI.search({ ...params, q: searchQuery.trim() })
      } else {
        response = await booksAPI.getAll(params)
      }

      setBooks(response.books || [])
      setTotalPages(response.totalPages || 1)
      setTotalBooks(response.total || 0)
      setError('') // Clear error on successful fetch
    } catch (error) {
      setError('Failed to fetch books')
      setBooks([])
      setTotalPages(1)
      setTotalBooks(0)
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchBooks()
  }

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre)
    setCurrentPage(1)
  }

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  const BookCard = ({ book }) => (
    <Link
      to={`/books/${book._id}`}
      className={`${theme.bg.secondary} ${theme.text.primary} rounded-lg shadow-md hover:shadow-lg transition-shadow p-6`}
    >
      <div className="space-y-3">
        <h3 className={`text-xl font-semibold ${theme.text.primary} line-clamp-2`}>
          {book.title}
        </h3>
        <p className={`${theme.text.secondary}`}>by {book.author}</p>
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {book.genre}
          </span>
          {book.averageRating > 0 && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className={`ml-1 text-sm ${theme.text.secondary}`}>
                {book.averageRating.toFixed(1)} ({book.totalReviews})
              </span>
            </div>
          )}
        </div>
        <p className={`${theme.text.tertiary || 'text-gray-500'} text-sm line-clamp-3`}>
          {book.description}
        </p>
        <div className={`flex items-center justify-between text-sm ${theme.text.tertiary || 'text-gray-500'}`}>
          <span>{book.pages} pages</span>
          <span>{book.publishedYear}</span>
        </div>
      </div>
    </Link>
  )

  const BookListItem = ({ book }) => (
    <Link
      to={`/books/${book._id}`}
      className={`${theme.bg.secondary} ${theme.text.primary} rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex space-x-6`}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-xl font-semibold ${theme.text.primary}`}>{book.title}</h3>
            <p className={`${theme.text.secondary}`}>by {book.author}</p>
          </div>
          {book.averageRating > 0 && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className={`ml-1 text-sm ${theme.text.secondary}`}>
                {book.averageRating.toFixed(1)} ({book.totalReviews})
              </span>
            </div>
          )}
        </div>
        <p className={`${theme.text.tertiary || 'text-gray-500'} text-sm line-clamp-2`}>{book.description}</p>
        <div className={`flex items-center space-x-4 text-sm ${theme.text.tertiary || 'text-gray-500'}`}>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            {book.genre}
          </span>
          <span>{book.pages} pages</span>
          <span>{book.publishedYear}</span>
        </div>
      </div>
    </Link>
  )

  return (
    <div className={`space-y-8 ${theme.bg.primary}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${theme.text.primary} mb-4`}>Browse Books</h1>
        <p className={`${theme.text.secondary}`}>Discover and explore our collection of books</p>
      </div>

      {/* Search and Filters */}
      <div className={`${theme.bg.secondary} rounded-lg shadow-md p-6`}>
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.text.secondary} h-5 w-5`} />
              <input
                type="text"
                placeholder="Search books by title, author, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${theme.border.primary} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${theme.bg.tertiary || ''} ${theme.text.primary}`}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Genre Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedGenre}
              onChange={(e) => handleGenreChange(e.target.value)}
              className={`border ${theme.border.primary} rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${theme.bg.tertiary || ''} ${theme.text.primary}`}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.name} value={genre.name}>
                  {genre.name} ({genre.count})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${theme.text.secondary}`}>Sort by:</span>
            <button
              onClick={() => handleSortChange('newest')}
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === 'newest'
                  ? 'bg-blue-600 text-white'
                  : `${theme.bg.tertiary || 'bg-gray-100'} ${theme.text.secondary} hover:bg-gray-200`
              }`}
            >
              Newest {sortBy === 'newest' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('rating')}
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === 'rating'
                  ? 'bg-blue-600 text-white'
                  : `${theme.bg.tertiary || 'bg-gray-100'} ${theme.text.secondary} hover:bg-gray-200`
              }`}
            >
              Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('title')}
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === 'title'
                  ? 'bg-blue-600 text-white'
                  : `${theme.bg.tertiary || 'bg-gray-100'} ${theme.text.secondary} hover:bg-gray-200`
              }`}
            >
              Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : `${theme.bg.tertiary || 'bg-gray-100'} ${theme.text.secondary} hover:bg-gray-200`
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : `${theme.bg.tertiary || 'bg-gray-100'} ${theme.text.secondary} hover:bg-gray-200`
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className={`${theme.text.secondary}`}>
          Showing {books.length} of {totalBooks} books
          {selectedGenre && ` in ${selectedGenre}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Error State */}
      {error && books.length === 0 && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className={`${theme.bg.secondary} rounded-lg shadow-md p-6 animate-pulse`}>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Books Grid/List */}
          {books.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {books.map((book) =>
                viewMode === 'grid' ? (
                  <BookCard key={book._id} book={book} />
                ) : (
                  <BookListItem key={book._id} book={book} />
                )
              )}
            </div>
          ) : (
            <div className={`${theme.bg.secondary} rounded-lg shadow-md p-12 text-center`}>
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className={`text-xl font-semibold ${theme.text.primary} mb-2`}>No books found</h3>
              <p className={`${theme.text.secondary} mb-4`}>
                {searchQuery || selectedGenre
                  ? 'Try adjusting your search criteria'
                  : 'Be the first to add a book to the collection!'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-2 border ${theme.border.primary} rounded-md ${theme.text.secondary} hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const page = Math.max(1, currentPage - 2) + index
                  if (page > totalPages) return null
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : `${theme.bg.tertiary || 'bg-gray-100'} ${theme.text.secondary} hover:bg-gray-200`
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-2 border ${theme.border.primary} rounded-md ${theme.text.secondary} hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Books
