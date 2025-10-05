
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { User, Mail, Edit, Save, X, BookOpen, Star } from 'lucide-react'

const Profile = () => {
  const { theme } = useTheme();
  console.log('Profile theme:', theme);

  const { user, updateProfile, loading } = useAuth();
  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  // Defensive: check user
  if (!user) {
    console.warn('User not found in context');
    return <div className="text-center py-12">User not found. Please log in again.</div>;
  }
  const [isEditing, setIsEditing] = useState(false)
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
  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleGenreToggle = (genre) => {
    setFormData((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g) => g !== genre)
        : [...prev.favoriteGenres, genre],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    const result = await updateProfile({
      name: formData.name.trim(),
      bio: formData.bio,
      favoriteGenres: formData.favoriteGenres,
    });
    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setError(result.message || 'Profile update failed');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      favoriteGenres: user?.favoriteGenres || [],
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${theme.bg.primary}`}>
      <div className={`${theme.bg.secondary} rounded-lg shadow-md p-6`}>
        <div className="flex items-center mb-8">
          <div className="bg-primary-600 rounded-full h-20 w-20 flex items-center justify-center mr-6">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className={`text-3xl font-bold ${theme.text.primary}`}>{user.name}</h2>
            <p className={`${theme.text.secondary}`}>{user.email}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">{success}</div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border ${theme.border.input} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${theme.bg.input} ${theme.text.primary}`}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>Favorite Genres</label>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    type="button"
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`px-3 py-1 rounded-full border ${theme.border.input} text-sm ${formData.favoriteGenres.includes(genre) ? 'bg-primary-600 text-white' : `${theme.bg.input} ${theme.text.secondary}`}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className={`px-4 py-2 border ${theme.border.input} ${theme.text.secondary} rounded-md hover:${theme.bg.input} transition-colors`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-4">
              <span className={`block text-sm font-medium ${theme.text.secondary}`}>Name</span>
              <span className={`block text-lg font-semibold ${theme.text.primary}`}>{user.name}</span>
            </div>
            <div className="mb-4">
              <span className={`block text-sm font-medium ${theme.text.secondary}`}>Email</span>
              <span className={`block text-lg font-semibold ${theme.text.primary}`}>{user.email}</span>
            </div>
            <div className="mb-4">
              <span className={`block text-sm font-medium ${theme.text.secondary}`}>Bio</span>
              <span className={`block text-lg ${theme.text.primary}`}>{user.bio || 'No bio yet.'}</span>
            </div>
            <div className="mb-4">
              <span className={`block text-sm font-medium ${theme.text.secondary}`}>Favorite Genres</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.favoriteGenres && user.favoriteGenres.length > 0 ? (
                  user.favoriteGenres.map((genre) => (
                    <span key={genre} className="px-3 py-1 rounded-full bg-primary-600 text-white text-sm">{genre}</span>
                  ))
                ) : (
                  <span className={`${theme.text.secondary}`}>No favorite genres selected.</span>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2 inline" /> Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile
