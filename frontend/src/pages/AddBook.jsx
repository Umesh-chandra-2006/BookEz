import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksAPI } from '../services/api'
import { BookOpen, Save, X, Plus, Minus } from 'lucide-react'

const AddBook = () => {
  // Defensive: get theme context
  let theme = {};
  try {
    // Dynamically require useTheme if available
    // eslint-disable-next-line global-require
    theme = require('../contexts/ThemeContext').useTheme();
    theme = theme.theme || {};
  } catch (e) {
    console.warn('Theme context not found:', e);
    theme = { bg: { primary: '', secondary: '', accent: '', input: '' }, text: { primary: '', secondary: '', accent: '' }, border: { input: '' } };
  }
  console.log('AddBook theme:', theme);
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    description: '',
    pages: '',
    publishedYear: '',
    language: 'English',
    tags: []
  })
  const [currentTag, setCurrentTag] = useState('')

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Technology', 'Self-Help',
    'Business', 'Philosophy', 'Poetry', 'Drama', 'Adventure',
    'Horror', 'Crime', 'Thriller', 'Comedy', 'Educational',
    'Religion', 'Health', 'Travel', 'Art', 'Music', 'Sports'
  ]

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
    'Dutch', 'Swedish', 'Norwegian', 'Other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.title.trim()) {
        setError('Title is required')
        return
      }
      if (!formData.author.trim()) {
        setError('Author is required')
        return
      }
      if (!formData.genre) {
        setError('Genre is required')
        return
      }
      if (!formData.description.trim()) {
        setError('Description is required')
        return
      }
      if (formData.pages && (isNaN(formData.pages) || parseInt(formData.pages) < 1)) {
        setError('Pages must be a valid positive number')
        return
      }
      if (formData.publishedYear && (isNaN(formData.publishedYear) || parseInt(formData.publishedYear) < 1000 || parseInt(formData.publishedYear) > new Date().getFullYear())) {
        setError('Published year must be a valid year')
        return
      }

      // Prepare data
      const bookData = {
        ...formData,
        pages: formData.pages ? parseInt(formData.pages) : undefined,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : undefined,
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        isbn: formData.isbn.trim() || undefined
      }

      const response = await booksAPI.create(bookData)
      
      if (response.success) {
        navigate(`/books/${response.book._id}`)
      } else {
        setError(response.message || 'Failed to create book')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while creating the book')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/books')
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${theme.bg.primary}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${theme.text.primary} mb-4 flex items-center justify-center`}>
          <BookOpen className={`h-8 w-8 ${theme.text.accent} mr-3`} />
          Add New Book
        </h1>
        <p className={`${theme.text.secondary}`}>Share a great book with the community</p>
      </div>

      {/* Form */}
      <div className={`${theme.bg.secondary} rounded-lg shadow-md p-8`}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
                placeholder="Enter the book title"
              />
            </div>

            <div>
              <label htmlFor="author" className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Author *
              </label>
              <input
                id="author"
                name="author"
                type="text"
                required
                value={formData.author}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
                placeholder="Enter the author's name"
              />
            </div>

            <div>
              <label htmlFor="isbn" className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                ISBN
              </label>
              <input
                id="isbn"
                name="isbn"
                type="text"
                value={formData.isbn}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
                placeholder="Enter ISBN (optional)"
              />
            </div>

            <div>
              <label htmlFor="genre" className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Genre *
              </label>
              <select
                id="genre"
                name="genre"
                required
                value={formData.genre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
              >
                <option value="">Select a genre</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pages" className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Number of Pages
              </label>
              <input
                id="pages"
                name="pages"
                type="number"
                min="1"
                value={formData.pages}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
                placeholder="Enter number of pages"
              />
            </div>

            <div>
              <label htmlFor="publishedYear" className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Published Year
              </label>
              <input
                id="publishedYear"
                name="publishedYear"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={formData.publishedYear}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
                placeholder="Enter published year"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="language" className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                Language
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
              >
                {languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
              placeholder="Enter a description of the book..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
              Tags
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
                placeholder="Add tags (e.g., programming, bestseller, award-winning)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-3 py-1 ${theme.bg.accent} ${theme.text.accent} text-sm rounded-full`}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className={`ml-2 ${theme.text.accent} hover:${theme.text.primary}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex justify-end space-x-4 pt-6 border-t ${theme.border.input}`}>
            <button
              type="button"
              onClick={handleCancel}
              className={`px-6 py-2 border ${theme.border.input} ${theme.text.secondary} rounded-md hover:${theme.bg.input} transition-colors flex items-center`}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Add Book
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddBook
