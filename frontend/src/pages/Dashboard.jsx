import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { BookOpen, User } from 'lucide-react'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className={`min-h-screen ${theme.bg.primary} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BookOpen className={`h-16 w-16 ${theme.text.accent}`} />
          </div>
          <h1 className={`text-4xl font-bold ${theme.text.primary} mb-4`}>
            Welcome to BookEz Dashboard
          </h1>
          <p className={`text-lg ${theme.text.secondary}`}>
            Your personal book review hub
          </p>
        </div>

        {/* User Info Card */}
  <div className={`${theme.bg.secondary} rounded-lg shadow-lg p-8 mb-8`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 ${theme.bg.accent} rounded-full flex items-center justify-center`}>
              <User className={`h-8 w-8 ${theme.text.primary}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.primary}`}>
                Hello, {user?.name}!
              </h2>
              <p className={`${theme.text.secondary}`}>
                {user?.email}
              </p>
              <p className={`text-sm ${theme.text.tertiary}`}>
                Role: {user?.role || 'User'}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Logout
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Add Book
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${theme.bg.secondary} rounded-lg shadow p-6 text-center`}>
            <div className={`text-3xl font-bold ${theme.text.accent} mb-2`}>0</div>
            <div className={`${theme.text.secondary}`}>Books Added</div>
          </div>
          <div className={`${theme.bg.secondary} rounded-lg shadow p-6 text-center`}>
            <div className={`text-3xl font-bold ${theme.text.accent} mb-2`}>0</div>
            <div className={`${theme.text.secondary}`}>Reviews Written</div>
          </div>
          <div className={`${theme.bg.secondary} rounded-lg shadow p-6 text-center`}>
            <div className={`text-3xl font-bold ${theme.text.accent} mb-2`}>0</div>
            <div className={`${theme.text.secondary}`}>Average Rating</div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className={`${theme.bg.secondary} rounded-lg shadow-lg p-8 text-center`}>
          <h3 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>
            More Features Coming Soon!
          </h3>
          <p className={`${theme.text.secondary}`}>
            Book management, reviews, reading lists, and much more...
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
