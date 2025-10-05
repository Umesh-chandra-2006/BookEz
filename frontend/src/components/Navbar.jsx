import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { BookOpen, User, LogOut, Plus, Home, Search } from 'lucide-react'
import ThemeToggle from './UI/ThemeToggle'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className={`${theme.bg.secondary} backdrop-blur-md shadow-lg border-b ${theme.border.primary} sticky top-0 z-50`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-110 transition-transform duration-200">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${theme.text.primary}`}>Book</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Ez</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 ${theme.text.secondary} hover:text-blue-500 transition-colors font-medium`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/books"
              className={`flex items-center space-x-2 ${theme.text.secondary} hover:text-blue-500 transition-colors font-medium`}
            >
              <Search className="h-4 w-4" />
              <span>Browse Books</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`${theme.text.secondary} hover:text-blue-500 transition-colors font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/add-book"
                  className={`flex items-center space-x-2 ${theme.text.secondary} hover:text-blue-500 transition-colors font-medium`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Book</span>
                </Link>
              </>
            ) : null}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 ${theme.text.secondary} hover:text-blue-500 transition-colors font-medium`}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:block">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 ${theme.text.secondary} hover:text-red-500 transition-colors font-medium`}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:block">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
