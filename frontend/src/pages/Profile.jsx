import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Edit, Save, X, BookOpen, Star } from 'lucide-react'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    favoriteGenres: user?.favoriteGenres || []
  })

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Technology', 'Self-Help',
    'Business', 'Philosophy', 'Poetry', 'Drama', 'Adventure',
    'Horror', 'Crime', 'Thriller', 'Comedy', 'Educational',
    'Religion', 'Health', 'Travel', 'Art', 'Music', 'Sports'
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleGenreToggle = (genre) => {
    const updatedGenres = formData.favoriteGenres.includes(genre)
      ? formData.favoriteGenres.filter(g => g !== genre)
      : [...formData.favoriteGenres, genre]
    
    setFormData({
      ...formData,
      favoriteGenres: updatedGenres
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      favoriteGenres: user?.favoriteGenres || []
    })
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <User className="h-8 w-8 text-primary-600 mr-3" />
            My Profile
          </h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user?.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="flex items-center text-gray-600 py-2">
                  <Mail className="h-4 w-4 mr-2" />
                  {user?.email}
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell us about yourself and your reading interests..."
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user?.bio || 'No bio provided'}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reading Preferences</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favorite Genres
                </label>
                {isEditing ? (
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {genres.map((genre) => (
                        <label key={genre} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.favoriteGenres.includes(genre)}
                            onChange={() => handleGenreToggle(genre)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{genre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user?.favoriteGenres?.length > 0 ? (
                      user.favoriteGenres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No favorite genres selected</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-800 mb-3">Account Statistics</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Books Added
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {user?.stats?.booksCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2" />
                      Reviews Written
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {user?.stats?.reviewsCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default Profile
